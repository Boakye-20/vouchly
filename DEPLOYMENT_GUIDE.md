# Vouchly Deployment Guide

## .gitignore and Sensitive Files

**Important:** Before deploying, make sure to restore your `.gitignore` file! This file ensures that sensitive credentials (like `.env.local`), build artifacts, and other development files are not accidentally committed to your repository or deployed to production. 

- If you temporarily removed `.gitignore` for debugging, restore it before pushing or deploying.
- Double-check that `.env.local`, `tsconfig.json`, and any local-only files are properly ignored.
- See the default `.gitignore` template for Node/Next.js projects for best practices.


## Environment Variables

### Required for Production
Add these to your production environment (e.g., Vercel, Netlify, or your hosting platform):

### Admin Configuration
To set up admin access, you can either:
1. **Email-based admin list** (configured in `src/app/dashboard/layout.tsx`):
   ```typescript
   const adminEmails = ['admin@vouchly.com', 'pkwarts@gmail.com'];
   ```
2. **Database flag** (set `isAdmin: true` in user document in Firestore)
3. **Custom admin logic** (implement your own admin role system)

```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key

# Resend Email Service
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=verify@yourdomain.com
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin (Server-side only)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-production-url.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_PROJECT=your_project_name
SENTRY_ORG=your_org_name

# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-production-url.com
```

## Important URLs

### Admin & Restricted Areas
- **Admin Dashboard**: `/dashboard/admin`
- **Analytics Dashboard**: `/dashboard/admin/analytics`
- **User Management**: `/dashboard/admin/users`
- **Health Dashboard**: `/dashboard/admin/health`
- **Health Check API**: `/api/health` (GET)
- **Session Cleanup API**: `/api/admin/cleanup-sessions` (POST)
- **User Status Update API**: `/api/admin/users/[userId]/status` (PATCH)
- **Vouch Score Update API**: `/api/admin/users/[userId]/vouch-score` (PATCH)

### Public Routes
- **Homepage**: `/`
- **Login**: `/auth/signin`
- **Sign Up**: `/auth/signup`
- **Pricing**: `/pricing`
- **About**: `/about`
- **Contact**: `/contact`
- **Privacy Policy**: `/privacy`
- **Terms of Service**: `/terms`

### User Dashboard
- **Dashboard Home**: `/dashboard`
- **Sessions**: `/dashboard/sessions`
- **Messages**: `/dashboard/messages`
- **Conversation**: `/dashboard/messages/[sessionId]`
- **Statistics**: `/dashboard/stats`
- **Settings**: `/dashboard/settings`
- **Billing**: `/dashboard/billing`
- **Data Export API**: `/api/user/data-export` (GET, authenticated)
- **Data Export Download API**: `/api/user/data-export/download/[userId]` (GET, authenticated)
- **Account Deletion API**: `/api/user/delete-account` (DELETE, authenticated)

### Cookie Consent
- **Cookie Consent Banner**: Shown on all pages (frontend component)

## Deployment Steps

### 1. Pre-Deployment Checks
- [ ] Update all dependencies: `npm update`
- [ ] Run tests: `npm run test`
- [ ] Build the project: `npm run build`
- [ ] Verify environment variables are set in your hosting platform
- [ ] Ensure Firebase Admin credentials are properly configured

### 2. Security Considerations
- [ ] Enable HTTPS for all routes
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting for API routes
- [ ] Set up security headers
- [ ] Enable CSP (Content Security Policy)
- [ ] API rate limiting enabled: 30 requests/minute per IP (in-memory, demo only)
  - To test: Rapidly call any API (e.g., /api/user/stats) >30 times/minute; you should receive HTTP 429 Too Many Requests.
- Input validation enforced on API routes (see session completion API for example)
  - To test: Send a POST to /api/sessions/[sessionId]/completion with missing or wrong-type userId; you should receive HTTP 400 with error details.
- XSS protection: React escapes all output by default. No user-generated HTML is rendered unsanitized. If you add rich text, use a sanitizer (e.g., DOMPurify).
  - To test: Try to inject <script> tags in any user input; they will not execute in the UI.
- CSRF protection: Next.js API routes are protected by browser same-origin policy by default. For sensitive POST routes, use CSRF tokens if exposing to third-party clients.
  - To test: Try to POST to an API route from a different origin; browser will block unless CORS is enabled.
- Data encryption: Firestore encrypts all data at rest and in transit. For extra sensitive fields, consider field-level encryption (not currently implemented).
  - To verify: See Firestore security docs; all traffic is HTTPS and encrypted at rest by Google Cloud.

### 3. Performance Optimization
- [ ] Enable image optimization in `next.config.js`
- [ ] Configure CDN for static assets
- [ ] Set up caching headers
- [ ] Enable compression

### 4. Monitoring & Error Tracking
- [ ] Verify Sentry integration
- [ ] Set up Google Analytics (see Google Analytics Setup below)
- [ ] Set up logging
- [ ] Configure alerts for errors
- [ ] Set up performance monitoring

### 5. Post-Deployment
- [ ] Verify all routes are working
- [ ] Test authentication flows
- [ ] Check admin functionality
- [ ] Verify analytics are being collected
- [ ] Test payment processing (if applicable)

## Environment-Specific Notes

### Development
- Uses `.env.local` for environment variables
- Runs on `http://localhost:3000` by default
- Has hot-reload enabled
- Shows detailed error messages

### Production
- Uses environment variables from hosting platform
- Has minified and optimized builds
- Error tracking enabled
- Performance optimizations applied

## Troubleshooting

### Common Issues
1. **Environment Variables Not Loading**
   - Verify variable names match exactly
   - Check for typos
   - Ensure they're properly exposed to the client/server

2. **Firebase Authentication Issues**
   - Verify domain is whitelisted in Firebase Console
   - Check API keys and project configuration
   - Ensure proper redirect URIs are set

3. **API Route Errors**
   - Check server logs
   - Verify CORS settings
   - Ensure proper authentication headers

## Admin Dashboard

### Access Control
The admin dashboard is accessible to users with admin privileges. Admin access is determined by:
- Email-based admin list: `admin@vouchly.com`, `pkwarts@gmail.com`
- Database flag: `isAdmin: true` in user document
- Admin navigation appears automatically for authorized users

### Admin Features

#### User Management (`/dashboard/admin/users`)
- **User List**: View all registered users with search and filtering
- **User Details**: Comprehensive user profile information
- **Account Status Management**: Activate/suspend user accounts
- **Vouch Score Adjustments**: Manual score modifications with audit trail
- **Statistics**: Total users, active users, suspended users counts

#### Analytics Dashboard (`/dashboard/admin/analytics`)
- **Session Metrics**: Total, completed, cancelled sessions
- **User Activity**: Active users, completion rates, no-show rates
- **Trend Analysis**: Weekly session trends and patterns
- **Performance Monitoring**: Average session duration, reschedule rates

### Admin API Endpoints

#### User Management APIs
```bash
# Get all users with stats
GET /api/admin/users

# Update user account status
PATCH /api/admin/users/[userId]/status
Body: { "status": "active" | "suspended" }

# Update user vouch score
PATCH /api/admin/users/[userId]/vouch-score
Body: { "vouchScore": number (0-100) }
```

#### Analytics APIs
```bash
# Get analytics data
GET /api/admin-analytics
```

#### Scheduled Jobs APIs
```bash
# Execute scheduled jobs manually
POST /api/admin/scheduled-jobs
Body: { "jobType": "session_reminders" | "no_show_detection" | "session_cleanup" | "analytics_aggregation" | "inactive_reminders" | "no_show_penalties" | "all" }

# Get available job types
GET /api/admin/scheduled-jobs
```

### Scheduled Jobs Management

#### Available Jobs
- **Session Reminders**: Send 30-minute reminders for upcoming sessions
- **No-Show Detection**: Flag sessions that weren't started on time
- **Session Cleanup**: Finalize expired cancellations and clean undo actions
- **Analytics Aggregation**: Daily statistics and metrics collection
- **Inactive User Reminders**: Weekly reminders for inactive users
- **No-Show Penalties**: Apply vouch score penalties for no-shows

#### Recommended Schedule
- **Session Reminders**: Every 5 minutes
- **No-Show Detection**: Every 10 minutes
- **Session Cleanup**: Every hour
- **Analytics Aggregation**: Daily at 2 AM
- **Inactive User Reminders**: Weekly on Monday at 9 AM
- **No-Show Penalties**: Daily at 1 AM

#### Manual Execution
Use the admin dashboard at `/dashboard/admin/scheduled-jobs` to:
- Execute individual jobs for testing
- Run all jobs at once
- View execution results and logs
- Monitor job performance

#### Messaging APIs
```bash
# Mark messages as read
POST /api/messages/[sessionId]/read
Body: { "userId": "user_id" }
```

#### Session Management APIs
```bash
# Confirm session start
POST /api/sessions/[sessionId]/start-confirmation
Body: { "userId": "user_id" }

# Complete session with feedback
POST /api/sessions/[sessionId]/completion
Body: { 
  "userId": "user_id",
  "feedback": { "rating": 5, "feedback": "...", "wouldStudyAgain": true },
  "issueReport": "optional issue description"
}
```

#### User Statistics API
```bash
# Get user statistics (requires authentication)
GET /api/user/stats
Headers: { "Authorization": "Bearer <firebase_id_token>" }
```

### Admin Security Notes
- Admin routes are protected by email-based authentication
- All admin actions are logged for audit purposes
- Vouch score changes create audit trail entries
- Consider implementing more robust role-based access control for production

### Messaging System Features
- **Real-time messaging** between session participants
- **File and image sharing** (up to 10MB per file)
- **Read/unread status** with automatic marking when viewed
- **Message history** with attachment support
- **Unread message indicators** in conversation list
- **Attachment previews** in message list
- **Supported file types**: Images, PDFs, documents, text files

### Session Management Features
- **Session start confirmation** requiring both participants to confirm
- **Real-time session timer** with progress tracking and alerts
- **Session completion flow** with mutual confirmation
- **Session feedback system** with ratings and comments
- **Issue reporting system** for session problems
- **No-show detection** for missed sessions
- **Session duration tracking** with actual vs scheduled time
- **Video room integration** (basic setup ready for third-party integration)

### User Statistics Features
- **Personal analytics dashboard** with session history and trends
- **Vouch score tracking** with historical changes and reasons
- **Study partner insights** showing partner relationships and ratings
- **Achievement system** with 6 different achievements and progress tracking
- **Session duration analysis** showing preferred session lengths
- **Weekly activity charts** displaying study patterns
- **Early ending statistics** tracking session completion patterns
- **Progress visualization** with charts and graphs for easy interpretation

## Maintenance

### Regular Checks
- Monitor error rates in Sentry
- Review performance metrics
- Check for dependency updates
- Monitor database usage and performance
- Run session cleanup job periodically (see Session Management below)
- Review admin user management activities

### Session Management
The app includes automatic session cleanup functionality:

1. **Manual Cleanup**: Use the API endpoint `/api/admin/cleanup-sessions` (POST) to manually trigger session cleanup
2. **Scheduled Cleanup**: Set up a cron job or Firebase Cloud Function to run `runSessionCleanupJob()` periodically
3. **What it does**:
   - Finalizes expired pending cancellations (moves them to 'cancelled' status)
   - Applies vouch score penalties for expired undo windows
   - Cleans up expired undo actions from the database
   - Logs all cleanup activities for audit purposes

**Recommended Schedule**: Run cleanup every 10-15 minutes to ensure timely session finalization.

### Backup Strategy
- Regular database backups
- Version control for all code changes
- Document all configuration changes

## Email Verification with Resend

### Prerequisites
- A domain name (e.g., yourdomain.com) that you can modify DNS settings for
- Access to your domain's DNS management console

### Production Setup

1. **Create a Resend Account**
   - Sign up at [Resend.com](https://resend.com)
   - Verify your email address

2. **Add and Verify Your Domain**
   - Go to [Resend Domains](https://resend.com/domains)
   - Click "Add Domain" and enter your domain (e.g., `yourdomain.com`)
   - Add the required DNS records to your domain provider:
     ```
     Type    Name                  Value
     -----   -------------------   ---------------------------------------
     MX      @                     feedback-smtp.us-east-1.amazonses.com
     TXT     _amazonses           your-verification-string
     CNAME   bounces              bounces.yourdomain.com.dmarc.postmarkapp.com
     CNAME   dkim1._domainkey     dkim1.yourdomain.com.dmarc.postmarkapp.com
     CNAME   dkim2._domainkey     dkim2.yourdomain.com.dmarc.postmarkapp.com
     ```
   - Wait for DNS propagation (can take up to 48 hours, but usually within minutes)
   - Verify domain in Resend dashboard once all checks pass

3. **Create an API Key**
   - Go to [Resend API Keys](https://resend.com/api-keys)
   - Click "Create API Key"
   - Name it (e.g., "Vouchly Production")
   - Copy the API key (you won't be able to see it again)

4. **Configure Environment Variables**
   Add these to your production environment:
   ```env
   # Required
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=verify@yourdomain.com  # Must match your verified domain
   
   # Optional
   NODE_ENV=production
   ```

### Development Setup

1. **Test Domain**
   - Use `onboarding@resend.dev` as your `from` address
   - Add test email addresses in Resend under "Authorized Recipients"
   - Test emails will be visible in the Resend dashboard

2. **Environment Variables**
   ```env
   RESEND_API_KEY=re_your_test_api_key
   RESEND_FROM_EMAIL=onboarding@resend.dev
   NODE_ENV=development
   ```

### Testing

1. **Local Testing**
   - Run the test script: `npx ts-node src/lib/email.test.ts`
   - Check Resend dashboard for sent emails

2. **Production Testing**
   - Test with a small number of real .ac.uk emails
   - Verify emails are delivered to inbox (check spam folder)
   - Test the full verification flow

### Monitoring & Maintenance

1. **Resend Dashboard**
   - Monitor email delivery rates
   - Check bounce and complaint rates
   - View open/click statistics

2. **DNS Records**
   - Keep DNS records up to date
   - Monitor domain authentication status
   - Renew DKIM keys annually (if required)

### Troubleshooting

- **Emails not sending**:
  - Check API key permissions
  - Verify domain status in Resend
  - Check DNS records with `dig` or [mxtoolbox.com](https://mxtoolbox.com/)

- **Emails marked as spam**:
  - Ensure proper SPF/DKIM/DMARC records
  - Warm up your domain by gradually increasing email volume
  - Maintain good sending practices

- **Rate limiting**:
  - Default limit is 10 emails/second
  - Contact Resend support for higher limits

### Best Practices

1. Always use environment variables for API keys
2. Implement proper error handling for email sending
3. Set up webhooks for delivery status updates
4. Keep your Resend account secure with 2FA
5. Regularly audit sent emails and bounce rates

## AI Configuration & Optional Gemini Pro Features

## Current AI Setup (Gemini 2.0 Flash)

### Default Configuration
Vouchly currently uses **Google Gemini 2.0 Flash** for AI-powered features:
- **Model**: `googleai/gemini-2.0-flash`
- **Cost**: $0.075/1M input tokens, $0.30/1M output tokens
- **Speed**: Very fast processing
- **Use Cases**: Vouch score adjustments, session recovery, penalty calculations

### Environment Variables Required
```env
# Google AI (Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Current AI Features
1. **Intelligent Vouch Score Adjustments** - AI analyzes session outcomes
2. **Smart Penalty Application** - Context-aware penalty calculation
3. **Automated Session Recovery** - AI manages undo windows and finalization
4. **Real-time Decision Making** - Instant AI processing for accountability

## Optional: Gemini Pro for Complex AI Features

### When to Consider Gemini Pro
For more sophisticated AI features that require advanced reasoning, consider upgrading to **Gemini 2.0 Pro**:

| Feature | Current (Flash) | Pro Upgrade | Use Case |
|---------|----------------|-------------|----------|
| **Vouch Score Analysis** | Basic penalty calculation | Advanced behavioral analysis | Complex user pattern recognition |
| **Session Recommendations** | Simple matching | Intelligent study partner suggestions | AI-powered compatibility insights |
| **Conflict Resolution** | Basic rule enforcement | Smart mediation suggestions | Dispute resolution between users |
| **Study Pattern Analysis** | Session tracking | Learning behavior insights | Personalized study recommendations |
| **Academic Performance Prediction** | Not available | Predictive analytics | Early intervention for struggling students |
| **Natural Language Processing** | Basic text analysis | Advanced conversation understanding | Smart messaging and support |

### Gemini Pro Configuration
```env
# For Pro features, update src/ai/genkit.ts:
model: 'googleai/gemini-2.0-pro'  # Instead of 'googleai/gemini-2.0-flash'
```

### Pro Features Implementation Guide

#### 1. Advanced Vouch Score Analysis
```typescript
// Enhanced penalty calculation with behavioral context
const analyzeUserBehavior = async (userId: string) => {
  const userHistory = await getUserSessionHistory(userId);
  const analysis = await ai.generate({
    prompt: `Analyze this user's study patterns and suggest personalized vouch score adjustments: ${JSON.stringify(userHistory)}`
  });
  return analysis;
};
```

#### 2. Intelligent Study Partner Recommendations
```typescript
// AI-powered compatibility scoring
const getAIRecommendations = async (userId: string) => {
  const userProfile = await getUserProfile(userId);
  const potentialPartners = await getAvailablePartners();
  
  const recommendations = await ai.generate({
    prompt: `Based on this user's profile and study patterns, rank these potential partners by compatibility: ${JSON.stringify({userProfile, potentialPartners})}`
  });
  return recommendations;
};
```

#### 3. Smart Conflict Resolution
```typescript
// AI mediation for session disputes
const mediateSessionConflict = async (sessionId: string, dispute: string) => {
  const sessionData = await getSessionData(sessionId);
  const resolution = await ai.generate({
    prompt: `Analyze this session dispute and suggest a fair resolution: ${JSON.stringify({sessionData, dispute})}`
  });
  return resolution;
};
```

#### 4. Learning Behavior Insights
```typescript
// Personalized study recommendations
const generateStudyInsights = async (userId: string) => {
  const studyHistory = await getStudyHistory(userId);
  const insights = await ai.generate({
    prompt: `Analyze this student's study patterns and provide personalized recommendations: ${JSON.stringify(studyHistory)}`
  });
  return insights;
};
```

### Cost Comparison
| Model | Input Cost | Output Cost | Context Window | Best For |
|-------|------------|-------------|----------------|----------|
| **Gemini 2.0 Flash** | $0.075/1M | $0.30/1M | 1M tokens | Current features |
| **Gemini 2.0 Pro** | $0.50/1M | $1.50/1M | 2M tokens | Advanced features |

### Migration Strategy
1. **Phase 1**: Keep Flash for current features
2. **Phase 2**: Add Pro for new complex features
3. **Phase 3**: Gradually migrate based on usage patterns

### Monitoring AI Usage
```typescript
// Track AI feature usage for cost optimization
const trackAIFeatureUsage = async (feature: string, tokensUsed: number) => {
  await adminDb.collection('aiUsage').add({
    feature,
    tokensUsed,
    model: 'gemini-2.0-flash', // or 'gemini-2.0-pro'
    timestamp: new Date(),
    cost: calculateCost(tokensUsed)
  });
};
```

## Google Analytics Setup

### Important: Localhost Limitation
⚠️ **Google Analytics does not accept `localhost` URLs during setup**. You must use your production domain.

### Setup Steps:
1. **Go to Google Analytics**: [https://analytics.google.com/](https://analytics.google.com/)
2. **Create Property**:
   - Property name: "Vouchly"
   - Country: United Kingdom
   - Currency: British Pound (GBP)
   - Industry: Education

3. **Set Up Web Data Stream**:
   - Platform: Web
   - Website URL: `https://your-production-domain.com` (NOT localhost)
   - Stream name: "Vouchly Production"

4. **Get Measurement ID**:
   - Copy the Measurement ID (format: `G-XXXXXXXXXX`)
   - Add to production environment variables:
     ```
     NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
     ```

### Development Testing
For local development:
- Leave `NEXT_PUBLIC_GA_TRACKING_ID` empty in `.env.local`
- Google Analytics will be disabled during development
- Test GA integration after deploying to production

### Post-Deployment Verification
1. Deploy to production with GA tracking ID
2. Visit your live site
3. Check Google Analytics "Realtime" report
4. Verify events are being tracked

### Recommended GA4 Events to Monitor
- `session_created` - When users create study sessions
- `session_completed` - When sessions are completed
- `session_cancelled` - When sessions are cancelled
- `admin_analytics_viewed` - Admin dashboard usage
- `sign_up` - New user registrations

## Support & Contact Information

For all support, legal, and data protection inquiries, please use the following official channels:

- **Customer Support:** support@vouchly.com
- **Legal Notices:** legal@vouchly.com
- **Data Protection Officer:** dpo@vouchly.com
- **Business Address:** [Your Registered Business Address]

**Support Policy:**
- Our support team is available Monday–Friday, 9:00–18:00 UK time (excluding public holidays).
- We aim to respond to all inquiries within one business day.
- For urgent security or data protection issues, please use "URGENT" in your subject line.

**Important:**
- Vouchly will never ask for your password or sensitive information via email.
- All communications are subject to our [Privacy Policy](/privacy) and [Terms of Service](/terms).
- For GDPR/data export or deletion requests, please email dpo@vouchly.com from your registered account email.

**Abuse & Security:**
- To report abuse, harassment, or security vulnerabilities, contact support@vouchly.com immediately.
- We take all reports seriously and will investigate promptly in accordance with our policies.

---
Last Updated: 2025-07-03
Version: 1.0.0




Absolutely! Here's a **text list of important internal links** you can use for your own reference, documentation, or to share with your team:

---

## **Vouchly Important Links**

- **Admin Dashboard:**  
  `/dashboard/admin`

- **Analytics Dashboard:**  
  `/dashboard/admin/analytics`

- **Main Dashboard:**  
  `/dashboard`

- **Browse Partners:**  
  `/dashboard/browse`

- **Sessions:**  
  `/dashboard/sessions`

- **Messages:**  
  `/dashboard/messages`

- **My Statistics:**  
  `/dashboard/stats`

- **Profile:**  
  `/dashboard/profile`

- **Profile Setup:**  
  `/dashboard/profile/setup`

- **Links Page (if you add one):**  
  `/dashboard/links`

---

You can copy, bookmark, or share this list as needed.  
If you want to add more links or need a formatted version for documentation, just let me know!

## API Reference

For a complete, up-to-date list of all API endpoints, methods, authentication requirements, and example payloads, see:

- [API_REFERENCE.md](./API_REFERENCE.md)

This is the canonical source for all backend and admin API documentation. Share this with your team or third-party integrators as needed.

### Security Audit Checklist
- [ ] Run `npm audit` for dependency vulnerabilities
- [ ] Run `npm run typecheck` for type safety
- [ ] Run all tests (`npm run test`, E2E, integration)
- [ ] Review API endpoints for authentication/authorization
- [ ] Review Firestore security rules
- [ ] Review environment variable exposure
- [ ] Manual code review for secrets, logging, and error handling
- [ ] (Optional) Use automated tools like Snyk, Lighthouse, or OWASP ZAP

To run a basic audit:
```bash
npm audit
npm run typecheck
npm run test
```

## DevOps & CI/CD
- GitHub Actions workflow `.github/workflows/ci.yml` runs on every push/PR:
  - Installs dependencies
  - Runs type checks (`npm run typecheck`)
  - Runs all tests (unit, integration, E2E)
  - Builds the Next.js app
- For Vercel/Netlify: Deploys automatically on push to main/master
- To monitor: Go to the Actions tab in GitHub, view workflow runs, and rerun if needed