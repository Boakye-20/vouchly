# **App Name**: Vouchly

## Core Features

- **Authentication & Onboarding:**
  - University email (.ac.uk) validation
  - Email verification and password reset
  - 3-step profile setup (Academic → Availability → Preferences)
  - Dashboard access blocked until profile is complete

- **Partner Browsing & Filtering:**
  - Browse/filter by university, subject, Vouch Score, study atmosphere
  - Hide users from future browsing

- **Session Scheduling & Management:**
  - Request, schedule, reschedule, and cancel sessions
  - 4-hour rule for rescheduling/cancellation
  - Undo cancellation (5-minute window)
  - Session status tracking and booking conflict detection
  - Timezone handling and confirmation flows

- **Vouch Score System:**
  - AI-powered, event-based trust score (0-100)
  - Penalties/rewards for session behaviors (no-show, completion, reschedule, etc.)
  - Score history and transparency (all changes logged)
  - Manual adjustment by admin

- **Matching Algorithm:**
  - Weighted by schedule overlap (40%), Vouch Score similarity (30%), subject (15%), study atmosphere (10%), university (5%)
  - Gold/Silver/Bronze/Low match tiers

- **Messaging:**
  - In-app, real-time messaging with file/image sharing
  - Read/unread status and message history

- **Notifications:**
  - Real-time (websockets) for requests, updates, and messages
  - Toast notifications and planned email support

- **Admin & Analytics:**
  - User management, search/filter, account status, Vouch Score adjustment
  - Analytics: user growth, session rates, Vouch Score distribution, usage stats
  - System health checks and scheduled jobs
  - Dispute appeal workflow: users can appeal resolved/rejected disputes, submit reason/evidence, admins are notified (in-app/email), and appeals are reviewed in the admin dashboard.
  - Technical issue handling: Sentry crash detection, user reporting from session UI, admin analytics/filtering, Sentry event link-through, and compensation via dispute review.

- **Video Sessions:**
  - Embedded Jitsi video calls with Vouchly branding
  - Session timer, partner status, attendance tracking, and summary

- **Compliance & Security:**
  - GDPR, privacy policy, terms, cookie consent, data export/deletion
  - Strict Firestore rules, rate limiting, XSS/CSRF protection, encryption

- **UI/UX:**
  - Responsive, mobile-optimized, accessible (WCAG 2.1 in progress)
  - Modern, minimalist icons and branding
  - Subtle transitions and feedback animations

## AI Technology Stack

- **Google Gemini 2.0 Flash**: AI for Vouch Score and session logic
- **Genkit AI Framework**: Orchestration and flow management

## Style Guidelines

- Primary: Blue (`#2563EB`, Tailwind `blue-600`)
- Background: White (`#FFFFFF`) with slate/grey for secondary text
- Accent: Blue-600 for all interactive elements (no purple, no gradients)
- Fonts: Use the same font stack as the landing page for consistency
- Icons: Notion-style, minimalist icons; subtle animations only