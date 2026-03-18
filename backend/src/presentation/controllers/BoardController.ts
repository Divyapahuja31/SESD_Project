import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { BoardService } from "../../application/services/BoardService";
import { createBoardSchema } from "../../utils/validation";

export class BoardController {
  constructor(private boardService: BoardService) {}

  async createBoard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const parsed = createBoardSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0].message });
        return;
      }

      const board = await this.boardService.createBoard(userId, parsed.data.title);
      res.status(201).json({ message: "Board created successfully", board });
    } catch (error: unknown) {
      next(error);
    }
  }

  async getBoards(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const boards = await this.boardService.getBoards(userId);
      res.status(200).json({ boards });
    } catch (error: unknown) {
      next(error);
    }
  }

  async getBoard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const boardId = req.params.id as string;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const board = await this.boardService.getBoardDetails(boardId, userId);
      res.status(200).json({ board });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (message === "Board not found") {
        res.status(404).json({ error: message });
      } else if (message === "Access denied") {
        res.status(403).json({ error: message });
      } else {
        next(error);
      }
    }
  }

  async inviteMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.user?.userId;
      const boardId = req.params.id as string;
      const { email } = req.body;

      if (!ownerId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (!email) {
        res.status(400).json({ error: "Target email is required" });
        return;
      }

      await this.boardService.addMemberByEmail(boardId, ownerId, email);
      res.status(200).json({ message: "User invited successfully" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("not found") || message.includes("already a member")) {
        res.status(400).json({ error: message });
      } else if (message.includes("Access denied")) {
        res.status(403).json({ error: message });
      } else {
        next(error);
      }
    }
  }
}
