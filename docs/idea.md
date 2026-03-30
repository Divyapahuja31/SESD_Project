# SyncSketch – Real-Time Collaborative Whiteboard Platform

## Project Overview
SyncSketch is a sophisticated Full Stack Real-Time Collaborative Whiteboard Platform designed to allow multiple users to interact, brainstorm, and draw simultaneously on a shared digital canvas. The system integrates traditional RESTful APIs for robust resource management with WebSocket protocols to achieve low-latency state synchronization. The backend acts as the authoritative source of truth, structured meticulously with Object-Oriented Programming (OOP) principles and Clean Architecture paradigms.

## Core Properties Summary

| Property | Description |
|---|---|
| **Pattern Architecture** | Clean Layered Architecture (Controller → Service → Repository) |
| **Real-Time Engine** | Socket.IO (WebSockets) |
| **Data Persistence** | MongoDB (Mongoose) with flexible BSON JSON mapping |
| **System Security** | Stateless JWT Auth with Cryptographically Hashed Passwords |
| **Domain Separation** | Strict decoupling leveraging SOLID conventions |

## Problem Statement
In the modern era of remote work and distributed teams, effective visual collaboration is often hindered by platforms that are either too rigid, lack real-time responsiveness, or fail to scale reliably under concurrent user loads. Existing solutions often tightly couple the transport layer with business rules, making them difficult to extend. SyncSketch addresses these issues by providing a scalable, real-time collaboration environment with a strictly decoupled backend architecture, ensuring both high performance and maintainability.

## Objectives
- **Architectural Excellence**: Deliver a scalable backend focusing on a clear, layered hierarchy (Controller → Service → Repository).
- **Real-Time Responsiveness**: Ensure low-latency, real-time communication capable of handling high-frequency drawing events using WebSockets.
- **Maintainability**: Enforce strictly decoupled business rules guided by OOP principles and established design patterns.
- **Persistence & Integrity**: Persist complex, real-time drawing history seamlessly to a MongoDB database, ensuring session continuity.
- **Security & Access Control**: Implement robust authentication and Role-Based Access Control (RBAC) to govern board interactions securely.

## Core Functional Features

| Feature | Description |
|---|---|
| **Dual Authentication** | Secure signup/login using token-based session tracking across API and WebSockets. |
| **Workspace Governance** | Full CRUD operations natively mapped for distinct digital whiteboards. |
| **Access Control (RBAC)** | Dedicated privilege layers (Owner, Editor, Viewer) governing specific endpoint access limits. |
| **Real-Time Multicasting** | Synchronous multiplexing of stroke coordinate payloads across isolated network rooms. |
| **Abstract Tooling** | Support mechanisms bridging backend rules with varying canvas drawing tools (Pencil, Eraser). |
| **Event Timeline State** | Asynchronous, immutable tracker managing logs to permit playback and Undo/Redo commands. |

## Non-Functional Requirements

| Requirement | Targets / Measures |
|---|---|
| **Performance** | Socket broadcasts multiplexed with ~30-50ms latencies. HTTP cycles resolve under 200ms. |
| **Scalability** | Built to horizontally cluster utilizing Redis Pub/Sub WebSocket adapter distribution. |
| **Reliability** | Fail-safes integrated across socket transports ensuring automatic reconnect strategies. |
| **Maintainability** | Deep reliance on modular, highly Object-Oriented abstractions mitigating code decay. |

## Backend Architecture Overview
The backend strictly adheres to **Clean Layered Architecture** to segregate responsibilities:
- **Presentation/Transport Layer**: Comprises Express.js Controllers and Socket.IO event handlers. Responsible solely for unpacking requests/messages and delegating to the Service layer.
- **Service/Domain Layer**: Houses the core business logic. It handles authorizations, orchestrates interactions between entities, and enforces domain rules. It is completely decoupled from the HTTP context or database specifics.
- **Data Access/Repository Layer**: Encapsulates all interactions with the MongoDB database using Mongoose. It abstracts low-level data queries, presenting a clean interface to the Service layer.

## Real-Time Communication Architecture
- **Connection Handshake**: Socket.IO handles the initial HTTP upgrade request to establish a WebSocket connection. During this handshake, the user's JWT is extracted and cryptographically validated to prevent unauthorized framing.
- **Room Subscriptions**: Each whiteboard maps logically to a Socket.IO "Room". Authorized users subscribe to specific rooms corresponding to their active boards.
- **Event Broadcasting Pipeline**: Drawing events are emitted by clients, validated by the backend, piped asynchronously to the database for persistence, and then broadcasted strictly to the originating room (multiplexing).

## Scalability Considerations
- **Event Batching & Throttling**: To prevent I/O bottlenecks, high-frequency drawing coordinate payloads can be batched before database persistence, while still being broadcasted immediately via sockets.
- **Stateless HTTP Nodes**: The use of JWTs guarantees that HTTP REST API servers remain completely stateless, enabling seamless load balancing.
- **WebSocket Scaling**: The architecture is primed for integration with a Redis-backed Socket.IO Adapter to distribute real-time connections across multiple Node.js worker processes or separate physical instances.
- **Database Indexing**: Critical MongoDB collections feature compound indexes (e.g., on `board_id` and `timestamp`) to accelerate the retrieval of massive drawing event logs.

## Security Considerations
- **Cryptographic Hashing**: Passwords strongly hashed using `bcrypt` before database entry.
- **Token-Based Authentication**: Stateless JWTs utilized for secure, tamper-proof session tracking across REST APIs and WebSocket connections.
- **Input Validation & Sanitization**: Strict JSON payload validation to prevent injection attacks and mitigate XSS vulnerabilities.
- **Authorization Enforcement**: Every action (REST or real-time) validates the user's role against the target board's permissions matrix.

## Design Patterns Used
- **Repository Pattern**: Centralizes data access logic, fully isolating controllers and services from MongoDB implementation details.
- **Service Layer Pattern**: Defines an application's boundary with a layer of services that establishes a set of available operations and coordinates the application's response.
- **Singleton Pattern**: Employed for application-wide resource managers such as the Database Connection handler and the `SocketManager`.
- **Command Pattern**: Structures incoming WebSocket drawing payloads as distinct commands (e.g., `DrawCommand`, `EraseCommand`), facilitating extensibility and structured Undo/Redo logic.

## OOP Principles Applied
- **Encapsulation**: State and behavior are bundled within specific classes. Data persistence mechanisms (e.g., Mongoose models) are kept private within Repositories and exposed only via controlled public interfaces.
- **Abstraction**: Complex implementations are masked behind simple intent-revealing base classes. E.g., `BaseRepository` abstracts generic CRUD logic, and `DrawingTool` abstracts shape-rendering mathematical logic.
- **Inheritance**: Repositories extend a common `BaseRepository` parameterized by generics to inherit base data operations. Specific tools (Pencil, Eraser) inherit from `DrawingTool`.
- **Polymorphism**: The system invokes drawing behavior uniformly via an overridden `draw()` interface without concerning itself with the specific instance executing it.

## Future Enhancements
- Integration of a distributed cache (Redis) for rapid session retrieval and fast user permission checks.
- Evolution of event-sourcing paradigms to manage large-scale chronological drawing logs and infinite Undo/Redo operations reliably.
- Real-time telepresence features showcasing active named cursors to denote a physical presence feeling on the canvas.
