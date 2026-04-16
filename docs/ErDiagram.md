# ER Diagram – SyncSketch
## Overview
The Entity-Relationship (ER) diagram visualizes the structural schema and relationships inherent to the SyncSketch Relational Database architecture. Built targeting **PostgreSQL**, it utilizes a normalized relational model managed by **Prisma ORM**, ensuring strict data integrity, referential constraints, and high-performance querying for collaborative workspaces.

## ER Diagram

```mermaid
erDiagram
    User {
        String id PK
        String email UNIQUE
        String password
        DateTime createdAt
        DateTime updatedAt
    }

    Board {
        String id PK
        String title
        String ownerId FK
        DateTime createdAt
        DateTime updatedAt
    }

    BoardMember {
        String id PK
        String boardId FK
        String userId FK
        Enum role "OWNER, EDITOR, VIEW"
        DateTime joinedAt
    }

    BoardSnapshot {
        String id PK
        String boardId FK
        Json strokes
        DateTime updatedAt
    }

    User ||--o{ Board : "owns"
    User ||--o{ BoardMember : "is member of"
    
    Board ||--o{ BoardMember : "has members"
    Board ||--o{ BoardSnapshot : "has state snapshot"
```

## Table Summary & Key Constraints

| Table Name | Purpose | Key Fields | Relationships |
|---|---|---|---|
| **User** | Manages authenticated user profiles and secure credentials. | `email`, `password` | 1:M with Board, BoardMember |
| **Board** | Represents an isolated digital workspace. | `title`, `ownerId` | M:1 with User (Owner), 1:M with Members/Snapshots |
| **BoardMember** | Junction table managing RBAC (Role-Based Access Control). | `role` (OWNER, EDITOR, VIEW) | M:M bridge between User and Board |
| **BoardSnapshot** | Stores the authoritative "current state" of a board as a JSON blob. | `strokes` (JSON) | 1:1 (Logical) with Board |

## Database Design Strategy
SyncSketch moved away from granular event logging to a **Snapshot-Based Persistence** model. This architectural shift ensures that even with thousands of simultaneous draw events, the database only performs writes periodically (or when a board becomes inactive), radically improving scalability and reducing I/O wait times.

## Database Core Definitions

### Primary Keys & Foreign Keys
Every table uses a **UUID (Universally Unique Identifier)** as a primary key to prevent predictable ID enumeration and ensure uniqueness across distributed systems. Referential integrity is strictly enforced at the database level via Foreign Key constraints.

### The Snapshot Model
Instead of a `drawing_events` table that grows infinitely, we use the `BoardSnapshot` table. This stores the entire canvas state as a structured JSON object. 
- **Retrieval**: When a user joins a board, the backend fetches the single latest snapshot.
- **Save**: The backend memory manager flushes the in-memory board state to this table every 50 strokes or 30 seconds.

### Indexing Strategy
To optimize performance, we maintain unique indexes on `User.email` and a compound unique index on `BoardMember(boardId, userId)` to prevent duplicate memberships.

### Scalability Considerations
By using PostgreSQL with Prisma, we benefit from connection pooling and strongly-typed queries. The snapshot model allows the database to remain lean and performant even as the user base grows, as we are no longer storing millions of individual coordinate points.
