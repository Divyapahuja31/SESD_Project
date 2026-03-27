import { prisma } from "../database/prisma";
import { StrokeRecord } from "../state/BoardStateManager";

export interface StrokeData {
  points: number[][];
  color: string;
  size: number;
  tool?: string;
}

export class DrawingRepository {
  async saveSnapshot(boardId: string, strokes: StrokeRecord[]): Promise<void> {
    await prisma.boardSnapshot.upsert({
      where: { boardId },
      update: {
        strokes: strokes as any,
        updatedAt: new Date(),
      },
      create: {
        boardId,
        strokes: strokes as any,
      },
    });
  }

  async getSnapshot(boardId: string): Promise<StrokeRecord[]> {
    const snapshot = await prisma.boardSnapshot.findUnique({
      where: { boardId },
    });

    if (!snapshot) return [];

    return snapshot.strokes as unknown as StrokeRecord[];
  }

  async clearSnapshot(boardId: string): Promise<void> {
    await prisma.boardSnapshot.deleteMany({
      where: { boardId },
    });
  }
}
