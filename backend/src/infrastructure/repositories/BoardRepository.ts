import { prisma } from "../database/prisma";
import { Board } from "../../core/entities/Board";

export class BoardRepository {
  async createBoard(data: {
    id: string;
    title: string;
    ownerId: string;
  }): Promise<Board> {
    const created = await prisma.board.create({
      data: {
        id: data.id,
        title: data.title,
        ownerId: data.ownerId,
      },
    });

    return new Board(created.id, created.title, created.ownerId);
  }

  async addMember(data: {
    id: string;
    boardId: string;
    userId: string;
    role: string;
  }): Promise<void> {
    await prisma.boardMember.create({
      data: {
        id: data.id,
        boardId: data.boardId,
        userId: data.userId,
        role: data.role,
      },
    });
  }

  async getBoardsByUser(
    userId: string
  ): Promise<{ id: string; title: string; ownerId: string; role: string }[]> {
    const memberships = await prisma.boardMember.findMany({
      where: { userId },
      include: { board: true },
    });

    return memberships.map((m) => ({
      id: m.board.id,
      title: m.board.title,
      ownerId: m.board.ownerId,
      role: m.role,
    }));
  }

  async getBoardWithMembers(boardId: string): Promise<{
    id: string;
    title: string;
    ownerId: string;
    members: { userId: string; role: string }[];
  } | null> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: { members: true },
    });

    if (!board) return null;

    return {
      id: board.id,
      title: board.title,
      ownerId: board.ownerId,
      members: board.members.map((m) => ({
        userId: m.userId,
        role: m.role,
      })),
    };
  }

  async deleteBoard(boardId: string): Promise<void> {
    await prisma.board.delete({
      where: { id: boardId },
    });
  }
}
