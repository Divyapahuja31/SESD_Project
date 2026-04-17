import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import authRouter from "./presentation/routes/authRoutes";
import boardRouter from "./presentation/routes/boardRoutes";
import { SocketManager } from "./presentation/sockets/SocketManager";
import { BoardService } from "./application/services/BoardService";
import { BoardRepository } from "./infrastructure/repositories/BoardRepository";
import { DrawingService } from "./application/services/DrawingService";
import { DrawingRepository } from "./infrastructure/repositories/DrawingRepository";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { validateEnv } from "./utils/validateEnv";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

validateEnv();

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

// Health check route so the browser doesn't show "Cannot GET /"
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "SyncSketch API is running beautifully! 🚀" });
});

app.use("/api/auth", authRouter);
app.use("/api/boards", boardRouter);

app.use(errorHandler);

const userRepository = new UserRepository();
const boardRepository = new BoardRepository();
const boardService = new BoardService(boardRepository, userRepository);
const drawingRepository = new DrawingRepository();
const drawingService = new DrawingService(drawingRepository, boardService);
new SocketManager(httpServer, boardService, drawingService);

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`[Server] Drawing app running on port ${PORT} ✓`);
});

