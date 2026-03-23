import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { DrawingService } from "../../application/services/DrawingService";

export class DrawingController {
  constructor(private drawingService: DrawingService) {}

  async getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const boardId = req.params.id as string;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const history = await this.drawingService.getHistory(boardId, userId);
      res.status(200).json({ history });
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
}
