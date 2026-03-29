import { DrawingRepository, StrokeData } from "../../infrastructure/repositories/DrawingRepository";
import { BoardService } from "./BoardService";
import { BoardStateManager, StrokeRecord } from "../../infrastructure/state/BoardStateManager";
import { v4 as uuidv4 } from "uuid";

export class DrawingService {
  private stateManager = BoardStateManager.getInstance();
  private snapshotThreshold = 50; // Save to DB every 50 changes

  constructor(
    private drawingRepository: DrawingRepository,
    private boardService: BoardService
  ) {

    setInterval(() => this.backgroundSync(), 30000); // Every 30 seconds
  }

  async addStroke(
    boardId: string,
    userId: string,
    strokeData: StrokeData
  ): Promise<StrokeRecord> {
    await this.boardService.getBoardDetails(boardId, userId);

    const record: StrokeRecord = {
      id: uuidv4(),
      userId,
      ...strokeData
    };

    if (!this.stateManager.getBoard(boardId)) {
      await this.loadBoardIntoMemory(boardId);
    }

    this.stateManager.addStroke(boardId, record);
    
    const state = this.stateManager.getBoard(boardId);
    if (state && state.strokeCountSinceLastSnapshot >= this.snapshotThreshold) {
      this.triggerSnapshot(boardId);
    }

    return record;
  }

  async getHistory(
    boardId: string,
    userId: string
  ): Promise<StrokeRecord[]> {
    await this.boardService.getBoardDetails(boardId, userId);

    let state = this.stateManager.getBoard(boardId);
    if (!state) {
      state = await this.loadBoardIntoMemory(boardId);
    }

    return state.strokes;
  }

  async undoLast(
    boardId: string,
    userId: string
  ): Promise<{ deletedId: string | null }> {
    await this.boardService.getBoardDetails(boardId, userId);

    if (!this.stateManager.getBoard(boardId)) {
      await this.loadBoardIntoMemory(boardId);
    }

    const deletedId = this.stateManager.undoStroke(boardId, userId);
    return { deletedId };
  }

  async clearAll(boardId: string, userId: string): Promise<void> {
    const board = await this.boardService.getBoardDetails(boardId, userId);
    if (board.role !== "owner") throw new Error("Only owner can clear board");
    
    this.stateManager.clearBoard(boardId);
    await this.drawingRepository.clearSnapshot(boardId);
  }

  private async loadBoardIntoMemory(boardId: string) {
    const strokes = await this.drawingRepository.getSnapshot(boardId);
    return this.stateManager.initializeBoard(boardId, strokes);
  }

  private async triggerSnapshot(boardId: string) {
    const state = this.stateManager.getBoard(boardId);
    if (!state || !state.dirty) return;

    await this.drawingRepository.saveSnapshot(boardId, state.strokes);
    this.stateManager.resetSnapshotCounter(boardId);
  }

  private async backgroundSync() {
    const activeBoards = this.stateManager.getAllActiveBoards();
    const now = Date.now();
    const inactivityLimit = 5 * 60 * 1000; // 5 minutes

    for (const [boardId, state] of activeBoards.entries()) {
      if (state.dirty) {
        await this.triggerSnapshot(boardId);
      }
      if (now - state.lastActiveAt.getTime() > inactivityLimit) {
        this.stateManager.removeBoard(boardId);
        console.log(`[Cache Cleanup] Removed board ${boardId} from memory due to inactivity.`);
      }
    }
  }
}
