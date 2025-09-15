# Notification Orchestrator

A compact, production-ready service for managing user notification preferences and deciding whether to send notifications for incoming events.

---

## Table of Contents

- Overview
- Key Features
- Quick Start
  - Prerequisites
  - Install
  - Run (dev / prod)
- API Reference
  - Manage Preferences
  - Process Events
- Testing
- Postman Examples
- Contributing & License

---

## Overview

This project implements an event-driven Notification Orchestrator intended for SaaS platforms. It provides:

- A lightweight API to store and retrieve user notification preferences.
- Per-user "Do Not Disturb" (DND) windows to suppress notifications during quiet hours (including overnight ranges).
- Per-event-type subscription toggles (enable/disable specific event notifications).

The codebase is written in TypeScript and includes input validation and unit tests for the core DND logic.

---

## Key Features

- Do Not Disturb (DND) handling with correct overnight window semantics.
- Input validation on POST endpoints using `zod`.
- Unit tests (Jest) that cover normal and edge cases for DND logic.
- Simple, extensible data model for event settings per user.

---

## Quick Start

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

Clone and install dependencies:

```pwsh
git clone <repository-url>
cd notification-orchestrator
npm install
```

### Run (Development)

```pwsh
npm run dev
```

This runs the TypeScript code with automatic restarts on change (nodemon).

### Run (Production)

```pwsh
npm run build
npm start
```

The server listens on http://localhost:3000 by default.

---

## API Reference

All endpoints assume JSON bodies and return JSON responses. Errors use standard HTTP status codes.

### Manage Preferences

#### POST /preferences/:userId

Create or update a user's preferences.

URL params

- `userId` (string)

Body example

```json
{
  "dnd": { "start": "22:00", "end": "07:00" },
  "eventSettings": {
    "item_shipped": { "enabled": true },
    "invoice_generated": { "enabled": false }
  }
}
```

Success: 200 OK

```json
{ "message": "Preferences updated successfully." }
```

Errors: 400 Bad Request when payload invalid.

---

#### GET /preferences/:userId

Retrieve saved preferences for `userId`.

Success: 200 OK with JSON preferences. 404 Not Found if not present.

---

### Process Events

#### POST /events

Accepts an incoming event and returns a decision whether to notify.

Body example

```json
{
  "eventId": "evt_abcde",
  "userId": "usr_123",
  "eventType": "item_shipped",
  "timestamp": "2025-09-13T23:00:00Z"
}
```

Responses

- 202 Accepted — Notification should be sent

  ```json
  { "decision": "PROCESS_NOTIFICATION" }
  ```

- 200 OK — Notification suppressed; reason provided

  ```json
  { "decision": "DO_NOT_NOTIFY", "reason": "DND_ACTIVE" }
  ```

  or

  ```json
  { "decision": "DO_NOT_NOTIFY", "reason": "USER_UNSUBSCRIBED_FROM_EVENT" }
  ```

- 400 Bad Request — Invalid payload

---

## Testing

Run unit tests (Jest):

```pwsh
npm test
```

The project includes focused tests for the DND logic, covering overnight intervals and boundary conditions.

---

## Postman Examples

1. Set preferences

POST http://localhost:3000/preferences/usr_abcde

Body

```json
{
  "dnd": { "start": "22:00", "end": "07:00" },
  "eventSettings": {
    "item_shipped": { "enabled": true },
    "invoice_generated": { "enabled": false }
  }
}
```

2. Get preferences

GET http://localhost:3000/preferences/usr_abcde

3. Process event (allowed)

POST http://localhost:3000/events

```json
{
  "eventId": "evt_123",
  "userId": "usr_abcde",
  "eventType": "item_shipped",
  "timestamp": "2025-07-28T21:30:00Z"
}
```

Expected: 202 Accepted — { "decision": "PROCESS_NOTIFICATION" }

4. Process event (DND active)

POST http://localhost:3000/events

```json
{
  "eventId": "evt_456",
  "userId": "usr_abcde",
  "eventType": "item_shipped",
  "timestamp": "2025-07-28T23:00:00Z"
}
```

Expected: 200 OK — { "decision": "DO_NOT_NOTIFY", "reason": "DND_ACTIVE" }

---

## Contributing & License

Contributions are welcome. Please open issues or pull requests for improvements. Add tests for any new behavior.

Licensed under the MIT license (see LICENSE file if included).
