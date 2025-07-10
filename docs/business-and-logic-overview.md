# Vouchly: Business and Logic Overview

> **Update July 2025:**
> - Added a comprehensive settings system (dark mode, font size, language, privacy, notification, account recovery)
> - Session history visibility: users can set their session history to public, study partners only, or private, enforced in the partner profile modal
> - Data export: users can export their data as JSON from the settings page
> - Accessibility improvements: font size scaling, dark mode, and language selection
> - UI/UX: all legal and info pages now use consistent card-based layouts, and the global header adapts to authentication state

## What is Vouchly?
Vouchly is a SaaS platform for UK university students to find reliable study partners, schedule sessions, and build academic accountability through a gamified, AI-powered trust system (Vouch Score). The platform features partner browsing, session management, in-app messaging, real-time notifications, and robust admin/analytics tools.

---

## Core Business Features

### 1. Authentication & Onboarding
- .ac.uk email validation, email verification, password reset
- 3-step profile setup (academic, availability, preferences)
- Dashboard access blocked until onboarding is complete

### 2. Partner Browsing & Filtering
- Filter by university, subject, Vouch Score, study atmosphere
- Hide users from future browsing

### 3. Session Scheduling & Management
- Request, schedule, reschedule, and cancel sessions
- 4-hour rule for rescheduling/cancellation
- Undo cancellation (5-minute window)
- Session status tracking, booking conflict detection, timezone handling
- Start/completion confirmation flows

### 4. Vouch Score System
- AI-powered, event-based trust score (0-100)
- Penalties/rewards for session behaviors (no-show, completion, reschedule, etc.)
- Score history and transparency (all changes logged)
- Manual adjustment by admin

### 5. Matching Algorithm
- Weighted by schedule overlap (40%), Vouch Score similarity (30%), subject (15%), study atmosphere (10%), university (5%)
- Gold/Silver/Bronze/Low match tiers

### 6. Messaging
- In-app, real-time messaging with file/image sharing
- Read/unread status and message history

### 7. Notifications
- Real-time (websockets) for requests, updates, and messages
- Toast notifications and planned email support

### 8. Admin & Analytics
- User management, search/filter, account status, Vouch Score adjustment
- Analytics: user growth, session rates, Vouch Score distribution, usage stats
- System health checks and scheduled jobs

### 9. Video Sessions
- Embedded Jitsi video calls with Vouchly branding
- Session timer, partner status, attendance tracking, and summary

### 10. Compliance & Security
- GDPR, privacy policy, terms, cookie consent, data export/deletion
- Strict Firestore rules, rate limiting, XSS/CSRF protection, encryption

### 11. UI/UX
- Responsive, mobile-optimized, accessible (WCAG 2.1 in progress)
- Modern, minimalist icons and branding
- Subtle transitions and feedback animations

### 12. User Settings & Accessibility (NEW)
- Global settings for dark mode, font size, language, privacy, notification, and account recovery
- All settings are persisted to Firebase and applied instantly across the app
- Accessibility: font size scaling, dark mode, and language selection for improved usability
- Data export: users can download all their data as JSON from the settings page
- Session history visibility: users can set their session history to public, study partners only, or private; this is enforced in the partner profile modal
- UI/UX: all legal and info pages use consistent card-based layouts, and the global header adapts to authentication state

---

## Vouch Score System - Detailed Business Logic

### Starting Score
- **All users start with 80 points** (fair baseline)
- **Range: 0-100** (enforced by system)

### Score Changes by Event Type

| Event Type | Score Change | Description |
|------------|-------------|-------------|
| `COMPLETION_CONFIRMED` | +2 | Both users confirm session completion |
| `UNILATERAL_NO_SHOW` | -10 | One user doesn't show up |
| `MUTUAL_NO_SHOW` | -5 | Neither user attends |
| `CONSECUTIVE_RESCHEDULE` | -5 | Second consecutive reschedule |
| `CANCELLED_LOCKED_IN` | -10 | Cancelled within 4 hours of start |
| `CANCELLED_WITH_NOTICE` | 0 | Cancelled with proper notice (no penalty) |
| `RESCHEDULED_WITH_NOTICE` | 0 | First reschedule (no penalty) |
| `START_CONFIRMED` | 0 | Session started (no points) |

### Rescheduling Logic
- **First reschedule:** No penalty (0 points)
- **Second consecutive reschedule:** -5 points
- **Consecutive reschedule counter resets** when:
  - A session is completed successfully
  - A penalty is applied (after second consecutive reschedule)
- **Non-consecutive reschedules:** No penalty (even if you reschedule 10 times in a month, as long as you complete sessions between them)

### Cancellation Logic
- **Cancelled with notice (>4 hours before):** No penalty (0 points)
- **Cancelled within 4 hours:** -10 points (treated as no-show)
- **Undo window:** 5 minutes to undo cancellation

### Session Completion Logic
- **Both users must confirm completion** for +2 points
- **If only one confirms:** No points awarded
- **Session must be started** (both users confirmed start) before completion points can be earned

### Vouch Score History
- **Every score change is logged** with:
  - Event type and reason
  - Score before and after
  - Session ID and timestamp
  - AI reasoning (when applicable)

---

## Session Management - Detailed Business Rules

### Session States
1. **`requested`** - Initial state when session is created
2. **`scheduled`** - Both users have accepted
3. **`in_progress`** - Both users have confirmed start
4. **`completed`** - Both users have confirmed completion
5. **`cancelled`** - Session was cancelled
6. **`pending_cancellation`** - Cancellation initiated, undo window active

### Session Confirmation Flow
1. **Start Confirmation:** Both users must confirm session start within 15 minutes
2. **Completion Confirmation:** Both users must confirm session completion
3. **If either user doesn't confirm:** No Vouch Score points awarded

### Booking Conflict Prevention
- **System checks for overlapping sessions** when scheduling
- **15-minute buffer** between sessions
- **Prevents double-booking** for both initiator and recipient

### 4-Hour Lock Rule
- **Sessions lock 4 hours before start time**
- **No rescheduling or cancellation** after lock-in
- **Penalty for late cancellation:** -10 points (treated as no-show)

### Undo System
- **5-minute window** to undo cancellation
- **Automatic finalization** after expiry
- **AI-managed cleanup** of expired undo actions

---

## Matching Algorithm - Detailed Breakdown

### Total Match Score Calculation (0-100)

| Component | Weight | Calculation Logic |
|-----------|--------|-------------------|
| **Schedule Overlap** | 40% | `min(shared_slots * 8, 40)` where shared_slots = identical availability slots |
| **Vouch Score Similarity** | 30% | `≤5 diff → 30`, `≤10 diff → 20`, `≤20 diff → 10`, `>20 diff → 0` |
| **Subject Compatibility** | 15% | Exact match → 15, same subject group → 10, otherwise 0 |
| **Study Atmosphere** | 10% | Same preference → 10, different → 0 |
| **University Bonus** | 5% | Same university → 5, different → 0 |

### Match Tiers
- **Gold Compatibility:** ≥80 points
- **Silver Compatibility:** 60-79 points  
- **Bronze Compatibility:** 40-59 points
- **Low Match:** <40 points (optionally hidden)

### Filtering & Sorting
- **Primary sort:** By Total Match Score (descending)
- **Secondary filters:** University, subject, Vouch Score range, study atmosphere
- **Real-time updates:** Match scores recalculate as Vouch Scores change

---

## AI-Powered Features

### Vouch Score AI Logic
- **Google Gemini 2.0 Flash** analyzes session outcomes
- **Context-aware penalty application** based on timing and circumstances
- **Intelligent dispute resolution** (basic implementation)
- **Automated session recovery** and undo management

### AI-Managed Session Recovery
- **Automatic finalization** of expired undo actions
- **Smart penalty application** for late cancellations
- **Session cleanup automation** for abandoned sessions

### AI Decision Making
- **Penalty severity determination** based on context
- **Reschedule pattern analysis** for consecutive tracking
- **No-show detection** and automatic penalty application

---

## Data Model & Security

### User Data Structure
```typescript
interface VouchlyUser {
    uid: string;
    email: string;
    name: string;
    university: string;
    course: string;
    subjectGroup: string;
    yearOfStudy: string;
    vouchScore: number; // 0-100
    consecutiveReschedules: number;
    sessionsCompleted: number;
    availability: {
        morning: string[];
        afternoon: string[];
        evening: string[];
    };
    coStudyingAtmosphere: 'Silent & Independent' | 'Quietly Co-working' | 'Motivational & Social';
    cameraPreference: string;
    status: 'available' | 'busy' | 'offline';
    createdAt: Date;
}
```

### Session Data Structure
```typescript
interface Session {
    id: string;
    initiatorId: string;
    recipientId: string;
    participantIds: string[];
    participants: Record<string, { name: string; email: string }>;
    status: SessionStatus;
    scheduledStartTime: Timestamp;
    durationMinutes: number;
    focusTopic: string;
    videoRoomUrl?: string;
    startConfirmedBy: string[];
    completionConfirmedBy: Record<string, boolean>;
    bothStartConfirmed: boolean;
    actualStartTime?: Timestamp;
    actualEndTime?: Timestamp;
    actualDuration?: number;
    cancelledBy?: string;
    cancellationReason?: string;
    pendingCancellationAt?: Timestamp;
    previousState?: SessionStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
```

### Vouch Score History
```typescript
interface VouchScoreHistory {
    change: number;
    reason: string;
    sessionId: string;
    timestamp: Timestamp;
    scoreBefore: number;
    scoreAfter: number;
}
```

### Security Rules
- **Users can only read/write their own data**
- **Session access restricted to participants**
- **Vouch Score cannot be directly modified by clients**
- **All score changes must go through server logic**
- **Rate limiting on all API endpoints**

---

## Admin & Analytics Features

### User Management
- **Search and filter users** by university, course, Vouch Score
- **Manual Vouch Score adjustments** with audit trail
- **Account status management** (active, suspended)
- **User suspension/activation** capabilities

### Analytics Dashboard
- **User growth metrics** (daily, weekly, monthly)
- **Session completion rates** by university, subject, time
- **Vouch Score distribution** across user base
- **Popular study times** and session duration patterns
- **University usage statistics** and top-performing institutions

### System Health Monitoring
- **Error tracking** with Sentry integration
- **Performance monitoring** for API endpoints
- **User analytics** and behavior patterns
- **System health checks** and automated alerts

---

## Scheduled Jobs & Automation

### Daily Jobs
- **Session cleanup** for abandoned sessions
- **Expired undo action cleanup**
- **No-show penalty application**
- **Email reminder system**

### Weekly Jobs
- **Analytics data aggregation**
- **User engagement reports**
- **System performance optimization**

### Monthly Jobs
- **Data archival** for old sessions
- **User retention analysis**
- **Feature usage statistics**

---

## Summary
Vouchly streamlines finding study partners, scheduling sessions, and building trust through an automated, transparent, and AI-powered system. The platform combines real-time collaboration, gamified accountability, and robust security to foster a productive and reliable academic community.