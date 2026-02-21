-- ============================================================================
-- AIP V2 Database Migration Script for Cloud SQL PostgreSQL
-- ============================================================================
-- 
-- Purpose: Complete database schema creation for Alliance of Independent Physicians V2
-- Database: PostgreSQL (Cloud SQL)
-- Version: 2.0
-- Date: January 29, 2026
--
-- IMPORTANT: Run these queries in the exact order shown below.
-- Foreign key dependencies require this specific order.
--
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE ENUMS (PostgreSQL-specific)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'applicant', 'public');
CREATE TYPE user_status AS ENUM ('active', 'pending', 'suspended', 'deleted');
CREATE TYPE practice_status AS ENUM ('active', 'pending', 'suspended', 'deleted');
CREATE TYPE practice_role_type AS ENUM ('practice_admin', 'doctor');
CREATE TYPE approval_request_type AS ENUM (
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
);
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE requester_type AS ENUM ('doctor', 'admin', 'applicant');
CREATE TYPE rejection_by_type AS ENUM ('admin', 'practice_admin');
CREATE TYPE invitation_status AS ENUM ('sent', 'accepted', 'expired', 'cancelled');
CREATE TYPE referral_status AS ENUM ('new', 'attended', 'removed');
CREATE TYPE notification_type AS ENUM (
    'referral_received',
    'referral_status_changed',
    'practice_admin_invite',
    'practice_admin_approval_request',
    'admin_approval_result',
    'membership_expiry_warning',
    'announcement'
);
CREATE TYPE message_sender_type AS ENUM ('doctor', 'admin');
CREATE TYPE thread_type AS ENUM ('direct', 'practice_group', 'admin_announcement', 'practice_announcement');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'pending', 'cancelled');
CREATE TYPE payment_method AS ENUM ('paypal', 'card');
CREATE TYPE appointment_status AS ENUM ('New', 'Confirmed', 'Completed', 'Declined');
CREATE TYPE patient_sex AS ENUM ('male', 'female', 'other');
CREATE TYPE approval_action AS ENUM ('created', 'approved', 'rejected', 'updated', 'cancelled');
CREATE TYPE referral_action AS ENUM ('created', 'status_changed', 'updated');
CREATE TYPE history_actor_type AS ENUM ('admin', 'practice_admin');

-- ============================================================================
-- STEP 2: CREATE BASE TABLES (No Dependencies)
-- ============================================================================

-- Table 1: Users (Base table - no dependencies)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'applicant',
    status user_status NOT NULL DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(100),
    password_reset_token VARCHAR(100),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Table 2: Practices (Base table - no dependencies)
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
    status practice_status DEFAULT 'active',
    verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_practices_slug ON practices(slug);
CREATE INDEX idx_practices_city_state ON practices(city, state);
CREATE INDEX idx_practices_status ON practices(status);
CREATE INDEX idx_practices_location ON practices(latitude, longitude);
CREATE INDEX idx_practices_search ON practices USING GIN(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(city, '')));

-- Table 3: Membership Plans (Base table - no dependencies)
CREATE TABLE membership_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    badge VARCHAR(50),
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    features JSONB,
    cta_label VARCHAR(100),
    cta_href VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_membership_plans_active ON membership_plans(active);

-- ============================================================================
-- STEP 3: CREATE TABLES THAT DEPEND ON BASE TABLES
-- ============================================================================

-- Table 4: Practice Locations (Depends on: practices)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

CREATE INDEX idx_practice_locations_practice_id ON practice_locations(practice_id);
CREATE INDEX idx_practice_locations_location ON practice_locations(latitude, longitude);

-- Table 5: Doctors (Depends on: users, practices)
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
    board_certifications JSONB,
    hospital_privileges JSONB,
    states_licensed_in JSONB,
    
    -- Services
    conditions_and_services JSONB,
    
    -- Status
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    accepts_new_patients BOOLEAN DEFAULT TRUE,
    
    -- Ratings
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE RESTRICT
);

CREATE INDEX idx_doctors_practice_id ON doctors(practice_id);
CREATE INDEX idx_doctors_slug ON doctors(slug);
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_verified ON doctors(verified);
CREATE INDEX idx_doctors_search ON doctors USING GIN(to_tsvector('english', COALESCE(full_name, '') || ' ' || COALESCE(specialty, '') || ' ' || COALESCE(bio, '')));

-- Table 6: Admins (Depends on: users)
CREATE TABLE admins (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_admins_email ON admins(email);

-- Table 7: Practice Specialties (Depends on: practices)
CREATE TABLE practice_specialties (
    practice_id VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (practice_id, specialty),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

CREATE INDEX idx_practice_specialties_specialty ON practice_specialties(specialty);

-- Table 8: Practice Services (Depends on: practices)
CREATE TABLE practice_services (
    practice_id VARCHAR(50) NOT NULL,
    service VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (practice_id, service),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

CREATE INDEX idx_practice_services_service ON practice_services(service);

-- Table 9: Practice Insurance (Depends on: practices)
CREATE TABLE practice_insurance (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    insurance_name VARCHAR(255) NOT NULL,
    insurance_slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    UNIQUE (practice_id, insurance_slug)
);

CREATE INDEX idx_practice_insurance_practice_id ON practice_insurance(practice_id);
CREATE INDEX idx_practice_insurance_slug ON practice_insurance(insurance_slug);

-- ============================================================================
-- STEP 4: CREATE TABLES THAT DEPEND ON DOCTORS
-- ============================================================================

-- Table 10: Practice Roles (Depends on: practices, doctors, users)
CREATE TABLE practice_roles (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    role practice_role_type NOT NULL DEFAULT 'doctor',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50),
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (practice_id, doctor_id)
);

CREATE INDEX idx_practice_roles_practice_id ON practice_roles(practice_id);
CREATE INDEX idx_practice_roles_doctor_id ON practice_roles(doctor_id);
CREATE INDEX idx_practice_roles_role ON practice_roles(role);

-- Table 11: Referrals (Depends on: doctors)
CREATE TABLE referrals (
    id VARCHAR(50) PRIMARY KEY,
    from_doctor_id VARCHAR(50) NOT NULL,
    to_doctor_id VARCHAR(50) NOT NULL,
    
    -- Patient Information
    patient_name_or_initials VARCHAR(100) NOT NULL,
    patient_age INT,
    patient_sex patient_sex,
    patient_phone VARCHAR(20),
    
    -- Medical Information
    condition_summary TEXT NOT NULL,
    notes TEXT,
    
    -- Status
    status referral_status DEFAULT 'new',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended_at TIMESTAMP,
    
    FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CHECK (from_doctor_id != to_doctor_id)
);

CREATE INDEX idx_referrals_from_doctor_id ON referrals(from_doctor_id);
CREATE INDEX idx_referrals_to_doctor_id ON referrals(to_doctor_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at);

-- Table 12: Referral History (Depends on: referrals)
CREATE TABLE referral_history (
    id VARCHAR(50) PRIMARY KEY,
    referral_id VARCHAR(50) NOT NULL,
    actor_id VARCHAR(50) NOT NULL,
    action referral_action NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE CASCADE
);

CREATE INDEX idx_referral_history_referral_id ON referral_history(referral_id);
CREATE INDEX idx_referral_history_created_at ON referral_history(created_at);

-- Table 13: Notifications (Depends on: doctors)
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    type notification_type NOT NULL,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_doctor_id ON notifications(doctor_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Table 14: Reviews (Depends on: doctors)
CREATE TABLE reviews (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT,
    date DATE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_date ON reviews(date);
CREATE INDEX idx_reviews_verified ON reviews(verified);

-- Table 15: Appointment Requests (Depends on: doctors)
CREATE TABLE appointment_requests (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    reason TEXT,
    insurance VARCHAR(255),
    status appointment_status DEFAULT 'New',
    declined_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX idx_appointment_requests_doctor_id ON appointment_requests(doctor_id);
CREATE INDEX idx_appointment_requests_status ON appointment_requests(status);
CREATE INDEX idx_appointment_requests_requested_date ON appointment_requests(requested_date);

-- Table 16: Booking Slots (Depends on: doctors)
CREATE TABLE booking_slots (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    UNIQUE (doctor_id, date, time)
);

CREATE INDEX idx_booking_slots_doctor_id ON booking_slots(doctor_id);
CREATE INDEX idx_booking_slots_date_time ON booking_slots(date, time);
CREATE INDEX idx_booking_slots_available ON booking_slots(available);

-- Table 17: Memberships (Depends on: doctors, practices, membership_plans)
CREATE TABLE memberships (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    practice_id VARCHAR(50),
    
    -- Plan
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    
    -- Billing
    billing_cycle billing_cycle NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status membership_status DEFAULT 'pending',
    
    -- Dates
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    next_billing_date DATE,
    
    -- Payment
    payment_method payment_method NOT NULL,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE SET NULL
);

CREATE INDEX idx_memberships_doctor_id ON memberships(doctor_id);
CREATE INDEX idx_memberships_practice_id ON memberships(practice_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_expiry_date ON memberships(expiry_date);

-- Table 18: Practice Invitations (Depends on: practices, doctors)
CREATE TABLE practice_invitations (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    invited_by VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255),
    message TEXT,
    token VARCHAR(100) UNIQUE NOT NULL,
    invitation_link VARCHAR(500),
    
    -- Status
    status invitation_status DEFAULT 'sent',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX idx_practice_invitations_practice_id ON practice_invitations(practice_id);
CREATE INDEX idx_practice_invitations_email ON practice_invitations(email);
CREATE INDEX idx_practice_invitations_token ON practice_invitations(token);
CREATE INDEX idx_practice_invitations_status ON practice_invitations(status);
CREATE INDEX idx_practice_invitations_expires_at ON practice_invitations(expires_at);

-- ============================================================================
-- STEP 5: CREATE APPROVAL SYSTEM TABLES
-- ============================================================================

-- Table 19: Approval Requests (Depends on: practices, doctors - optional)
CREATE TABLE approval_requests (
    id VARCHAR(50) PRIMARY KEY,
    type approval_request_type NOT NULL,
    
    -- Requester
    requested_by VARCHAR(50) NOT NULL,
    requested_by_type requester_type NOT NULL,
    
    -- Practice Context
    practice_id VARCHAR(50),
    target_doctor_id VARCHAR(50),
    
    -- Payload (JSON for flexibility)
    payload JSONB NOT NULL,
    
    -- Approval Status
    admin_status approval_status DEFAULT 'pending',
    practice_admin_status approval_status,
    
    -- Notes & Reasons
    admin_notes TEXT,
    practice_admin_notes TEXT,
    rejection_reason TEXT,
    rejected_by rejection_by_type,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_reviewed_at TIMESTAMP,
    practice_admin_reviewed_at TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE SET NULL,
    FOREIGN KEY (target_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE INDEX idx_approval_requests_type ON approval_requests(type);
CREATE INDEX idx_approval_requests_practice_id ON approval_requests(practice_id);
CREATE INDEX idx_approval_requests_admin_status ON approval_requests(admin_status);
CREATE INDEX idx_approval_requests_practice_admin_status ON approval_requests(practice_admin_status);
CREATE INDEX idx_approval_requests_created_at ON approval_requests(created_at);
CREATE INDEX idx_approval_requests_requested_by ON approval_requests(requested_by);

-- Table 20: Approval History (Depends on: approval_requests)
CREATE TABLE approval_history (
    id VARCHAR(50) PRIMARY KEY,
    approval_request_id VARCHAR(50) NOT NULL,
    actor_id VARCHAR(50) NOT NULL,
    actor_type history_actor_type NOT NULL,
    action approval_action NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE
);

CREATE INDEX idx_approval_history_approval_request_id ON approval_history(approval_request_id);
CREATE INDEX idx_approval_history_actor ON approval_history(actor_id, actor_type);
CREATE INDEX idx_approval_history_created_at ON approval_history(created_at);

-- ============================================================================
-- STEP 6: CREATE MESSAGING SYSTEM TABLES
-- ============================================================================

-- Table 21: Message Threads (Depends on: practices - optional)
CREATE TABLE message_threads (
    id VARCHAR(50) PRIMARY KEY,
    type thread_type NOT NULL,
    practice_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

CREATE INDEX idx_message_threads_type ON message_threads(type);
CREATE INDEX idx_message_threads_practice_id ON message_threads(practice_id);
CREATE INDEX idx_message_threads_last_message_at ON message_threads(last_message_at);

-- Table 22: Messages (Depends on: message_threads)
CREATE TABLE messages (
    id VARCHAR(50) PRIMARY KEY,
    thread_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    sender_type message_sender_type NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    attachments JSONB,
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP
);

CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Table 23: Thread Participants (Depends on: message_threads)
CREATE TABLE thread_participants (
    thread_id VARCHAR(50) NOT NULL,
    participant_id VARCHAR(50) NOT NULL,
    participant_type message_sender_type NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    
    PRIMARY KEY (thread_id, participant_id)
);

CREATE INDEX idx_thread_participants_participant_id ON thread_participants(participant_id);
CREATE INDEX idx_thread_participants_last_read_at ON thread_participants(last_read_at);

-- ============================================================================
-- STEP 7: CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_practices_updated_at BEFORE UPDATE ON practices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_practice_locations_updated_at BEFORE UPDATE ON practice_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_appointment_requests_updated_at BEFORE UPDATE ON appointment_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_membership_plans_updated_at BEFORE UPDATE ON membership_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_approval_requests_updated_at BEFORE UPDATE ON approval_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 8: CREATE OPTIONAL VIEWS
-- ============================================================================

-- View: Active Doctors with Practice Info
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

-- View: Pending Approval Requests
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

-- ============================================================================
-- STEP 9: VERIFICATION QUERIES
-- ============================================================================

-- Check all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all indexes were created
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check all foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- 
-- All tables, indexes, foreign keys, triggers, and views have been created.
-- 
-- Next Steps:
-- 1. Verify all tables exist (run verification queries above)
-- 2. Begin data migration from localStorage/TypeScript files
-- 3. Set up backend API to connect to this database
--
-- ============================================================================
