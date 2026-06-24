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