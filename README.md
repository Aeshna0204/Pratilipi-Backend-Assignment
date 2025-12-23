# Library Management System

A production-ready Library Management System built with Node.js, Express.js, PostgreSQL, and Prisma ORM. 
## Architecture & Technology Stack

### Technology Choices

#### Node.js & Express.js
Event-driven architecture scales well for I/O-bound operations. 
Fast development cycle with hot-reloading, a large community, and extensive documentation.

#### PostgreSQL
Ensures data integrity with full transactional support. Rich set of features including JSON support and complex queries
Robust MVCC (Multi-Version Concurrency Control) for handling concurrent operations
Strong foreign key constraints and CHECK constraints

#### Prisma ORM
Intuitive schema definition with excellent migration tools
Composable and type-safe query builder
Provides optimized queries and efficient connection management (with pooling handled by the database or external poolers).
Have version-controlled schema changes
Gives flexibility to write raw SQL when needed for complex operations

**Trade-off**: While Prisma provides excellent DX, we use raw SQL for critical concurrency operations (borrow/update and delete transactions) to ensure precise control over locking mechanisms and transaction isolation levels.

### Project Structure
```
Pratilipi-Backend-Assignment/
├── prisma/                   # Prisma schema & migrations
│   ├── migrations/          # Migration files
│   └── schema.prisma        # DB schema
├── src/                     # Main application source
│   ├── controllers/         # Route handlers (CRUD, borrow logic)
│   ├── routes/              # Express route definitions
│   ├── services/            # Business logic (borrow concurrency control)
│   ├── middlewares/         # error handling, auth
│   ├── utils/               # validators
│   ├── app.js               # Express app setup
│   └── server.js            # App entrypoint
├── .gitignore               # Untracked files
├── Dockerfile               # Docker config for app
├── docker-compose.yml       # Docker compose (app + Postgres)
├── package.json             # Dependencies & scripts
├── package-lock.json        # Lockfile
├── README.md                # Project documentation

```

## Database Design

### Indexing Strategy

We've implemented strategic indexes to optimize query performance:


```
  @@index([status])
  @@index([createdAt])
  @@index([deletedAt])

// Indexes to speed up joins / filtering
  @@index([userId])
  @@index([bookId])

```

**Trade-off**: Indexes improve read performance but add overhead to write operations. I've balanced this by indexing only frequently queried columns and the columns that are needed for joins and filtering.

### Feedback Incorporation 

#### Concurrency control 
To prevent race conditions when multiple users try to borrow the same book at the same time, concurrency is handled at the database level using row-level locking inside a transaction.
Also For all write operations on a Book (borrow, update, soft delete), the book row is first locked before checking or modifying its state. This ensures that concurrent requests affecting the same book are serialized and prevents race conditions such as multiple users borrowing the same book or an admin updating/deleting a book while it is being borrowed.

We use a Prisma transaction combined with a raw SQL query (SELECT … FOR UPDATE) to lock the specific book row before checking or updating its status. This ensures that:

Only one request can read and update a book row at a time

Other concurrent requests are blocked until the transaction completes

The second request sees the updated state and fails gracefully if the book is already borrowed

Inside the transaction:

The book row is locked using FOR UPDATE

The current status is checked while holding the lock

The book status is updated to borrowed

A borrow event is created

The transaction commits and releases the lock

This approach ensures that concurrent borrow, update, or delete operations on the same book are serialized, preventing conflicting state changes.

Raw SQL is used only for the locking step because Prisma does not expose row-level locking directly. All other operations remain ORM-based for safety and readability.

**Trade-off**: Using raw SQL slightly reduces type safety, but provides strong consistency and correctness for critical concurrent operations.

Insert timestamps are handled at the database level using Prisma schema defaults (e.g., @default(now()) and @updatedAt), avoiding manual use of Date.now() in application code and ensuring consistency across all insert operations.

### Soft Delete vs Hard Delete

**Why Soft Delete?**

1. Maintains complete history for compliance and debugging
2. Accidentally deleted records can be restored
3. Prevents orphaned foreign key relationships
4. Historical data remains available for reporting

**Implementation**:
```
// Every model includes
deleted_at: DateTime? // NULL = active, timestamp = deleted
```

**Trade-off**: Soft deletes increase storage requirements and require consistent filtering. However, the benefits of data preservation and recovery outweigh the marginal storage cost.



## API Documentation

Full API documentation available at:
- [**Postman Collection**](https://spaceflight-operator-63958023-382415.postman.co/workspace/Aeshna-Jain's-Workspace~b7907cc8-abb5-4489-82ca-daba0f39c503/collection/47076302-47132617-4997-4423-9622-72a2e7872ccb?action=share&creator=47076302)

##  Features

### Core Features
- **Book Management**: CRUD operations with search through status and pagination
- **Borrow System**: Concurrency-safe book lending operations
- **Soft Deletes**: Data preservation with recovery capability
- **Pagination**: Efficient data loading with offset-based pagination
- **Indexing**: For efficient joins and query performance

### Advanced Features
- **Transaction Safety**: ACID-compliant operations
- **Concurrent Borrowing**: Race condition prevention with row-level locking
- **Audit Trail**: Soft delete timestamps and borrow history
- **Input Validation**: Comprehensive request validation middleware
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Connection Pooling**: Efficient database connection management through Prisma
- **Migration System**: Version-controlled database schema evolution

### Data Integrity
- **Foreign Key Constraints**: Referential integrity enforcement
- **Unique Constraints**: ISBN and email uniqueness


## Local Development Setup


### Installation Steps

1. **Clone the repository**:
```bash
git clone https://github.com/Aeshna0204/Pratilipi-Backend-Assignment.git
cd Pratilipi-Backend-Assignment
```
2. Create a .env file in the root directory and also run the migrations locally using these commands
```
RUN npx prisma generate
npx prisma migrate deploy
```
3. **Run with Docker Compose**:
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database container
- Application container
- Automatic database migrations

Use the http://localhost:3000/ as base url

### Environment-Specific Configuration

**.env**:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
#In Docker setup, the database host is the service name defined in docker-compose.yml
PORT=3000
JWT_SECRET= YOUR_JWT_SECRET
```


##  Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexing on frequently queried columns
- **Connection Pooling**: Automatically done by Prisma ORM
- **Query Optimization**: Selective field loading, avoiding N+1 queries
- **Pagination**: Offset-based pagination is used due to the relatively small, consistent, and slow-growing dataset.


##  Security Considerations

- **SQL Injection Prevention**: Parameterized queries via Prisma
- **Input Validation**: Schema validation on all endpoints
- **Error Handling**: No sensitive information in error responses
- **CORS Configuration**: Restricted origins in production
- **Environment Variables**: Sensitive data stored securely



---
