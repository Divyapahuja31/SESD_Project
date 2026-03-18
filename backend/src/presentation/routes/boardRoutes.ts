import { Router } from "express";
import { BoardController } from "../controllers/BoardController";
import { DrawingController } from "../controllers/DrawingController";
import { BoardService } from "../../application/services/BoardService";
import { DrawingService } from "../../application/services/DrawingService";
import { BoardRepository } from "../../infrastructure/repositories/BoardRepository";
import { DrawingRepository } from "../../infrastructure/repositories/DrawingRepository";
import { UserRepository } from "../../infrastructure/repositories/UserRepository";
import { authMiddleware } from "../../middleware/auth.middleware";

const userRepository = new UserRepository();
const boardRepository = new BoardRepository();
const boardService = new BoardService(boardRepository, userRepository);
const boardController = new BoardController(boardService);

const drawingRepository = new DrawingRepository();
const drawingService = new DrawingService(drawingRepository, boardService);
const drawingController = new DrawingController(drawingService);

const boardRouter = Router();

boardRouter.post("/", authMiddleware, (req, res, next) =>
  boardController.createBoard(req, res, next)
);

boardRouter.get("/", authMiddleware, (req, res, next) =>
  boardController.getBoards(req, res, next)
);

boardRouter.get("/:id/history", authMiddleware, (req, res, next) =>
  drawingController.getHistory(req, res, next)
);

boardRouter.get("/:id", authMiddleware, (req, res, next) =>
  boardController.getBoard(req, res, next)
);

boardRouter.post("/:id/invite", authMiddleware, (req, res, next) =>
  boardController.inviteMember(req, res, next)
);

export default boardRouter;
