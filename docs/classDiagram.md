# Class Diagram – SyncSketch

## Overview
The Class Diagram delineates the static structural blueprint of the SyncSketch backend system. It rigorously applies the **Clean Layered Architecture** methodology, displaying how domain entities interact, how services process business logic, and how physical database queries are abstracted through the Repository pattern.

## Class Diagram

```mermaid
classDiagram
    direction TB
    
    %% Base Layer
    class IUserRepository {
        <<interface>>
        +findById(id: String) User
        +findByEmail(email: String) User
    }

    %% Repositories
    class UserRepository {
        -prisma: PrismaClient
        +findById(id: String) User
        +findByEmail(email: String) User
    }
    class BoardRepository {
        -prisma: PrismaClient
        +getBoardWithMembers(id: String) Board
        +saveBoard(data: Object) Board
    }
    class DrawingRepository {
        -prisma: PrismaClient
        +getSnapshot(boardId: String) Snapshot
        +saveSnapshot(boardId: String, strokes: Json) void
    }

    UserRepository ..|> IUserRepository

    %% Entities/Models
    class User {
        +id: String
        +email: String
        +password: String
    }

    class Board {
        +id: String
        +title: String
        +ownerId: String
        +members: List~BoardMember~
    }

    class BoardMember {
        +userId: String
        +boardId: String
        +role: String
    }

    %% Services
    class AuthService {
        -userRepository: IUserRepository
        +register(data: Object) String
        +login(credentials: Object) String
        +getProfile(userId: String) User
    }

    class BoardService {
        -boardRepository: BoardRepository
        -userRepository: IUserRepository
        +createBoard(userId: String, title: String) Board
        +getBoardDetails(boardId: String, userId: String) Board
        +inviteMember(boardId: String, email: String) void
    }

    class DrawingService {
        -drawingRepository: DrawingRepository
        -boardService: BoardService
        -stateManager: BoardStateManager
        +getHistory(boardId: String, userId: String) List
        +saveStroke(boardId: String, stroke: Object) void
        +handleUndo(boardId: String, userId: String) void
    }

    class BoardStateManager {
        -boards: Map~String, BoardState~
        +getBoard(id: String) BoardState
        +syncToDb() void
    }

    %% Controllers & Transport
    class AuthController {
        -authService: AuthService
    }

    class BoardController {
        -boardService: BoardService
    }
    
    class SocketManager {
        -drawingService: DrawingService
        -boardService: BoardService
        +handleConnection(socket: Socket) void
        +handleDraw(socket: Socket, data: Object) void
    }

    %% Associations
    AuthController --> AuthService
    BoardController --> BoardService
    SocketManager --> DrawingService
    SocketManager --> BoardService
    
    AuthService --> IUserRepository
    BoardService --> BoardRepository
    BoardService --> IUserRepository
    DrawingService --> DrawingRepository
    DrawingService --> BoardStateManager
    
    BoardStateManager "1" *-- "many" Board : Manages
```

## Layer Responsibilities

| Layer / Component | Examples | Responsibilities |
|---|---|---|
| **Controllers** | `AuthController`, `BoardController` | Entry points for REST APIs. Parse request params, call services, and return HTTP responses. |
| **Services** | `AuthService`, `DrawingService` | Application core boundary. Handles business rules, security checks, and orchestrates repository calls. |
| **Repositories** | `UserRepository`, `DrawingRepository` | Direct interaction with **Prisma ORM**. Abscracts raw SQL/DB logic from the rest of the application. |
| **State Manager** | `BoardStateManager` | Memory-management layer. Keeps active boards in a high-speed Map for real-time performance. |

## Design Patterns in the Class Diagram

| Pattern | Component Applied | Purpose |
|---|---|---|
| **Repository Pattern** | `UserRepository`, etc. | Decouples business logic from the specific database implementation (SQL/ORM). |
| **Dependency Injection**| Services & Controllers | Repositories and Services are injected via constructors (Inversion of Control), facilitating unit testing. |
| **State Pattern** | `BoardStateManager` | Manages the lifecycle of boards in memory (Active vs. Hibernating). |
| **Facade Pattern** | `SocketManager` | Provides a unified entry point for all WebSocket-based drawing and room logic. |

## Dependency Flow
The architecture follows a strict **unidirectional dependency flow**:
`Controllers/Sockets` -> `Services` -> `Repositories` -> `Database`.

Higher-level modules (Services) depend on abstractions (`IUserRepository`) rather than concrete implementations, following the **Dependency Inversion Principle**. This ensures that the system remains modular, testable, and maintainable as it scales.
