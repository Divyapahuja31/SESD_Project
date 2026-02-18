# SyncSketch – Real-Time Collaborative Whiteboard Platform

## Overview
**SyncSketch** is a Full Stack Real-Time Collaborative Whiteboard Platform designed to allow multiple users to interact, brainstorm, and draw simultaneously on a shared digital canvas. The project serves as a comprehensive End Semester System Design implementation focusing heavily on **Backend Architecture, Clean Layered Design, and Real-Time Concurrency**.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-Time Engine**: WebSockets (Socket.IO)
- **Frontend**: React (Vite), Tailwind CSS
- **Authentication**: JWT-based stateless sessions

## System Design Documentation

This repository contains in-depth academic and production-level system design documentation. Each diagram is accompanied by extensive architectural explanations detailing the application of OOP principles and design patterns.

1. **[Project & Architecture Overview](./idea.md)**
   - Problem Statement, Objectives, Core Features
   - Clean Layered Architecture & Real-Time Setup
   - Design Patterns & Security Considerations

2. **[Use Case Diagram & RBAC](./useCaseDiagram.md)**
   - Role-Based Access Control (Owner, Editor, Viewer)
   - System Boundary and Use Case Flow

3. **[Sequence Diagram & Real-Time Flow](./sequenceDiagram.md)**
   - HTTP REST State Fetch vs WebSocket Multiplexing
   - JWT Handshake and Asynchronous Persistence Flow

4. **[Class Diagram & OOP Principles](./classDiagram.md)**
   - Controller → Service → Repository Responsibilities
   - Abstraction, Polymorphism, Inheritance mapping
   - Singleton and Command Patterns

5. **[ER Diagram & Database Schema](./ErDiagram.md)**
   - Hybrid Normalized vs BSON Event Logging Strategy
   - Indexing Strategies for real-time scale
   - Foreign Key relational mapping

## Key Features
- **Stateless Authentication**: JWT validation across REST endpoints and Socket.io handshakes.
- **Concurrent Broadcasting**: Sub-millisecond multiplexing of coordinate streams isolated by WebSocket rooms.
- **Role-Based Access Control (RBAC)**: Strict permission matrices determining if a user can edit the canvas, invite others, or merely view the live broadcast.
- **Persistent Event Ledger**: Robust MongoDB append-only structures allowing precise historical rendering and Undo/Redo mechanisms.

---
*Created for End Semester System Design evaluation.*
