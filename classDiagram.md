# Class Diagram – SyncSketch

## Overview
The Class Diagram delineates the static structural blueprint of the SyncSketch backend system. It rigorously applies the Clean Layered Architecture methodology, displaying exactly how domain entities interact, how services process business logic, and how physical database queries are abstracted. The diagram is strongly biased toward an enterprise-level, Object-Oriented backend evaluation standard.

## Class Diagram

```mermaid
classDiagram
    direction TB
    
    %% Base Classes
    class BaseRepository~T~ {
        <<abstract>>
        +findById(id: String) T
        +find(query: Object) List~T~
        +create(data: Object) T
        +update(id: String, data: Object) T
        +delete(id: String) void
    }

    class DrawingTool {
        <<abstract>>
        +color: String
        +size: Number
        +draw(x: Number, y: Number)* void
    }

    class Pencil {
        +draw(x: Number, y: Number) void
    }

    class Eraser {
        +draw(x: Number, y: Number) void
    }

    DrawingTool <|-- Pencil
    DrawingTool <|-- Eraser

    %% Repositories
    class UserRepository {
        +findByEmail(email: String) User
    }
    class BoardRepository {
        +findUserBoards(userId: String) List~Board~
    }
    class DrawingRepository {
        +getBoardEvents(boardId: String) List~DrawingEvent~
        +saveEvent(event: DrawingEvent) DrawingEvent
    }

    BaseRepository <|-- UserRepository
    BaseRepository <|-- BoardRepository
    BaseRepository <|-- DrawingRepository

    %% Entities/Models
    class User {
        +id: String
        +username: String
        +email: String
        +passwordHash: String
        +createdAt: Date
    }

    class Board {
        +id: String
        +title: String
        +ownerId: String
        +createdAt: Date
        +updatedAt: Date
    }

    class BoardMember {
        +id: String
        +boardId: String
        +userId: String
        +role: String
        +joinedAt: Date
    }

    class DrawingEvent {
        +id: String
        +boardId: String
        +userId: String
        +eventType: String
        +data: Object
        +timestamp: Date
    }

    %% Services
    class AuthService {
        -userRepository: UserRepository
        +register(data: Object) String
        +login(credentials: Object) String
        +validateToken(token: String) User
    }

    class BoardService {
        -boardRepository: BoardRepository
        +createBoard(data: Object) Board
        +getBoardDetails(boardId: String, userId: String) Board
        +addMember(boardId: String, userId: String, role: String) void
    }

    class DrawingService {
        -drawingRepository: DrawingRepository
        +saveDrawEvent(eventData: Object) DrawingEvent
        +getHistory(boardId: String) List~DrawingEvent~
        +handleUndo(boardId: String, userId: String) void
    }

    %% Controllers
    class AuthController {
        -authService: AuthService
        +register(req, res) void
        +login(req, res) void
    }

    class BoardController {
        -boardService: BoardService
        +createBoard(req, res) void
        +getBoard(req, res) void
        +shareBoard(req, res) void
    }
    
    class SocketManager {
        -drawingService: DrawingService
        -authService: AuthService
        +initialize(io: Server) void
        +handleConnection(socket: Socket) void
        +handleDrawEvent(socket: Socket, data: Object) void
        +handleJoinRoom(socket: Socket, boardId: String) void
    }

    %% Associations & Dependencies
    AuthController --> AuthService : Uses
    BoardController --> BoardService : Uses
    SocketManager --> DrawingService : Uses
    SocketManager --> AuthService : Uses
    
    AuthService --> UserRepository : Injects
    BoardService --> BoardRepository : Injects
    DrawingService --> DrawingRepository : Injects

    UserRepository --> User : Manages
    BoardRepository --> Board : Manages
    DrawingRepository --> DrawingEvent : Manages
    
    Board "1" *-- "*" BoardMember : Contains
    Board "1" *-- "*" DrawingEvent : Has
```

## Layer Responsibilities

| Layer / Component | Examples | Responsibilities |
|---|---|---|
| **Controllers** | `AuthController`, `BoardController` | Intercept HTTP REST requests, parse JSON payloads, inject dependencies to services, output HTTP JSON responses natively. They hold strictly zero complex algorithm logic. |
| **Services** | `AuthService`, `DrawingService` | Application core boundary. Encapsulates advanced algorithms, enforces RBAC logic, orchestrates cross-repository queries, maps domain rules. |
| **Repositories** | `BaseRepository`, `UserRepository` | Limits Mongoose footprint. Provides an abstracted bridge masking low-level generic Database I/O. Exposes secure methods avoiding direct DB injections. |
| **Real-Time Transport**| `SocketManager` | Parallel to REST controllers, it parses emitted socket Events mapping connection validations into respective Services guaranteeing multiplexed network capabilities. |

## Design Patterns in the Class Diagram

| Pattern | Component Applied | Explanation / Purpose |
|---|---|---|
| **Repository Pattern** | Repositories (`UserRepository`, etc.) | Fully standardizes NoSQL constraints ensuring that HTTP Services never handle raw Mongoose logic bridging directly towards decoupling bounds. |
| **Service Layer Pattern**| Services (`AuthService`, etc.) | Identifies explicit boundaries for encapsulating intense application algorithms apart from superficial Controller configurations. |
| **Command Pattern** | `DrawingEvent` / `DrawingService` | Structures canvas actions sequentially permitting a continuous event ledger allowing advanced Undo/Redo reconstruction possibilities. |
| **Singleton Pattern** | `SocketManager` | Guarantees an isolated unified TCP multiplexing class securing identical memory-references throughout server process runtimes. |

## OOP Principles Demonstrated

| Principle | Reflection in Diagram | Explanation |
|---|---|---|
| **Encapsulation** | Protected Props (e.g., `-userRepository`) | Restricts internal Service logic bindings keeping dependency injection hidden avoiding variable overwrites preventing runtime corruptions. |
| **Abstraction** | `BaseRepository`, `DrawingTool` | Shields complex document retrieval implementations natively exposing generalized methods like `findById(id)`. |
| **Inheritance** | `Pencil` extending `DrawingTool` | Descendents immediately acquire foundational logic (`color`, `size`) removing duplicated code significantly cutting operational redundancies. |
| **Polymorphism** | Overridden `draw(x, y)` | Rest endpoints route generic `draw()` operations dynamically contextualizing behavior according to instantiated target (Eraser vs Pencil) sans complex `if-else` branching logic. |

## Dependency Flow Explanation
The diagram maps a directed graph representing dependency injection. `AuthController` references `AuthService`, which internally relies on `UserRepository` injected into its constructor. This unidirectional flow ensures a scalable architecture that complies with the Dependency Inversion Principle, facilitating rapid mock injection for robust automated Unit Testing.
