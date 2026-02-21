# AIP V2 Database Schema

## Overview

This document defines the complete database schema for Alliance of Independent Physicians V2, including all entities, relationships, and approval workflows.

**Last Updated**: January 29, 2026  
**Version**: 2.0  
**Database System**: PostgreSQL (recommended) / MySQL compatible

---

## Table of Contents

1. [Core Entities](#core-entities)
2. [User & Role Management](#user--role-management)
3. [Approval System](#approval-system)
4. [Relationships & Foreign Keys](#relationships--foreign-keys)
5. [Indexes](#indexes)
6. [Constraints](#constraints)
7. [ER Diagram Summary](#er-diagram-summary)

---

## Core Entities

### 1. Users Table

**Purpose**: Central user authentication and basic profile information.

```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'applicant', 'public') NOT NULL DEFAULT 'applicant',
    status ENUM('active', 'pending', 'suspended', 'deleted') NOT NULL DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(100),
    password_reset_token VARCHAR(100),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Practices Table

**Purpose**: Primary directory entity - clinics/practices.

```sql
CREATE TABLE practices (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    country VARCHAR(2) DEFAULT 'US',
    
    -- Location Coordinates
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Media
    logo_url VARCHAR(500),
    
    -- Status
    status ENUM('active', 'pending', 'suspended', 'deleted') DEFAULT 'active',
    verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_city_state (city, state),
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude),
    FULLTEXT idx_search (name, description, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Practice Locations Table

**Purpose**: Multiple locations per practice.

```sql
CREATE TABLE practice_locations (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    hours VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    directions_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    INDEX idx_practice_id (practice_id),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Doctors Table

**Purpose**: Doctor profiles linked to practices.

```sql
CREATE TABLE doctors (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE,
    practice_id VARCHAR(50) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    credentials VARCHAR(50),
    
    -- Professional
    specialty VARCHAR(100) NOT NULL,
    bio TEXT,
    about TEXT,
    profile_image_url VARCHAR(500),
    
    -- Contact (Private - visible only to logged-in doctors)
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(500),
    
    -- Professional Credentials
    medical_school VARCHAR(255),
    residency VARCHAR(255),
    internship VARCHAR(255),
    board_certifications JSON,
    hospital_privileges JSON,
    states_licensed_in JSON,
    
    -- Services
    conditions_and_services JSON,
    
    -- Status
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    accepts_new_patients BOOLEAN DEFAULT TRUE,
    
    -- Ratings
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE RESTRICT,
    INDEX idx_practice_id (practice_id),
    INDEX idx_slug (slug),
    INDEX idx_email (email),
    INDEX idx_specialty (specialty),
    INDEX idx_verified (verified),
    FULLTEXT idx_search (full_name, specialty, bio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Practice Roles Table

**Purpose**: Manages roles within practices (Practice Admin vs Doctor).

```sql
CREATE TABLE practice_roles (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    role ENUM('practice_admin', 'doctor') NOT NULL DEFAULT 'doctor',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50), -- Admin or previous Practice Admin
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_practice_doctor (practice_id, doctor_id),
    INDEX idx_practice_id (practice_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## User & Role Management

### 6. Admins Table

**Purpose**: System administrators.

```sql
CREATE TABLE admins (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Approval System

### 7. Approval Requests Table

**Purpose**: Unified approval queue for all approval workflows.

```sql
CREATE TABLE approval_requests (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM(
        'doctor_join_practice',
        'new_practice_with_admin_doctor',
        'practice_edit_request',
        'practice_doctor_add_request',
        'practice_doctor_remove_request',
        'practice_location_add_request',
        'practice_location_edit_request',
        'practice_location_remove_request',
        'practice_location_change_request',
        'practice_insurance_services_change_request'
    ) NOT NULL,
    
    -- Requester
    requested_by VARCHAR(50) NOT NULL, -- user_id or email
    requested_by_type ENUM('doctor', 'admin', 'applicant') NOT NULL,
    
    -- Practice Context
    practice_id VARCHAR(50),
    target_doctor_id VARCHAR(50),
    
    -- Payload (JSON for flexibility)
    payload JSON NOT NULL,
    
    -- Approval Status
    admin_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    practice_admin_status ENUM('pending', 'approved', 'rejected'),
    
    -- Notes & Reasons
    admin_notes TEXT,
    practice_admin_notes TEXT,
    rejection_reason TEXT,
    rejected_by ENUM('admin', 'practice_admin'),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    admin_reviewed_at TIMESTAMP,
    practice_admin_reviewed_at TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE SET NULL,
    FOREIGN KEY (target_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    INDEX idx_type (type),
    INDEX idx_practice_id (practice_id),
    INDEX idx_admin_status (admin_status),
    INDEX idx_practice_admin_status (practice_admin_status),
    INDEX idx_created_at (created_at),
    INDEX idx_requested_by (requested_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 8. Approval History Table

**Purpose**: Audit trail for approval actions.

```sql
CREATE TABLE approval_history (
    id VARCHAR(50) PRIMARY KEY,
    approval_request_id VARCHAR(50) NOT NULL,
    actor_id VARCHAR(50) NOT NULL,
    actor_type ENUM('admin', 'practice_admin') NOT NULL,
    action ENUM('created', 'approved', 'rejected', 'updated', 'cancelled') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE,
    INDEX idx_approval_request_id (approval_request_id),
    INDEX idx_actor (actor_id, actor_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 9. Practice Invitations Table

**Purpose**: Practice Admin invites doctors to join.

```sql
CREATE TABLE practice_invitations (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    invited_by VARCHAR(50) NOT NULL, -- Practice Admin doctor_id
    email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255),
    message TEXT,
    token VARCHAR(100) UNIQUE NOT NULL,
    invitation_link VARCHAR(500),
    
    -- Status
    status ENUM('sent', 'accepted', 'expired', 'cancelled') DEFAULT 'sent',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_practice_id (practice_id),
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Supporting Entities

### 10. Practice Specialties Table

**Purpose**: Many-to-many relationship between practices and specialties.

```sql
CREATE TABLE practice_specialties (
    practice_id VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (practice_id, specialty),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    INDEX idx_specialty (specialty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 11. Practice Services Table

**Purpose**: Services offered by practices.

```sql
CREATE TABLE practice_services (
    practice_id VARCHAR(50) NOT NULL,
    service VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (practice_id, service),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    INDEX idx_service (service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 12. Practice Insurance Table

**Purpose**: Insurance accepted by practices.

```sql
CREATE TABLE practice_insurance (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    insurance_name VARCHAR(255) NOT NULL,
    insurance_slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    INDEX idx_practice_id (practice_id),
    INDEX idx_insurance_slug (insurance_slug),
    UNIQUE KEY unique_practice_insurance (practice_id, insurance_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 13. Referrals Table

**Purpose**: Doctor-to-doctor referrals.

```sql
CREATE TABLE referrals (
    id VARCHAR(50) PRIMARY KEY,
    from_doctor_id VARCHAR(50) NOT NULL,
    to_doctor_id VARCHAR(50) NOT NULL,
    
    -- Patient Information
    patient_name_or_initials VARCHAR(100) NOT NULL,
    patient_age INT,
    patient_sex ENUM('male', 'female', 'other'),
    patient_phone VARCHAR(20),
    
    -- Medical Information
    condition_summary TEXT NOT NULL,
    notes TEXT,
    
    -- Status
    status ENUM('new', 'attended', 'removed') DEFAULT 'new',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    attended_at TIMESTAMP,
    
    FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_from_doctor_id (from_doctor_id),
    INDEX idx_to_doctor_id (to_doctor_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    CHECK (from_doctor_id != to_doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 14. Referral History Table

**Purpose**: Audit trail for referral status changes.

```sql
CREATE TABLE referral_history (
    id VARCHAR(50) PRIMARY KEY,
    referral_id VARCHAR(50) NOT NULL,
    actor_id VARCHAR(50) NOT NULL,
    action ENUM('created', 'status_changed', 'updated') NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE CASCADE,
    INDEX idx_referral_id (referral_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 15. Notifications Table

**Purpose**: Doctor notifications.

```sql
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    type ENUM(
        'referral_received',
        'referral_status_changed',
        'practice_admin_invite',
        'practice_admin_approval_request',
        'admin_approval_result',
        'membership_expiry_warning',
        'announcement'
    ) NOT NULL,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_read (read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 16. Messages Table

**Purpose**: Doctor-to-doctor and admin messaging.

```sql
CREATE TABLE messages (
    id VARCHAR(50) PRIMARY KEY,
    thread_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL, -- doctor_id or 'admin'
    sender_type ENUM('doctor', 'admin') NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    attachments JSON,
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    
    INDEX idx_thread_id (thread_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_read (read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 17. Message Threads Table

**Purpose**: Message conversation threads.

```sql
CREATE TABLE message_threads (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('direct', 'practice_group', 'admin_announcement', 'practice_announcement') NOT NULL,
    practice_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_practice_id (practice_id),
    INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 18. Thread Participants Table

**Purpose**: Many-to-many relationship for thread participants.

```sql
CREATE TABLE thread_participants (
    thread_id VARCHAR(50) NOT NULL,
    participant_id VARCHAR(50) NOT NULL, -- doctor_id or 'admin'
    participant_type ENUM('doctor', 'admin') NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    
    PRIMARY KEY (thread_id, participant_id),
    INDEX idx_participant_id (participant_id),
    INDEX idx_last_read_at (last_read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 19. Memberships Table

**Purpose**: Doctor membership plans and billing.

```sql
CREATE TABLE memberships (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    practice_id VARCHAR(50), -- Optional: for practice-level membership
    
    -- Plan
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    
    -- Billing
    billing_cycle ENUM('monthly', 'annual') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status ENUM('active', 'expired', 'pending', 'cancelled') DEFAULT 'pending',
    
    -- Dates
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    next_billing_date DATE,
    
    -- Payment
    payment_method ENUM('paypal', 'card') NOT NULL,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE SET NULL,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_practice_id (practice_id),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 20. Membership Plans Table

**Purpose**: Available membership plan definitions.

```sql
CREATE TABLE membership_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    badge VARCHAR(50),
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    features JSON,
    cta_label VARCHAR(100),
    cta_href VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 21. Reviews Table

**Purpose**: Patient reviews for doctors.

```sql
CREATE TABLE reviews (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT,
    date DATE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_rating (rating),
    INDEX idx_date (date),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 22. Appointment Requests Table

**Purpose**: Patient appointment requests.

```sql
CREATE TABLE appointment_requests (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    reason TEXT,
    insurance VARCHAR(255),
    status ENUM('New', 'Confirmed', 'Completed', 'Declined') DEFAULT 'New',
    declined_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_status (status),
    INDEX idx_requested_date (requested_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 23. Booking Slots Table

**Purpose**: Doctor availability slots.

```sql
CREATE TABLE booking_slots (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_date_time (date, time),
    INDEX idx_available (available),
    UNIQUE KEY unique_doctor_slot (doctor_id, date, time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Relationships & Foreign Keys

### Relationship Summary

```
Users (1) ──< (1) Admins
Users (1) ──< (1) Doctors

Practices (1) ──< (M) Doctors
Practices (1) ──< (M) Practice Locations
Practices (1) ──< (M) Practice Specialties
Practices (1) ──< (M) Practice Services
Practices (1) ──< (M) Practice Insurance
Practices (1) ──< (M) Approval Requests
Practices (1) ──< (M) Practice Invitations
Practices (1) ──< (M) Message Threads (practice announcements)

Doctors (1) ──< (M) Practice Roles
Doctors (1) ──< (M) Referrals (as from_doctor)
Doctors (1) ──< (M) Referrals (as to_doctor)
Doctors (1) ──< (M) Notifications
Doctors (1) ──< (M) Reviews
Doctors (1) ──< (M) Appointment Requests
Doctors (1) ──< (M) Booking Slots
Doctors (1) ──< (M) Memberships
Doctors (1) ──< (M) Practice Invitations (as invited_by)

Approval Requests (1) ──< (M) Approval History
Referrals (1) ──< (M) Referral History
Message Threads (1) ──< (M) Messages
Message Threads (1) ──< (M) Thread Participants
```

### Key Relationships

1. **Practice → Doctors**: One-to-Many (practice_id in doctors table)
2. **Doctor → Practice**: Many-to-One (required foreign key)
3. **Practice → Practice Admin**: One-to-One via practice_roles table (role = 'practice_admin')
4. **Approval Request → Practice**: Many-to-One (optional, null for new practice creation)
5. **Approval Request → Doctor**: Many-to-One (target_doctor_id)
6. **Referral → Doctors**: Many-to-One (from_doctor_id and to_doctor_id)

---

## Indexes

### Performance Indexes

```sql
-- Practice search optimization
CREATE INDEX idx_practice_search ON practices(name, city, state);
CREATE INDEX idx_practice_location_search ON practices(latitude, longitude);

-- Doctor search optimization
CREATE INDEX idx_doctor_practice_specialty ON doctors(practice_id, specialty);
CREATE INDEX idx_doctor_verified_featured ON doctors(verified, featured);

-- Approval request filtering
CREATE INDEX idx_approval_type_status ON approval_requests(type, admin_status, practice_admin_status);
CREATE INDEX idx_approval_practice_status ON approval_requests(practice_id, admin_status, practice_admin_status);

-- Referral queries
CREATE INDEX idx_referral_doctor_status ON referrals(from_doctor_id, to_doctor_id, status);

-- Notification queries
CREATE INDEX idx_notification_unread ON notifications(doctor_id, read, created_at);

-- Message queries
CREATE INDEX idx_message_thread_unread ON messages(thread_id, read, created_at);
```

---

## Constraints

### Check Constraints

```sql
-- Ensure rating is between 0 and 5
ALTER TABLE reviews ADD CONSTRAINT chk_rating_range CHECK (rating >= 0 AND rating <= 5);

-- Ensure referral is not self-referral
ALTER TABLE referrals ADD CONSTRAINT chk_no_self_referral CHECK (from_doctor_id != to_doctor_id);

-- Ensure practice has at least one location
-- (Enforced at application level, not DB level)

-- Ensure doctor belongs to exactly one practice
-- (Enforced by NOT NULL constraint on practice_id)
```

### Unique Constraints

```sql
-- One practice admin per practice (enforced at application level)
-- One user per doctor
-- One user per admin
-- Unique email per user
-- Unique slug per practice
-- Unique slug per doctor
```

---

## ER Diagram Summary

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐   ┌─────▼─────┐
│   Doctors   │   │   Admins   │
└──────┬──────┘   └────────────┘
       │
       │ practice_id (FK)
       │
┌──────▼──────────┐
│   Practices     │
└──────┬──────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
┌──────▼──────┐ ┌───▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│  Locations   │ │Specialties│ │ Services │ │  Insurance  │
└─────────────┘ └───────────┘ └──────────┘ └─────────────┘

┌──────────────────┐
│ Approval Requests│
└────────┬─────────┘
         │
         ├──────────────┐
         │              │
    practice_id (FK) doctor_id (FK)
         │              │
         │              │
    ┌────▼────┐    ┌───▼────┐
    │Practice │    │ Doctor │
    └─────────┘    └────────┘

┌──────────────┐
│  Referrals   │
└──────┬───────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
from_doctor_id (FK) to_doctor_id (FK)
       │              │              │
┌──────▼──────┐ ┌────▼──────┐
│   Doctor    │ │  Doctor   │
└─────────────┘ └───────────┘
```

---

## Views (Optional)

### View: Active Doctors with Practice Info

```sql
CREATE VIEW v_active_doctors_practices AS
SELECT 
    d.id,
    d.full_name,
    d.email,
    d.specialty,
    p.id AS practice_id,
    p.name AS practice_name,
    p.city AS practice_city,
    p.state AS practice_state,
    pr.role AS practice_role
FROM doctors d
INNER JOIN practices p ON d.practice_id = p.id
LEFT JOIN practice_roles pr ON d.id = pr.doctor_id AND p.id = pr.practice_id
WHERE d.verified = TRUE
AND p.status = 'active';
```

### View: Pending Approval Requests

```sql
CREATE VIEW v_pending_approvals AS
SELECT 
    ar.id,
    ar.type,
    ar.practice_id,
    p.name AS practice_name,
    ar.admin_status,
    ar.practice_admin_status,
    ar.created_at,
    CASE 
        WHEN ar.admin_status = 'pending' AND ar.practice_admin_status = 'pending' THEN 'both_pending'
        WHEN ar.admin_status = 'pending' THEN 'admin_pending'
        WHEN ar.practice_admin_status = 'pending' THEN 'practice_admin_pending'
        ELSE 'unknown'
    END AS pending_status
FROM approval_requests ar
LEFT JOIN practices p ON ar.practice_id = p.id
WHERE ar.admin_status = 'pending' 
   OR ar.practice_admin_status = 'pending';
```

---

## Triggers (Optional)

### Trigger: Update Practice Updated At

```sql
DELIMITER //
CREATE TRIGGER trg_practice_updated_at
BEFORE UPDATE ON practices
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;
```

### Trigger: Update Doctor Rating on Review

```sql
DELIMITER //
CREATE TRIGGER trg_update_doctor_rating
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE doctors
    SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE doctor_id = NEW.doctor_id
    ),
    review_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE doctor_id = NEW.doctor_id
    )
    WHERE id = NEW.doctor_id;
END//
DELIMITER ;
```

---

## Sample Queries

### Get Practice Admin for a Practice

```sql
SELECT d.*
FROM doctors d
INNER JOIN practice_roles pr ON d.id = pr.doctor_id
WHERE pr.practice_id = ?
AND pr.role = 'practice_admin'
LIMIT 1;
```

### Get All Doctors in a Practice

```sql
SELECT d.*, pr.role
FROM doctors d
LEFT JOIN practice_roles pr ON d.id = pr.doctor_id AND pr.practice_id = ?
WHERE d.practice_id = ?
ORDER BY 
    CASE WHEN pr.role = 'practice_admin' THEN 0 ELSE 1 END,
    d.last_name, d.first_name;
```

### Get Pending Approval Requests for Practice Admin

```sql
SELECT ar.*
FROM approval_requests ar
INNER JOIN practice_roles pr ON ar.practice_id = pr.practice_id
WHERE pr.doctor_id = ?
AND pr.role = 'practice_admin'
AND ar.practice_admin_status = 'pending'
ORDER BY ar.created_at DESC;
```

### Get All Approval Requests Requiring Admin Action

```sql
SELECT ar.*, p.name AS practice_name
FROM approval_requests ar
LEFT JOIN practices p ON ar.practice_id = p.id
WHERE ar.admin_status = 'pending'
ORDER BY ar.created_at DESC;
```

---

## Migration Notes

### From localStorage to Database

1. **Users**: Create user records from doctor emails and admin emails
2. **Practices**: Migrate from `aip_practice_overrides` and generated practices
3. **Doctors**: Migrate from `aip_doctor_overrides` with practice assignments
4. **Practice Roles**: Migrate from `aip_practice_roles`
5. **Approval Requests**: Migrate from `aip_approval_requests`
6. **Referrals**: Migrate from `aip_referrals`
7. **Notifications**: Migrate from `aip_notifications_{doctorId}`

### Data Integrity Checks

```sql
-- Ensure all doctors have a practice
SELECT COUNT(*) FROM doctors WHERE practice_id IS NULL;

-- Ensure all practices have at least one doctor
SELECT p.id, p.name 
FROM practices p
LEFT JOIN doctors d ON p.id = d.practice_id
WHERE d.id IS NULL;

-- Ensure each practice has exactly one practice admin
SELECT practice_id, COUNT(*) as admin_count
FROM practice_roles
WHERE role = 'practice_admin'
GROUP BY practice_id
HAVING admin_count != 1;
```

---

## Security Considerations

1. **Password Storage**: Use bcrypt or Argon2 for password hashing
2. **Email Verification**: Require email verification before account activation
3. **Role-Based Access**: Enforce at application level, validate at DB level
4. **Audit Logging**: Log all approval actions, role changes, and sensitive operations
5. **Soft Deletes**: Use status fields instead of hard deletes for audit trail
6. **Data Encryption**: Encrypt sensitive fields (PII, payment info) at rest

---

**Last Updated**: January 29, 2026  
**Schema Version**: 2.0  
**Compatible With**: PostgreSQL 12+, MySQL 8.0+, MariaDB 10.5+
