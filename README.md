# PiSync Backend

A lightweight backend service for PiSync, enabling PiBook and PiBox devices to sync offline learning progress (videos watched, notes taken, assignments completed) to the cloud once internet connectivity is available.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Tech Stack](#tech-stack)  
3. [Prerequisites](#prerequisites)  
4. [Installation & Setup](#installation--setup)  
   - [Clone the Repository](#clone-the-repository)  
   - [Install Dependencies](#install-dependencies)  
   - [Environment Variables](#environment-variables)  
   - [Run in Development](#run-in-development)  
   - [Run in Production](#run-in-production)  
5. [Directory Structure](#directory-structure)  
6. [API Endpoints](#api-endpoints)  
   - [1. Record a Sync Event](#1-record-a-sync-event)  
   - [2. Fetch Device Sync History](#2-fetch-device-sync-history)  
   - [3. List Devices with Repeated Failures](#3-list-devices-with-repeated-failures)  
7. [Testing Locally](#testing-locally)  
   - [Using cURL](#using-curl)  
   - [Using Postman / HTTPie](#using-postman--httpie)  
8. [Bonus: 3-Consecutive-Failure Notification](#bonus-3-consecutive-failure-notification)  
9. [Scaling & Optimization (One-Pager)](#scaling--optimization-one-pager)  
10. [License](#license)  

---

## Project Overview

PiSync Backend provides:

- **Recording** sync events from devices (`POST /api/sync-event`).  
- **Retrieving** a specific device’s sync history (`GET /api/device/:id/sync-history`).  
- **Listing** devices that have more than three failed syncs (`GET /api/devices/repeated-failures`).  
- **Bonus**: Console notification when a device fails to sync three times in a row.

Each sync event includes:
- `deviceId` (string)
- `timestamp` (ISO 8601)
- `totalFilesSync` (integer ≥ 0)
- `totalErrors` (integer ≥ 0)
- `internetSpeed` (number in Mbps)

All data is stored in MongoDB; Mongoose is used for schema definitions and queries.

---

## Tech Stack

- **Node.js** (v14+)
- **Express** (v4.x)
- **MongoDB** (v4.4+) with **Mongoose** (v6.x)
- **dotenv** for environment management
- **express-validator** for request validation
- **morgan** for HTTP request logging (development)
- **cors** for handling CORS
- **nodemon** (dev) for automatic server restarts

---

## Prerequisites

1. **Node.js** and **npm** installed (v14 or newer).  
2. **MongoDB** instance (local or Atlas).

---

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/yourclown/Pi-Sync.git
cd pi-sync-backend
Install Dependencies
bash
Copy
Edit
npm install
Environment Variables
Create a .env file in the project root containing:

dotenv
Copy
Edit
NODE_ENV=development
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
NODE_ENV: development or production.

PORT: Port for the server (default: 5000).

MONGODB_URI:

Local MongoDB example:

bash
Copy
Edit
mongodb://localhost:27017/pi_sync_db
MongoDB Atlas example:

bash
Copy
Edit
mongodb+srv://<username>:<password>@cluster0.mongodb.net/pi_sync_db?retryWrites=true&w=majority
If your password contains special characters (e.g. @), URL-encode them (@ → %40).

Run in Development
bash
Copy
Edit
npm run dev
Uses nodemon to restart on code changes.

Logs requests via morgan.

Loads .env variables via dotenv.

Run in Production
bash
Copy
Edit
npm start
Assumes NODE_ENV=production.

Disables development-only middlewares.

Directory Structure
bash
Copy
Edit
pi-sync-backend/
├── package.json
├── README.md
├── .env                       # (not checked in)
├── src/
│   ├── app.js                 # Main application entrypoint
│   ├── config/
│   │   └── db.js              # MongoDB connection logic
│   ├── models/
│   │   └── SyncEvent.js       # Mongoose schema for sync events
│   ├── controllers/
│   │   └── syncEventController.js
│   ├── routes/
│   │   └── syncEventRoutes.js
│   ├── middleware/
│   │   ├── validateRequest.js # Request validation
│   │   └── errorHandler.js    # Global error handler
│   └── utils/
│       └── notifications.js   # 3-consecutive-failure logic
└── swagger.json               # (optional) OpenAPI/Swagger spec
API Endpoints
All endpoints are prefixed with /api. All responses are JSON.

1. Record a Sync Event
bash
Copy
Edit
POST /api/sync-event
Content-Type: application/json
Request Body
Field	Type	Required	Description
deviceId	String	Yes	Unique ID of the device (e.g. pi_box_001).
timestamp	String	Yes	ISO 8601 date/time of sync (e.g. 2025-06-01T08:00:00Z).
totalFilesSync	Number	Yes	Number of files successfully synced (≥ 0).
totalErrors	Number	Yes	Number of files failed (≥ 0).
internetSpeed	Number	Yes	Measured speed (Mbps).

Example Request (cURL)
bash
Copy
Edit
curl -X POST http://localhost:5000/api/sync-event \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "pi_box_test_001",
    "timestamp": "2025-06-01T08:00:00Z",
    "totalFilesSync": 12,
    "totalErrors": 2,
    "internetSpeed": 5.2
  }'
Success Response (201 Created)
json
Copy
Edit
{
  "message": "Sync event recorded successfully.",
  "data": {
    "_id": "60f7b0e5b7e123456789abcd",
    "deviceId": "pi_box_test_001",
    "timestamp": "2025-06-01T08:00:00.000Z",
    "totalFilesSync": 12,
    "totalErrors": 2,
    "internetSpeed": 5.2,
    "createdAt": "2025-06-01T08:00:05.123Z",
    "__v": 0
  }
}
Validation Errors (400 Bad Request)
json
Copy
Edit
{
  "message": "Validation failed.",
  "errors": [
    { "field": "deviceId", "message": "deviceId is required." },
    { "field": "timestamp", "message": "timestamp must be a valid ISO8601 date." }
  ]
}
Error (500 Internal Server Error)
json
Copy
Edit
{ "message": "Internal Server Error" }
2. Fetch Device Sync History
ruby
Copy
Edit
GET /api/device/:id/sync-history
:id (path): deviceId of the device (string).

Query parameters (optional):

page (integer ≥ 1; default: 1)

limit (integer ≥ 1; default: 50)

Example Requests
Default page & limit:

bash
Copy
Edit
curl http://localhost:5000/api/device/pi_box_test_001/sync-history
Page 2, 20 records per page:

bash
Copy
Edit
curl "http://localhost:5000/api/device/pi_box_test_001/sync-history?page=2&limit=20"
Success Response (200 OK)
json
Copy
Edit
{
  "deviceId": "pi_box_test_001",
  "page": 1,
  "limit": 50,
  "totalCount": 124,
  "totalPages": 3,
  "data": [
    {
      "_id": "60f7b0e5b7e123456789abcd",
      "deviceId": "pi_box_test_001",
      "timestamp": "2025-06-01T08:00:00.000Z",
      "totalFilesSync": 12,
      "totalErrors": 2,
      "internetSpeed": 5.2,
      "createdAt": "2025-06-01T08:00:05.123Z",
      "__v": 0
    },
    {
      "_id": "60f7b0d3b7e123456789abc9",
      "deviceId": "pi_box_test_001",
      "timestamp": "2025-05-31T22:30:00.000Z",
      "totalFilesSync": 15,
      "totalErrors": 0,
      "internetSpeed": 7.1,
      "createdAt": "2025-05-31T22:30:05.456Z",
      "__v": 0
    }
    /* … up to `limit` items */
  ]
}
Validation Errors (400 Bad Request)
json
Copy
Edit
{
  "message": "Validation failed.",
  "errors": [
    { "field": "id", "message": "Device ID must be a string." },
    { "field": "page", "message": "page must be an integer ≥ 1." }
  ]
}
Error (500 Internal Server Error)
json
Copy
Edit
{ "message": "Internal Server Error" }
3. List Devices with Repeated Failures
bash
Copy
Edit
GET /api/devices/repeated-failures
No parameters required.

Example Request
bash
Copy
Edit
curl http://localhost:5000/api/devices/repeated-failures
Success Response (200 OK)
json
Copy
Edit
{
  "count": 2,
  "data": [
    { "deviceId": "pi_box_9999", "failureCount": 7 },
    { "deviceId": "pi_book_1234", "failureCount": 4 }
  ]
}
count: Total number of devices with more than 3 failures.

data: Array of { deviceId, failureCount }.

Error (500 Internal Server Error)
json
Copy
Edit
{ "message": "Internal Server Error" }
Testing Locally
Ensure MongoDB is running at the URI defined in .env (e.g., mongodb://localhost:27017/pi_sync_db).

Install dependencies and start the server:

bash
Copy
Edit
npm install
npm run dev
Use cURL, Postman, or HTTPie to interact with the APIs:

Using cURL
Record a Sync Event:

bash
Copy
Edit
curl -X POST http://localhost:5000/api/sync-event \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "pi_box_test_001",
    "timestamp": "2025-06-01T12:10:00Z",
    "totalFilesSync": 10,
    "totalErrors": 2,
    "internetSpeed": 8.4
  }'
Fetch Sync History:

bash
Copy
Edit
curl http://localhost:5000/api/device/pi_box_test_001/sync-history
Fetch Devices with Repeated Failures:

bash
Copy
Edit
curl http://localhost:5000/api/devices/repeated-failures
Bonus: 3-Consecutive-Failure Notification
Each time a sync event is recorded, the backend runs a check to see if that device’s three most recent events all have totalErrors > 0. If so, it logs:

bash
Copy
Edit
[Notification] Device "pi_box_test_001" has failed to sync 3 times in a row.
How to Test
Send three consecutive POST requests with totalErrors > 0 for the same deviceId.

On the third request, check the server console—you’ll see the notification.

Scaling & Optimization (One-Pager)
To support ~100 000 devices syncing hourly (≈ 28 writes/sec):

Database Layer

Sharding on a hashed deviceId to spread write load evenly.

Indexes:

Compound { deviceId: 1, timestamp: -1 } for fast per-device history.

Partial index on { totalErrors: 1 } (where totalErrors > 0) to speed up failure aggregations.

Pre-aggregated Counters: Maintain a separate device_failure_counters collection. On each failed event, run:

js
Copy
Edit
db.device_failure_counters.updateOne(
  { deviceId: <deviceId> },
  { $inc: { totalFailures: 1 } },
  { upsert: true }
);
Then GET /devices/repeated-failures is a simple indexed query:

js
Copy
Edit
db.device_failure_counters.find({ totalFailures: { $gt: 3 } });
TTL Index / Archival: Auto-expire events older than 90 days via a TTL index on createdAt. Archive expired docs to S3 or a data warehouse if needed.

Application Layer

Horizontal Scaling: Multiple Node.js instances behind a load balancer (e.g. Nginx or AWS ALB).

Connection Pooling: Configure Mongoose with maxPoolSize: 50+ for high concurrency.

Rate Limiting: Use express-rate-limit or a Redis token bucket to prevent abuse (e.g. max 100 requests/hour/device).

Caching: Cache recent pages of a device’s history in Redis (TTL = 2–5 minutes).

Asynchronous Writes: Publish sync events to a message queue (RabbitMQ/Kafka); consume and write to MongoDB in batches.

Monitoring & Observability

Metrics: Prometheus or DataDog for request latency, error rates, MongoDB replication lag.

Logging: Centralized logs (ELK stack or CloudWatch). Alerts if error rate > 1% or replication lag > 5 s.

Health Checks: /health endpoint checking DB connectivity. Hook into Kubernetes liveness/readiness probes.

Security & Reliability

Authentication: Require an API key or JWT for /sync-event. Validate in middleware.

Input Validation: Already enforced via express-validator.

TLS/HTTPS: Enforce HTTPS for all endpoints.

Backups: Daily MongoDB snapshots, incremental backups to S3, and periodic restore testing.

License
This project is licensed under the MIT License.

Feel free to modify or extend as needed.