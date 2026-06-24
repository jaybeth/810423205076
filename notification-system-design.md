# Notification System Design

## Overview

The notification platform allows students to receive updates regarding placements, events, and results. The system provides APIs to create, retrieve, update, and delete notifications. It also supports real-time notification delivery.

---

## Authentication

All APIs require authentication.

### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 1. Get All Notifications

### Endpoint

```http
GET /api/notifications
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "N001",
      "title": "Placement Drive",
      "message": "TCS placement drive scheduled for tomorrow.",
      "type": "placement",
      "isRead": false,
      "createdAt": "2026-06-24T10:00:00Z"
    }
  ]
}
```

---

## 2. Get Notification By ID

### Endpoint

```http
GET /api/notifications/{id}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "N001",
    "title": "Placement Drive",
    "message": "TCS placement drive scheduled for tomorrow.",
    "type": "placement",
    "isRead": false,
    "createdAt": "2026-06-24T10:00:00Z"
  }
}
```

---

## 3. Create Notification

### Endpoint

```http
POST /api/notifications
```

### Request

```json
{
  "title": "Placement Drive",
  "message": "TCS placement drive scheduled for tomorrow.",
  "type": "placement"
}
```

### Response

```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": "N001"
  }
}
```

---

## 4. Mark Notification As Read

### Endpoint

```http
PUT /api/notifications/{id}/read
```

### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 5. Delete Notification

### Endpoint

```http
DELETE /api/notifications/{id}
```

### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Notification JSON Schema

```json
{
  "id": "string",
  "title": "string",
  "message": "string",
  "type": "placement | event | result",
  "isRead": "boolean",
  "createdAt": "datetime"
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

## Real-Time Notification Mechanism

### Technology

WebSocket

### Connection Endpoint

```http
ws://localhost:3000/notifications
```

### Process

1. User logs in and establishes a WebSocket connection.
2. Server stores active connections.
3. When a new notification is created, the server pushes the notification instantly.
4. Connected users receive updates without refreshing the page.

### Real-Time Event Payload

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "N001",
    "title": "Placement Drive",
    "message": "TCS placement drive scheduled for tomorrow."
  }
}
```

---

## Core Actions Supported

1. Create Notification
2. Retrieve Notifications
3. View Notification Details
4. Mark Notification as Read
5. Delete Notification
6. Receive Real-Time Notifications

---

## Naming Convention

- GET /api/notifications
- GET /api/notifications/{id}
- POST /api/notifications
- PUT /api/notifications/{id}/read
- DELETE /api/notifications/{id}

These endpoints follow REST principles and provide a consistent API structure.

# Stage 2 - Database Design

## Database Choice

I recommend PostgreSQL (Relational Database).

### Reasons

1. Structured notification data.
2. ACID compliance for reliable transactions.
3. Fast querying with indexes.
4. Easy scalability.
5. Supports relationships between users and notifications.

---

## Database Schema

### Users Table

| Column | Type | Description |
|----------|----------|----------|
| id | UUID | Primary Key |
| name | VARCHAR(100) | User Name |
| email | VARCHAR(255) | User Email |
| created_at | TIMESTAMP | Created Time |

### Notifications Table

| Column | Type | Description |
|----------|----------|----------|
| id | UUID | Primary Key |
| title | VARCHAR(255) | Notification Title |
| message | TEXT | Notification Message |
| type | VARCHAR(50) | placement/event/result |
| created_at | TIMESTAMP | Created Time |

### User_Notifications Table

| Column | Type | Description |
|----------|----------|----------|
| id | UUID | Primary Key |
| user_id | UUID | User Reference |
| notification_id | UUID | Notification Reference |
| is_read | BOOLEAN | Read Status |
| read_at | TIMESTAMP | Read Time |

---

## SQL Queries

### Create Notification

```sql
INSERT INTO notifications(title, message, type)
VALUES(
'Placement Drive',
'TCS placement drive scheduled',
'placement'
);
```

### Get All Notifications

```sql
SELECT *
FROM notifications
ORDER BY created_at DESC;
```

### Get Notification By ID

```sql
SELECT *
FROM notifications
WHERE id='N001';
```

### Mark Notification As Read

```sql
UPDATE user_notifications
SET is_read=true,
read_at=NOW()
WHERE notification_id='N001'
AND user_id='U001';
```

### Delete Notification

```sql
DELETE FROM notifications
WHERE id='N001';
```

---

## Scaling Challenges

### Problem 1: Large Notification Volume

Millions of notifications may slow queries.

### Solution

- Database indexing
- Pagination
- Query optimization

---

### Problem 2: High Read Traffic

Many users fetching notifications simultaneously.

### Solution

- Redis caching
- Load balancing

---

### Problem 3: Real-Time Delivery Load

Thousands of concurrent WebSocket connections.

### Solution

- WebSocket clustering
- Message queue (Kafka/RabbitMQ)

---

### Problem 4: Database Growth

Storage size increases continuously.

### Solution

- Partition tables
- Archive old notifications
- Data retention policy

---

## Future Improvements

1. Redis caching
2. Kafka event streaming
3. Notification prioritization
4. Horizontal database scaling
5. Multi-region deployment

---

## Conclusion

PostgreSQL provides a reliable and scalable solution for storing notifications. Proper indexing, caching, partitioning, and message queues ensure high performance even as notification volume and user traffic increase.


# Stage 3 - Query Optimization

## Is the Query Accurate?

Given Query:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

The query is functionally correct because it fetches all unread notifications for a specific student and sorts them by creation time.

However, with 50,000 students and 5,000,000 notifications, the query may become slow.

---

## Why Is This Query Slow?

1. Large table size (5 million records).
2. Filtering on multiple columns.
3. Sorting using ORDER BY createdAt.
4. Possible full table scan if indexes are missing.
5. Returning all columns using SELECT * increases I/O cost.

---

## Improvements

### Optimized Query

```sql
SELECT id, title, message, createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```

### Recommended Composite Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

This index allows the database to:

- Quickly locate notifications for a student.
- Filter unread notifications efficiently.
- Avoid expensive sorting operations.

---

## Computational Cost

### Without Index

- Time Complexity: O(N)
- Full table scan may occur.

### With Composite Index

- Time Complexity: O(log N)
- Faster filtering and sorting.

---

## Should We Add Indexes On Every Column?

No.

Adding indexes on every column is not recommended.

### Problems

1. Increased storage usage.
2. Slower INSERT, UPDATE, and DELETE operations.
3. Index maintenance overhead.
4. Many indexes may never be used.

### Best Practice

Create indexes only on:

- Frequently searched columns.
- JOIN columns.
- ORDER BY columns.
- High-cardinality columns.

---

## Query To Find Students Who Received Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 DAY';
```

### PostgreSQL Version

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= CURRENT_TIMESTAMP - INTERVAL '7 days';
```

---

## Additional Scalability Improvements

1. Pagination

```sql
LIMIT 50 OFFSET 0;
```

2. Table Partitioning

Partition notifications by month or year.

3. Caching

Use Redis for frequently accessed notifications.

4. Archiving

Move old notifications to archive tables.

5. Read Replicas

Use read replicas for heavy read traffic.

---

## Conclusion

The query is logically correct but may become slow at scale. A composite index on `(studentID, isRead, createdAt)` significantly improves performance. Indexing every column is not a good strategy due to storage and maintenance costs. Proper indexing, caching, partitioning, and pagination provide a scalable solution.

# Stage 4 - Performance Optimization

## Problem

Notifications are fetched from the database on every page load for every student. As the number of users increases, the database receives a large number of repeated read requests, causing high latency and poor user experience.

---

## Proposed Solutions

### 1. Redis Caching

Store frequently accessed notifications in Redis.

#### Workflow

1. Application checks Redis cache.
2. If data exists, return cached notifications.
3. If data does not exist, fetch from database and store in cache.

#### Advantages

- Very fast response times.
- Reduces database load.
- Improves user experience.

#### Trade-Offs

- Additional infrastructure required.
- Cache invalidation must be handled carefully.

---

### 2. Pagination

Instead of fetching all notifications, return a limited number.

#### Example

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

#### Advantages

- Reduces query execution time.
- Reduces network traffic.

#### Trade-Offs

- Additional API logic required.
- Users must load additional pages.

---

### 3. Real-Time Push Notifications

Use WebSockets instead of repeatedly polling the server.

#### Workflow

1. User establishes WebSocket connection.
2. Server pushes new notifications instantly.
3. Client updates UI without page refresh.

#### Advantages

- Real-time user experience.
- Reduces repeated database queries.

#### Trade-Offs

- More complex implementation.
- Requires connection management.

---

### 4. Read Replicas

Use database replicas for read operations.

#### Advantages

- Distributes read traffic.
- Improves scalability.

#### Trade-Offs

- Additional infrastructure cost.
- Replication lag may occur.

---

### 5. Notification Count API

Instead of loading all notifications on page load, fetch only unread count.

#### Example Response

```json
{
  "unreadCount": 5
}
```

#### Advantages

- Minimal database usage.
- Faster page loading.

#### Trade-Offs

- Full notifications require another API call.

---

## Recommended Architecture

1. PostgreSQL as primary database.
2. Redis for caching.
3. WebSocket for real-time delivery.
4. Pagination for notification listing.
5. Read replicas for heavy read traffic.

---

## Conclusion

The best approach is to combine Redis caching, WebSocket-based real-time updates, pagination, and read replicas. This significantly reduces database load, improves scalability, and provides a better user experience even with millions of notifications and thousands of concurrent users.


# Stage 5 - Reliable Notification Delivery

## Problems With Current Implementation

Current pseudocode:

```python
function notify_all(student_ids, message):
    for student_id in student_ids:
        send_email(student_id, message)
        save_to_db(student_id, message)
        push_to_app(student_id, message)
```

### Issues

1. Sequential processing is very slow for 50,000 students.
2. Email API failures stop the flow.
3. No retry mechanism.
4. No fault tolerance.
5. High response time.
6. Difficult to scale.
7. Partial failures may create inconsistent data.

---

## Example Failure Scenario

Suppose email delivery fails for 200 students.

Questions:

- Were notifications saved to DB?
- Did users receive in-app notifications?
- Which 200 students failed?

The current implementation does not provide reliable recovery.

---

## Recommended Solution

Use an asynchronous event-driven architecture.

### Components

1. API Service
2. PostgreSQL Database
3. Message Queue (Kafka/RabbitMQ)
4. Email Worker
5. Notification Worker
6. WebSocket Service

---

## Improved Workflow

### Step 1

Store notification request in database.

### Step 2

Publish event to queue.

### Step 3

Workers process notifications independently.

### Step 4

Failed messages are retried automatically.

### Step 5

Dead Letter Queue stores permanently failed messages.

---

## Revised Pseudocode

```python
function notify_all(student_ids, message):

    notification_id = save_notification(message)

    for student_id in student_ids:

        publish_to_queue(
            notification_id,
            student_id,
            message
        )

    return "Notification request accepted"
```

### Email Worker

```python
function email_worker():

    while queue_not_empty():

        task = consume()

        try:
            send_email(task.student_id, task.message)
            mark_email_success(task.id)

        except:
            retry(task)
```

### App Notification Worker

```python
function notification_worker():

    while queue_not_empty():

        task = consume()

        save_to_db(task.student_id, task.message)

        push_to_app(task.student_id, task.message)
```

---

## Should Email And DB Save Happen Together?

No.

They should be separated.

### Reasons

1. Better scalability.
2. Independent failure handling.
3. Faster response time.
4. Easier retries.
5. Improved reliability.

---

## Retry Strategy

1. Retry after 1 minute.
2. Retry after 5 minutes.
3. Retry after 15 minutes.
4. Move to Dead Letter Queue after maximum retries.

---

## Advantages Of Proposed Design

- High scalability
- Fault tolerance
- Faster processing
- Reliable delivery
- Easy monitoring
- Supports millions of notifications

---

## Conclusion

The original implementation is slow and unreliable for large-scale notification delivery. Using asynchronous processing, message queues, worker services, retries, and dead-letter queues ensures reliable and scalable notification delivery to all students.