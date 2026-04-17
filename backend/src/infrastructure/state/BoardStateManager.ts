import { StrokeData } from "../repositories/DrawingRepository";

export interface StrokeRecord extends StrokeData {
  id: string;
  userId: string;
}

export interface BoardState {
  strokes: StrokeRecord[];
  lastActiveAt: Date;
  dirty: boolean;
  strokeCountSinceLastSnapshot: number;
}

export class BoardStateManager {
  private static instance: BoardStateManager;
  private boards: Map<string, BoardState> = new Map();

  private constructor() {}

  public static getInstance(): BoardStateManager {
    if (!BoardStateManager.instance) {
      BoardStateManager.instance = new BoardStateManager();
    }
    return BoardStateManager.instance;
  }

  public getBoard(boardId: string): BoardState | undefined {
    const state = this.boards.get(boardId);
    if (state) {
      state.lastActiveAt = new Date();
    }
    return state;
  }

  public initializeBoard(boardId: string, initialStrokes: StrokeRecord[] = []): BoardState {
    const state: BoardState = {
      strokes: initialStrokes,
      lastActiveAt: new Date(),
      dirty: false,
      strokeCountSinceLastSnapshot: 0,
    };
    this.boards.set(boardId, state);
    return state;
  }

  public addStroke(boardId: string, stroke: StrokeRecord): void {
    const state = this.boards.get(boardId);
    if (state) {
      state.strokes.push(stroke);
      state.lastActiveAt = new Date();
      state.dirty = true;
      state.strokeCountSinceLastSnapshot++;
    }
  }

  public undoStroke(boardId: string, userId: string): string | null {
    const state = this.boards.get(boardId);
    if (!state) return null;

    const lastIdx = state.strokes.findLastIndex((s: StrokeRecord) => s.userId === userId);
    if (lastIdx === -1) return null;

    const deletedStroke = state.strokes.splice(lastIdx, 1)[0];
    state.lastActiveAt = new Date();
    state.dirty = true;
    state.strokeCountSinceLastSnapshot++;
    
    return deletedStroke.id;
  }

  public clearBoard(boardId: string): void {
    const state = this.boards.get(boardId);
    if (state) {
      state.strokes = [];
      state.lastActiveAt = new Date();
      state.dirty = true;
      state.strokeCountSinceLastSnapshot++;
    }
  }

  public getAllActiveBoards(): Map<string, BoardState> {
    return this.boards;
  }

  public removeBoard(boardId: string): void {
    this.boards.delete(boardId);
  }

  public resetSnapshotCounter(boardId: string): void {
    const state = this.boards.get(boardId);
    if (state) {
      state.strokeCountSinceLastSnapshot = 0;
      state.dirty = false;
    }
  }
}
