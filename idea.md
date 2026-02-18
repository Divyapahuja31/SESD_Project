# idea.md

## Project Overview
The Full Stack Realtime Collaborative Whiteboard Platform is a sophisticated web application designed to allow multiple users to draw, conceptualize, and collaborate on a shared digital canvas simultaneously. Modeled after tools like Excalidraw or Miro, the project brings together traditional REST APIs for resource management and WebSocket connections for low-latency state synchronization. The backend, built carefully with OOP principles and clean architecture, serves as the robust backbone of the system.

## Problem Statement
Remote teams, educators, and designers often struggle to brainstorm efficiently due to a lack of immediate visual feedback tools. Existing platforms can be heavy, non-extensible, or fail to handle concurrent multi-user interactions gracefully. This project aims to build a scalable, highly responsive, and well-architected solution that handles real-time concurrency while maintaining a clean, easily maintainable codebase.

## Objectives
- Deliver a scalable backend focusing on a clear layered architecture (Controller → Service → Repository).
- Ensure real-time, low-latency collaboration using secure WebSocket connections.
- Implement strictly decoupled business logic guided by Object-Oriented principles.
- Provide a responsive frontend canvas to visualize backend capabilities.
- Persist real-time drawing history seamlessly to allow session continuity and undo/redo states.

## Core Features
1. **User Authentication & Authorization**: Secure signup/login using JWT-based authentication.
2. **Board Management**: CRUD operations for whiteboards (Create, View, Delete, Share).
3. **Role-based Access Control**: Roles defined as "Owner", "Editor", "Viewer" dictating what a user can do on a specific board.
4. **Real-time Canvas Sync**: Broadcasting cursor movements and strokes concurrently to interacting clients.
5. **Drawing Tools**: Abstractions for Pencil, Eraser, and potentially Shapes, capturing corresponding coordinates.
6. **Drawing History & State Persistence**: Saving events continuously to a database allowing users to resume where they left off.

## Non-Functional Requirements
- **Performance**: High throughput for socket events; response time for HTTP requests under 200ms.
- **Scalability**: Capable of supporting horizontal scaling for the WebSocket layer using Redis Pub/Sub in the future.
- **Security**: Password hashing (Bcrypt), JWT validation, and WebSocket connection handshakes to prevent unauthorized socket framing.
- **Maintainability**: High code modularity adhering to SOLID principles.

## Backend Architecture Overview
The backend follows a strict **Clean Layered Architecture**:
- **Presentation/Transport Layer**: Express Routes, Controllers, and Socket.IO event handlers.
- **Service Layer**: Houses the core business logic, handling validations, interactions between different domains, and domain-specific rules.
- **Data Access/Repository Layer**: Encapsulates all interactions with MongoDB using Mongoose, abstracting database queries from the business logic.

## Real-Time Architecture Overview
- **Connection**: Socket.IO handles the HTTP upgrade to WebSocket. Handshakes involve validating the user's JWT.
- **Rooms**: Each WebBoard maps to a Socket.IO "Room". Users join rooms corresponding to the board they open.
- **Event Broadcasting**: Draw events are emitted to the server, parsed, saved asynchronously to the database, and broadcasted strictly to the originating room (excluding the sender).

## Scalability & Performance Considerations
- **Event Batching**: Instead of hitting the database on every micro-movement, drawing data can be batched and saved periodically to reduce I/O bottlenecks.
- **Stateless Authentication**: JWT ensures the Express API remains stateless, allowing horizontal scaling behind a reverse proxy/load balancer.
- **Socket Horizontal Scaling**: Prepared for a Redis Adapter to manage Socket rooms across multiple backend nodes if the user base grows.
- **Indexing**: MongoDB collections feature indexes on `board_id` and `timestamp` fields to rapidly fetch drawing history upon connection.

## Design Patterns Used
- **Repository Pattern**: Centralizes data logic, keeping controllers and services completely unaware of database implementations.
- **Service Layer Pattern**: Separates domain logic from HTTP transport logic.
- **Singleton Pattern**: Ensures classes like the Database connection manager or SocketManager are singular across the application lifecycle.
- **Factory/Command Pattern**: Structuring incoming WebSocket payloads as commands (e.g., DrawCommand, EraseCommand, ClearCommand) enabling extensibility and Undo/Redo logic.

## OOP Principles Applied
- **Encapsulation**: Private class properties (e.g., database models inside repositories) accessed only through defined interface methods.
- **Abstraction**: Base classes (like `BaseRepository` and `DrawingTool`) abstract common logic exposing only high-level actions.
- **Inheritance**: Repositories extend a `BaseRepository` to inherit generic CRUD operations; tools inherit from `DrawingTool`.
- **Polymorphism**: Drawing mechanisms rely on standard `draw()` implementations overridden structurally by specific child tools like `Pencil` or `Eraser`.

## Future Enhancements
- Integration of a distributed cache (Redis) for session state and fast user validations.
- Implementing an event-sourcing paradigm to handle large-scale undo/redo history reliably.
- Real-time cursor tracking and named cursors to mimic physical presence.
