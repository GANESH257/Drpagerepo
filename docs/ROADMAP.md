# Roadmap

This document outlines planned features and improvements for the Alliance of Independent Physicians directory.

## Phase 1: Core Enhancements (Current MVP)

✅ **Completed**:
- Landing page with all required sections
- Doctor directory with filtering
- Doctor profile pages
- Static export for cPanel deployment
- Doctor dashboard with full profile management (localStorage-based)

## Phase 1.5: Doctor Dashboard (Current)

✅ **Completed**:
- Full-featured doctor dashboard with collapsible sidebar
- Edit Profile section with comprehensive form fields
- Manage Locations with add/edit/delete functionality
- Insurance & Services management
- Appointment Requests management (demo data)
- Referrals tracking (demo data)
- Client-side data persistence via localStorage
- Responsive design (desktop, tablet, mobile)

**Note**: The dashboard is fully functional but uses localStorage for data persistence. All profile edits, appointment requests, and referrals are stored client-side. This provides a complete demo experience while Phase 2 backend integration is planned.

## Phase 2: Backend Integration

### Join Request & Admin Approval System

**Priority**: High

**Current State**: Join requests are stored in localStorage (`aip_join_requests` array). No admin panel, no email notifications, no approval workflow.

**Phase 2 Requirements**:
- **Admin Panel**:
  - Dashboard to view all join requests
  - Request detail view with applicant information
  - Approve/reject workflow
  - Status tracking (submitted, under_review, approved, rejected)
  - Search and filter join requests
- **Email Notifications**:
  - Confirmation email when request is submitted
  - Email to admin when new request arrives
  - Approval/rejection email to applicant
  - Payment activation email after approval
- **Database Migration**:
  - Migrate join requests from localStorage to database
  - Store applicant data, plan selection, payment method preference
  - Track request status and admin actions
- **API Routes**:
  - `POST /api/join-requests` - Submit join request
  - `GET /api/join-requests` - List requests (admin only)
  - `GET /api/join-requests/[id]` - Get request details
  - `PATCH /api/join-requests/[id]` - Update request status (admin only)
- **Payment Processing**:
  - Real payment gateway integration (Stripe, PayPal)
  - Process payment only after approval
  - Store payment method securely
  - Generate invoices and receipts

### Real Authentication System

**Priority**: High

**Features**:
- Real OAuth integration (Google Sign-In)
- Backend API for authentication
- Secure session management (JWT tokens)
- Password reset functionality
- Email verification for new accounts
- Profile verification workflow for doctors
- Membership renewal system
- Membership verification workflow

**Technical Considerations**:
- Replace localStorage with secure session management
- Migrate doctor profile data from localStorage to database
- Migrate appointment requests and referrals to database
- Add API routes (`src/app/api/auth/`, `src/app/api/doctors/`, `src/app/api/appointments/`, `src/app/api/referrals/`)
- Database for user accounts and doctor profiles
- OAuth provider integration (Google OAuth 2.0)
- Email service for verification and password reset
- JWT token generation and validation
- Profile verification workflow and admin approval
- Real-time updates for appointment requests and referrals

### Real Booking System

**Priority**: High

**Features**:
- Integration with scheduling API/service
- Real-time availability checking
- Appointment confirmation emails
- Calendar sync (Google Calendar, Outlook)
- Reminder notifications (email/SMS)

**Technical Considerations**:
- Add API routes (`src/app/api/appointments/`)
- Database for appointment storage
- Email service integration (SendGrid, AWS SES)
- Calendar API integration

### Review Moderation System

**Priority**: High

**Features**:
- Admin review moderation dashboard
- Review approval workflow
- Spam detection
- Review editing/deletion
- Response system (doctors can respond)

**Technical Considerations**:
- Database for reviews
- Admin authentication
- Moderation queue interface
- Email notifications for new reviews

## Phase 3: User Features

### User Accounts

**Priority**: Medium

**Features**:
- Patient registration/login
- Profile management
- Appointment history
- Saved doctors
- Review history

**Technical Considerations**:
- Authentication system (NextAuth.js)
- User database
- Protected routes
- Session management

### Patient Portal

**Priority**: Medium

**Features**:
- View upcoming appointments
- Cancel/reschedule appointments
- Access medical records (if integrated)
- Message doctors
- Prescription refill requests

**Technical Considerations**:
- User dashboard
- Appointment management API
- Secure messaging system
- HIPAA compliance considerations

## Phase 4: Admin Portal

### Doctor Management

**Priority**: Medium

**Features**:
- Doctor registration/onboarding (enhanced from current placeholder)
- **Join request review and approval** (Phase 2 priority)
- Profile editing
- Availability management
- Insurance updates
- Location management
- Profile verification workflow
- Membership renewal management

**Technical Considerations**:
- Admin authentication
- **Join request admin panel** (Phase 2)
- Doctor dashboard (replace placeholder with real functionality)
- CRUD operations for doctor data
- File upload for doctor photos
- Verification workflow system
- Membership tracking and renewal reminders

### Content Management

**Priority**: Low

**Features**:
- Department management
- FAQ editing
- Landing page content editing
- Banner/image management

**Technical Considerations**:
- CMS integration or custom admin panel
- Content versioning
- Preview functionality

## Phase 5: Advanced Features

### Membership System

**Priority**: Medium

**Features**:
- Real billing integration (Stripe, PayPal)
- Annual/monthly membership renewal system
- Payment processing for membership fees
- Membership tier management (Basic, Professional, Premier)
- Renewal reminders and automated billing
- Membership status tracking
- Payment history and invoices
- Membership verification workflow

**Technical Considerations**:
- Payment gateway integration (Stripe, PayPal)
- Membership database schema
- Subscription management system
- Invoice generation and email delivery
- Email automation for renewals
- Membership status dashboard
- Billing portal integration

### Payment Processing

**Priority**: Low

**Features**:
- Copay collection
- Payment processing for appointments
- Refund handling
- Payment history

**Technical Considerations**:
- Payment gateway integration
- PCI compliance
- Receipt generation
- Accounting integration

### Advanced Search

**Priority**: Medium

**Features**:
- Full-text search across doctor profiles
- Search by symptoms/conditions
- Search by languages spoken
- Search by gender preference
- Advanced filters (board certifications, years of experience)

**Technical Considerations**:
- Search index (Algolia, Elasticsearch, or database full-text)
- Search API
- Search analytics

### Telehealth Integration

**Priority**: Medium

**Features**:
- Telehealth availability indicator
- Video consultation booking
- Telehealth platform integration (Zoom, Doxy.me)
- Telehealth appointment management

**Technical Considerations**:
- Video API integration
- Appointment type differentiation
- Platform-specific requirements

## Phase 6: Analytics & Reporting

### Analytics Dashboard

**Priority**: Low

**Features**:
- Page view analytics
- Search query analytics
- Popular doctors/specialties
- Conversion tracking (views → bookings)
- User behavior tracking

**Technical Considerations**:
- Analytics service (Google Analytics, Plausible)
- Custom event tracking
- Dashboard visualization

### Reporting

**Priority**: Low

**Features**:
- Doctor performance reports
- Booking conversion reports
- Review sentiment analysis
- Patient demographics

**Technical Considerations**:
- Report generation system
- Data aggregation
- Export functionality (PDF, CSV)

## Phase 7: Mobile App

**Priority**: Very Low

**Features**:
- Native mobile app (iOS/Android)
- Push notifications
- Mobile-optimized booking
- Offline access to saved doctors

**Technical Considerations**:
- React Native or Flutter
- API backend
- Push notification service
- App store deployment

## Technical Debt & Improvements

### Performance

- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting improvements
- [ ] Bundle size optimization
- [ ] CDN integration for static assets

### SEO

- [ ] Meta tags optimization
- [ ] Structured data (JSON-LD)
- [ ] Sitemap generation
- [ ] Robots.txt configuration

### Accessibility

- [ ] WCAG 2.1 AA compliance audit
- [ ] Keyboard navigation improvements
- [ ] Screen reader optimization
- [ ] Color contrast improvements

### Testing

- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] E2E tests (Playwright/Cypress)
- [ ] Visual regression tests

## Migration Considerations

### From Static to Dynamic

If moving from static export to server-side features:

1. **Remove static export**: Update `next.config.js`
2. **Add API routes**: Create `src/app/api/` directory
3. **Add database**: Integrate Prisma or similar
4. **Add authentication**: NextAuth.js or similar
5. **Update deployment**: Move from static hosting to Node.js hosting

### Database Options

- **PostgreSQL**: Recommended for production
- **MySQL**: Alternative SQL option
- **MongoDB**: NoSQL option
- **Supabase**: PostgreSQL with built-in auth

## Timeline Estimates

- **Phase 2**: 2-3 months
- **Phase 3**: 1-2 months
- **Phase 4**: 2-3 months
- **Phase 5**: 3-4 months
- **Phase 6**: 1-2 months
- **Phase 7**: 4-6 months

*Estimates are rough and depend on team size and priorities.*

## Priority Matrix

**High Priority** (Do First):
- Real booking system
- Review moderation
- User accounts

**Medium Priority** (Do Next):
- Patient portal
- Admin portal
- Advanced search
- Telehealth integration

**Low Priority** (Future):
- Membership renewals
- Payment processing
- Analytics dashboard
- Mobile app

## Notes

- All features should maintain HIPAA compliance where applicable
- Consider legal/regulatory requirements for healthcare platforms
- User privacy and data security are paramount
- Regular security audits recommended
- Backup and disaster recovery planning needed
