import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { BoardService } from "../../application/services/BoardService";
import { DrawingService } from "../../application/services/DrawingService";
import { 
  drawPayloadSchema, 
  joinBoardSchema, 
  undoSchema 
} from "../../utils/validation";

export class SocketManager {
  private io: Server;

  constructor(
    httpServer: HTTPServer,
    private boardService: BoardService,
    private drawingService: DrawingService
  ) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.initializeMiddleware();
    this.initializeEventHandlers();

    console.log("Socket.IO initialized");
  }

  private initializeMiddleware(): void {
    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return next(new Error("Server configuration error"));

        const decoded = jwt.verify(token, secret) as { userId: string };
        socket.data.user = decoded;
        next();
      } catch (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  private initializeEventHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      const userId = socket.data.user.userId;
      console.log(`User connected: ${userId} (socket: ${socket.id})`);

      this.handleJoinBoard(socket, userId);
      this.handleDraw(socket, userId);
      this.handleUndo(socket, userId);
      this.handleClear(socket, userId);
      this.handleMouseMove(socket, userId);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
      });
    });
  }


  private handleJoinBoard(socket: Socket, userId: string): void {
    socket.on("join-board", async (data: unknown) => {
      const parsed = joinBoardSchema.safeParse(typeof data === "string" ? { boardId: data } : data);
      
      if (!parsed.success) {
        return socket.emit("error-message", {
          event: "join-board",
          message: "Invalid boardId format",
        });
      }

      const { boardId } = parsed.data;

      try {
        const board = await this.boardService.getBoardDetails(boardId, userId);

        socket.join(boardId);

        const history = await this.drawingService.getHistory(boardId, userId);

        socket.emit("joined-board", {
          boardId: board.id,
          userId, 
          title: board.title,
          role: board.role,
          message: `Joined board "${board.title}" as ${board.role}`,
          history, 
        });

        socket.to(boardId).emit("user-joined", {
          userId,
          message: "A user has joined the board",
        });

        console.log(`[Socket] User ${userId} joined board ${boardId}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to join board";
        socket.emit("error-message", {
          event: "join-board",
          message,
        });
      }
    });
  }

  private handleDraw(socket: Socket, userId: string): void {
    socket.on("draw", async (data: unknown) => {
      const parsed = drawPayloadSchema.safeParse(data);
      
      if (!parsed.success) {
        return socket.emit("error-message", {
          event: "draw",
          message: "Invalid drawing data format",
        });
      }

      const { boardId, points, color, size, tool } = parsed.data as any;

      try {
        const strokeRecord = await this.drawingService.addStroke(boardId, userId, {
          points,
          color,
          size,
          tool,
        });

        console.log(`[Socket] Broadcasting draw from ${userId} on board ${boardId} (tool: ${tool})`);

        this.io.to(boardId).emit("draw", {
          id: strokeRecord.id,
          userId,
          points,
          color,
          size,
          tool,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to save draw event";
        socket.emit("error-message", {
          event: "draw",
          message,
        });
      }
    });
  }

  private handleUndo(socket: Socket, userId: string): void {
    socket.on("undo", async (data: unknown) => {
      const parsed = undoSchema.safeParse(data);
      
      if (!parsed.success) {
        return socket.emit("error-message", {
          event: "undo",
          message: "Invalid undo request format",
        });
      }

      const { boardId } = parsed.data;

      try {
        const result = await this.drawingService.undoLast(boardId, userId);

        if (result.deletedId) {
          this.io.to(boardId).emit("undo", {
            deletedId: result.deletedId,
            userId,
          });
        } else {
          socket.emit("error-message", {
            event: "undo",
            message: "No stroke to undo",
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to undo";
        socket.emit("error-message", {
          event: "undo",
          message,
        });
      }
    });
  }

  private handleClear(socket: Socket, userId: string): void {
    socket.on("clear-board", async (data: { boardId: string }) => {
      try {
        await this.drawingService.clearAll(data.boardId, userId);
        this.io.to(data.boardId).emit("clear-board");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to clear board";
        socket.emit("error-message", { event: "clear-board", message });
      }
    });
  }

  private handleMouseMove(socket: Socket, userId: string): void {
    socket.on("mouse-move", (data: { boardId: string; x: number; y: number }) => {
      socket.volatile.to(data.boardId).emit("cursor-update", {
        userId,
        x: data.x,
        y: data.y,
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}
