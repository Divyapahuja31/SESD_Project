import { BoardRepository } from "../../infrastructure/repositories/BoardRepository";
import { IUserRepository } from "../../core/interfaces/IUserRepository";
import { v4 as uuidv4 } from "uuid";

export class BoardService {
  constructor(
    private boardRepository: BoardRepository,
    private userRepository: IUserRepository
  ) {}

  async createBoard(
    userId: string,
    title: string
  ): Promise<{ id: string; title: string }> {
    const boardId = uuidv4();

    const board = await this.boardRepository.createBoard({
      id: boardId,
      title,
      ownerId: userId,
    });

    await this.boardRepository.addMember({
      id: uuidv4(),
      boardId: board.id,
      userId,
      role: "owner",
    });

    return { id: board.id, title: board.title };
  }

  async addMemberByEmail(
    boardId: string,
    ownerId: string,
    targetEmail: string
  ): Promise<void> {
    const board = await this.boardRepository.getBoardWithMembers(boardId);
    if (!board) throw new Error("Board not found");

    const targetUser = await this.userRepository.findByEmail(targetEmail);
    if (!targetUser) throw new Error("User with this email not found");

    const alreadyMember = board.members.some((m) => m.userId === targetUser.id);
    if (alreadyMember) throw new Error("User is already a member of this board");

    await this.boardRepository.addMember({
      id: uuidv4(),
      boardId,
      userId: targetUser.id,
      role: "editor", 
    });
  }

  async getBoards(
    userId: string
  ): Promise<{ id: string; title: string; ownerId: string; role: string }[]> {
    const boards = await this.boardRepository.getBoardsByUser(userId);
    return boards;
  }

  async getBoardDetails(
    boardId: string,
    userId: string
  ): Promise<{ id: string; title: string; role: string }> {
    const board = await this.boardRepository.getBoardWithMembers(boardId);

    if (!board) {
      throw new Error("Board not found");
    }

    const membership = board.members.find((m) => m.userId === userId);

    if (!membership) {
      throw new Error("Access denied");
    }

    return {
      id: board.id,
      title: board.title,
      role: membership.role
    };
  }

  async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await this.boardRepository.getBoardWithMembers(boardId);
    if (!board) throw new Error("Board not found");

    await this.boardRepository.deleteBoard(boardId);
  }
}
