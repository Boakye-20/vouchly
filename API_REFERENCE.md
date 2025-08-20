# Vouchly API Reference

_Last updated: 2024-06-09_

---

## Authentication

### Sign In
- **POST** `/auth/signin`
- **Auth:** No
- **Description:** User login (handled by Firebase Auth on frontend)

### Sign Up
- **POST** `/auth/signup`
- **Auth:** No
- **Description:** User registration (handled by Firebase Auth on frontend)

---

## User APIs

### Get User Statistics
- **GET** `/api/user/stats`
- **Auth:** Yes (Bearer Firebase ID token)
- **Description:** Returns user session stats, vouch score, and analytics.
- **Example Request:**
```http
GET /api/user/stats
Authorization: Bearer <firebase_id_token>
```
- **Example Response:**
```json
{
  "sessionsCompleted": 12,
  "vouchScore": 88,
  "weeklyActivity": [...],
  ...
}
```

### Data Export (GDPR)
- **GET** `/api/user/data-export`
- **Auth:** Yes (Bearer Firebase ID token)
- **Description:** Returns all user data for download.
- **Example Request:**
```http
GET /api/user/data-export
Authorization: Bearer <firebase_id_token>
```

### Data Export Download
- **GET** `/api/user/data-export/download/[userId]`
- **Auth:** Yes (Bearer Firebase ID token)
- **Description:** Download user data as JSON file.

### Delete Account (GDPR)
- **DELETE** `/api/user/delete-account`
- **Auth:** Yes (Bearer Firebase ID token)
- **Description:** Permanently deletes user account and all data.
- **Example Request:**
```http
DELETE /api/user/delete-account
Authorization: Bearer <firebase_id_token>
```

---

## Session APIs

### Confirm Session Start
- **POST** `/api/sessions/[sessionId]/start-confirmation`
- **Auth:** Yes
- **Description:** Confirm that a user has started a session.
- **Example Request:**
```json
{
  "userId": "user_id"
}
```

### Complete Session
- **POST** `/api/sessions/[sessionId]/completion`
- **Auth:** Yes
- **Description:** Complete a session, provide feedback, and report issues.
- **Example Request:**
```json
{
  "userId": "user_id",
  "feedback": { "rating": 5, "feedback": "Great session!", "wouldStudyAgain": true },
  "issueReport": "optional issue description"
}
```

---

## Messaging APIs

### Mark Messages as Read
- **POST** `/api/messages/[sessionId]/read`
- **Auth:** Yes
- **Description:** Mark all messages in a session as read for a user.
- **Example Request:**
```json
{
  "userId": "user_id"
}
```

---

## Analytics APIs

### Get Analytics Data (Admin)
- **GET** `/api/admin-analytics`
- **Auth:** Yes (admin only)
- **Description:** Returns platform-wide analytics for admin dashboard.

---

## Admin APIs

### Get All Users
- **GET** `/api/admin/users`
- **Auth:** Yes (admin only)
- **Description:** Returns all users with stats.

### Update User Account Status
- **PATCH** `/api/admin/users/[userId]/status`
- **Auth:** Yes (admin only)
- **Description:** Activate or suspend a user account.
- **Example Request:**
```json
{
  "status": "active" | "suspended"
}
```

### Update User Vouch Score
- **PATCH** `/api/admin/users/[userId]/vouch-score`
- **Auth:** Yes (admin only)
- **Description:** Update a user's vouch score.
- **Example Request:**
```json
{
  "vouchScore": 95
}
```

### Scheduled Jobs
- **POST** `/api/admin/scheduled-jobs`
- **Auth:** Yes (admin only)
- **Description:** Manually execute a scheduled job.
- **Example Request:**
```json
{
  "jobType": "session_reminders" | "no_show_detection" | "session_cleanup" | "analytics_aggregation" | "inactive_reminders" | "no_show_penalties" | "all"
}
```

---

## Health & Monitoring

### Health Check
- **GET** `/api/health`
- **Auth:** No
- **Description:** Returns system health, DB status, and metrics.

---

## Disputes APIs

### User Dispute Reporting
- **POST** `/api/sessions/[sessionId]/disputes`
- **Auth:** Yes
- **Description:** Create a dispute for a session with optional evidence.
- **Example Request:**
```json
{
  "reason": "Partner did not attend",
  "details": "Waited 15 minutes, no response"
}
```

### Evidence Upload
- **POST** `/api/sessions/[sessionId]/disputes/upload`
- **Auth:** Yes
- **Description:** Upload evidence files (multipart/form-data) for a dispute.

### List Session Disputes
- **GET** `/api/sessions/[sessionId]/disputes`
- **Auth:** Yes
- **Description:** List disputes associated with the session.

### Admin List Disputes
- **GET** `/api/admin/disputes?status=open|under_review|resolved|rejected|appealed`
- **Auth:** Yes (admin only)
- **Description:** List disputes filtered by status.

### Admin Update Dispute
- **PATCH** `/api/admin/disputes`
- **Auth:** Yes (admin only)
- **Description:** Update dispute status and notes.
- **Example Request:**
```json
{
  "id": "dispute_id",
  "status": "under_review",
  "adminNotes": "Contacted both parties",
  "resolution": null
}
```

---

## Undo API

### Undo Recent Action
- **POST** `/api/undo`
- **Auth:** Yes
- **Description:** Undo the most recent eligible session action within the allowed window.

## Data Protection & Compliance
- **Privacy Policy:** [`/privacy`](./src/app/privacy/page.tsx)
- **Terms of Service:** [`/terms`](./src/app/terms/page.tsx)
- **Cookie Consent:** Banner on all pages
- **Data Export:** `/api/user/data-export`
- **Account Deletion:** `/api/user/delete-account`

---

For more details, see the [Deployment Guide](./DEPLOYMENT_GUIDE.md) or contact support@vouchly.com. 