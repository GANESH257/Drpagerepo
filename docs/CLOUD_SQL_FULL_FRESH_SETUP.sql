-- ============================================================================
-- AIP — Full Cloud SQL setup for NEW GCP instance (fresh deployment)
-- ============================================================================
-- Run this entire file in Cloud SQL (PostgreSQL) on your new instance.
--
-- How to run:
--   • GCP Console: Cloud SQL > your instance > Databases > open Cloud Shell
--     or use "Open Cloud SQL Studio" and paste/run this file.
--   • Or connect with psql and: \i /path/to/CLOUD_SQL_FULL_FRESH_SETUP.sql
--
-- What this does:
--   • Creates all tables for: users, practices, doctors, admins, approvals,
--     referrals, messages, community, doctor portal (contacts, committees,
--     announcements, preferences), admin portal (reports, moderation),
--     platform config (specialties, conditions, treatments, system_settings).
--   • No migration: use only on a new/empty database.
--   • Uses VARCHAR (no ENUMs); IF NOT EXISTS / ON CONFLICT for idempotency.
--
-- After running:
--   1. Replace REPLACE_WITH_BCRYPT_HASH with a real bcrypt hash for admin.
--      Generate: node -e "const bcrypt=require('bcrypt');bcrypt.hash('Admin@12345',10).then(h=>console.log(h));"
--   2. Point backend .env to this DB (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'applicant',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(100),
    password_reset_token VARCHAR(100),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ----------------------------------------------------------------------------
-- 2. PRACTICES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practices (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(10),
    country VARCHAR(2) DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    logo_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_practices_slug ON practices(slug);
CREATE INDEX IF NOT EXISTS idx_practices_city_state ON practices(city, state);
CREATE INDEX IF NOT EXISTS idx_practices_status ON practices(status);

-- ----------------------------------------------------------------------------
-- 3. MEMBERSHIP PLANS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_plans (
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
CREATE INDEX IF NOT EXISTS idx_membership_plans_active ON membership_plans(active);

-- ----------------------------------------------------------------------------
-- 4. PRACTICE LOCATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practice_locations (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    address TEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    phone VARCHAR(50),
    hours VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    directions_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_practice_locations_practice_id ON practice_locations(practice_id);

-- ----------------------------------------------------------------------------
-- 5. DOCTORS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE,
    practice_id VARCHAR(50),
    slug VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    credentials VARCHAR(50),
    specialty VARCHAR(100) NOT NULL,
    bio TEXT,
    about TEXT,
    profile_image_url VARCHAR(500),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(500),
    medical_school VARCHAR(255),
    residency VARCHAR(255),
    internship VARCHAR(255),
    board_certifications JSONB,
    hospital_privileges JSONB,
    states_licensed_in JSONB,
    conditions_and_services JSONB,
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    accepts_new_patients BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    npi VARCHAR(10) UNIQUE,
    profile_status VARCHAR(50) DEFAULT 'active',
    badges_awards JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_doctors_practice_id ON doctors(practice_id);
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_verified ON doctors(verified);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_npi ON doctors(npi) WHERE npi IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_profile_status ON doctors(profile_status);

-- ----------------------------------------------------------------------------
-- 6. ADMINS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ----------------------------------------------------------------------------
-- 7. PRACTICE SPECIALTIES, SERVICES, INSURANCE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practice_specialties (
    practice_id VARCHAR(50) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    PRIMARY KEY (practice_id, specialty),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_practice_specialties_practice_id ON practice_specialties(practice_id);

CREATE TABLE IF NOT EXISTS practice_services (
    practice_id VARCHAR(50) NOT NULL,
    service VARCHAR(255) NOT NULL,
    PRIMARY KEY (practice_id, service),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_practice_services_practice_id ON practice_services(practice_id);

CREATE TABLE IF NOT EXISTS practice_insurance (
    id VARCHAR(50),
    practice_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    UNIQUE(practice_id, slug),
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_practice_insurance_practice_id ON practice_insurance(practice_id);

-- Trigger so INSERT (practice_id, name, slug) without id still works
CREATE OR REPLACE FUNCTION set_practice_insurance_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    NEW.id := 'pi-' || substr(md5(random()::text || clock_timestamp()::text), 1, 24);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_practice_insurance_id ON practice_insurance;
CREATE TRIGGER trg_practice_insurance_id BEFORE INSERT ON practice_insurance
  FOR EACH ROW EXECUTE PROCEDURE set_practice_insurance_id();

-- ----------------------------------------------------------------------------
-- 8. PRACTICE ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practice_roles (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'doctor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50),
    UNIQUE(practice_id, doctor_id),
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_practice_roles_practice_id ON practice_roles(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_roles_doctor_id ON practice_roles(doctor_id);
CREATE INDEX IF NOT EXISTS idx_practice_roles_role ON practice_roles(role);

-- ----------------------------------------------------------------------------
-- 9. APPROVAL REQUESTS & HISTORY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approval_requests (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_by_type VARCHAR(50) NOT NULL DEFAULT 'applicant',
    practice_id VARCHAR(255),
    target_doctor_id VARCHAR(255),
    payload JSONB NOT NULL,
    admin_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    practice_admin_status VARCHAR(50),
    admin_notes TEXT,
    practice_admin_notes TEXT,
    admin_reviewed_at TIMESTAMP,
    practice_admin_reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    rejected_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approval_requests_type ON approval_requests(type);
CREATE INDEX IF NOT EXISTS idx_approval_requests_admin_status ON approval_requests(admin_status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_practice_admin_status ON approval_requests(practice_admin_status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_practice_id ON approval_requests(practice_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at ON approval_requests(created_at DESC);

CREATE TABLE IF NOT EXISTS approval_history (
    id VARCHAR(255) PRIMARY KEY,
    approval_request_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    performed_by_type VARCHAR(50) NOT NULL,
    actor_id VARCHAR(255),
    actor_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_approval_history_request_id ON approval_history(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_created_at ON approval_history(created_at DESC);

-- ----------------------------------------------------------------------------
-- 10. REFERRALS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(50) PRIMARY KEY,
    from_doctor_id VARCHAR(50) NOT NULL,
    to_doctor_id VARCHAR(50) NOT NULL,
    patient_name_or_initials VARCHAR(100) NOT NULL,
    patient_age INT,
    patient_sex VARCHAR(20),
    patient_phone VARCHAR(20),
    condition_summary TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended_at TIMESTAMP,
    FOREIGN KEY (from_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (to_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    CHECK (from_doctor_id != to_doctor_id)
);
CREATE INDEX IF NOT EXISTS idx_referrals_from_doctor_id ON referrals(from_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_to_doctor_id ON referrals(to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);

-- ----------------------------------------------------------------------------
-- 11. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notifications_doctor_id ON notifications(doctor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ----------------------------------------------------------------------------
-- 12. APPOINTMENT REQUESTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointment_requests (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    reason TEXT,
    insurance VARCHAR(255),
    status VARCHAR(50) DEFAULT 'New',
    declined_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_doctor_id ON appointment_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status);

-- ----------------------------------------------------------------------------
-- 13. MEMBERSHIPS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    practice_id VARCHAR(50),
    plan_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    next_billing_date DATE,
    payment_method VARCHAR(50) NOT NULL,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_memberships_doctor_id ON memberships(doctor_id);
CREATE INDEX IF NOT EXISTS idx_memberships_practice_id ON memberships(practice_id);

-- ----------------------------------------------------------------------------
-- 14. PRACTICE INVITATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS practice_invitations (
    id VARCHAR(50) PRIMARY KEY,
    practice_id VARCHAR(50) NOT NULL,
    invited_by VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255),
    message TEXT,
    token VARCHAR(100) UNIQUE NOT NULL,
    invitation_link VARCHAR(500),
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_practice_invitations_practice_id ON practice_invitations(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_invitations_token ON practice_invitations(token);

-- ----------------------------------------------------------------------------
-- 15. MESSAGE THREADS & MESSAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_threads (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    practice_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    thread_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    sender_type VARCHAR(50) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE TABLE IF NOT EXISTS thread_participants (
    thread_id VARCHAR(50) NOT NULL,
    participant_id VARCHAR(50) NOT NULL,
    participant_type VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    PRIMARY KEY (thread_id, participant_id),
    FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_thread_participants_participant_id ON thread_participants(participant_id);

-- ----------------------------------------------------------------------------
-- 16. DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments(slug);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

-- ----------------------------------------------------------------------------
-- 17. COMMUNITY (posts & comments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(255) PRIMARY KEY,
    section VARCHAR(255) NOT NULL,
    author_type VARCHAR(50) NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    author_display_name VARCHAR(500) NOT NULL,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_posts_section ON community_posts(section);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS community_comments (
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    author_type VARCHAR(50) NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    author_display_name VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at ASC);

-- ----------------------------------------------------------------------------
-- 18. COMMUNITY MODERATION (admin portal)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_post_reports (
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    reported_by_doctor_id VARCHAR(255) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_post_reports_post_id ON community_post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_reports_status ON community_post_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_post_reports_created_at ON community_post_reports(created_at DESC);

CREATE TABLE IF NOT EXISTS community_user_moderation (
    id VARCHAR(255) PRIMARY KEY,
    doctor_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    reason TEXT,
    until TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_user_moderation_doctor_id ON community_user_moderation(doctor_id);
CREATE INDEX IF NOT EXISTS idx_community_user_moderation_status ON community_user_moderation(status);

-- ----------------------------------------------------------------------------
-- 19. ORG POLICIES & GLOBAL EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_policies (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_org_policies_category ON org_policies(category);

CREATE TABLE IF NOT EXISTS global_medical_events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    description TEXT,
    url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_global_medical_events_date ON global_medical_events(date);

-- ----------------------------------------------------------------------------
-- 20. DOCTOR PORTAL: contacts, profile views, committees, announcements, preferences
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor_contacts (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    contact_doctor_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, contact_doctor_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_doctor_contacts_doctor_id ON doctor_contacts(doctor_id);

CREATE TABLE IF NOT EXISTS doctor_profile_views (
    id VARCHAR(50) PRIMARY KEY,
    doctor_id VARCHAR(50) NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    viewer_doctor_id VARCHAR(50),
    session_id VARCHAR(255),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_doctor_profile_views_doctor_id ON doctor_profile_views(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profile_views_viewed_at ON doctor_profile_views(doctor_id, viewed_at);

CREATE TABLE IF NOT EXISTS committees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS committee_members (
    id VARCHAR(50) PRIMARY KEY,
    committee_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    role VARCHAR(100),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (committee_id) REFERENCES committees(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_committee_members_committee_id ON committee_members(committee_id);

CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(50) PRIMARY KEY,
    audience_type VARCHAR(50) NOT NULL,
    audience_practice_id VARCHAR(50),
    audience_specialty VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (audience_practice_id) REFERENCES practices(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements(audience_type);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);

CREATE TABLE IF NOT EXISTS announcement_read (
    announcement_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (announcement_id, doctor_id),
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_preferences (
    doctor_id VARCHAR(50) PRIMARY KEY,
    email_digest BOOLEAN DEFAULT true,
    notify_referrals BOOLEAN DEFAULT true,
    notify_messages BOOLEAN DEFAULT true,
    notify_announcements BOOLEAN DEFAULT true,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 21. PLATFORM CONFIG: medical data & system settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS insurance_providers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS specialties (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conditions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatments (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS condition_treatments (
    condition_id VARCHAR(255) NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
    treatment_id VARCHAR(255) NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    PRIMARY KEY (condition_id, treatment_id)
);
CREATE INDEX IF NOT EXISTS idx_condition_treatments_condition_id ON condition_treatments(condition_id);
CREATE INDEX IF NOT EXISTS idx_condition_treatments_treatment_id ON condition_treatments(treatment_id);

CREATE TABLE IF NOT EXISTS condition_treatment_suggestions (
    id VARCHAR(255) PRIMARY KEY,
    doctor_id VARCHAR(255) NOT NULL,
    suggestion_type VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    condition_id VARCHAR(255),
    treatment_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_condition_treatment_suggestions_status ON condition_treatment_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_condition_treatment_suggestions_created_at ON condition_treatment_suggestions(created_at DESC);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
    id VARCHAR(255) PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 22. UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_practices_updated_at ON practices;
DROP TRIGGER IF EXISTS trg_doctors_updated_at ON doctors;
DROP TRIGGER IF EXISTS trg_approval_requests_updated_at ON approval_requests;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_practices_updated_at BEFORE UPDATE ON practices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trg_approval_requests_updated_at BEFORE UPDATE ON approval_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 23. SEED: DEPARTMENTS
-- ----------------------------------------------------------------------------
INSERT INTO departments (id, name, slug, description) VALUES
('dept-001', 'Bariatric & General Surgery', 'bariatric-general-surgery', 'Surgical weight loss procedures and general surgical interventions for various conditions.'),
('dept-002', 'Cardiology', 'cardiology', 'Heart and cardiovascular system care including diagnosis, treatment, and prevention of heart disease.'),
('dept-003', 'Dermatology', 'dermatology', 'Skin, hair, and nail care including treatment of conditions, skin cancer screening, and cosmetic procedures.'),
('dept-004', 'Endocrinology', 'endocrinology', 'Diagnosis and treatment of hormone-related disorders, including diabetes, thyroid conditions, and metabolic diseases.'),
('dept-005', 'Family Practice', 'family-practice', 'Comprehensive healthcare for patients of all ages, from infants to seniors, providing continuity of care.'),
('dept-006', 'Gastroenterology', 'gastroenterology', 'Digestive system care including diagnosis and treatment of disorders affecting the stomach, intestines, liver, and pancreas.'),
('dept-007', 'Internal Medicine', 'internal-medicine', 'Comprehensive primary care for adults, focusing on prevention, diagnosis, and treatment of adult diseases.'),
('dept-008', 'Nephrology', 'nephrology', 'Kidney health and disease management, including dialysis and transplant coordination.'),
('dept-009', 'Neurology', 'neurology', 'Diagnosis and treatment of disorders affecting the brain, spinal cord, and nervous system.'),
('dept-010', 'Nurse Practitioners', 'nurse-practitioners', 'Advanced practice nursing providing primary and specialty care with a focus on patient education and wellness.'),
('dept-011', 'Ophthalmology', 'ophthalmology', 'Eye care including diagnosis, treatment, and surgery for eye diseases and vision problems.'),
('dept-012', 'Otolaryngology (ENT)', 'otolaryngology-ent', 'Ear, nose, and throat care including treatment of hearing loss, sinus conditions, and head/neck disorders.'),
('dept-013', 'Orthopedic Spine', 'orthopedic-spine', 'Specialized spine care including minimally invasive spine surgery and treatment of spinal disorders.'),
('dept-014', 'Pediatrics', 'pediatrics', 'Comprehensive healthcare for infants, children, and adolescents.'),
('dept-015', 'Plastic / Reconstructive Surgery', 'plastic-reconstructive-surgery', 'Cosmetic and reconstructive surgical procedures to enhance appearance and restore function.'),
('dept-016', 'Podiatry', 'podiatry', 'Expert foot and ankle care, including treatment of injuries, deformities, and chronic conditions.'),
('dept-017', 'Psychiatry', 'psychiatry', 'Mental health care including diagnosis, treatment, and management of psychiatric disorders.'),
('dept-018', 'Pulmonology', 'pulmonology', 'Respiratory system care including diagnosis and treatment of lung diseases and breathing disorders.'),
('dept-019', 'Rheumatology', 'rheumatology', 'Specialized care for autoimmune diseases, arthritis, and conditions affecting joints, muscles, and bones.'),
('dept-020', 'Sports Medicine', 'sports-medicine', 'Specialized care for athletes and active individuals, focusing on injury prevention, treatment, and performance.'),
('dept-021', 'Vascular Surgery', 'vascular-surgery', 'Treatment of diseases affecting blood vessels, including minimally invasive and surgical interventions.')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 23b. SEED: MEMBERSHIP PLANS (required for join flow)
-- ----------------------------------------------------------------------------
INSERT INTO membership_plans (id, name, badge, monthly_price, annual_price, description, features, cta_label, cta_href, active, created_at, updated_at)
VALUES
  ('basic', 'Basic', NULL, 99, 990, 'Essential features for independent physicians getting started.', '["Directory listing","Basic profile management","Referral network access","Community forum access","Email support","Profile verification","Up to 2 practice locations","Basic analytics"]'::jsonb, 'Choose Plan', '/join-us', TRUE, NOW(), NOW()),
  ('professional', 'Professional', 'Most Popular', 199, 1990, 'Comprehensive features for established practices seeking growth.', '["Everything in Basic","Advanced profile customization","Priority referral matching","Appointment request system","Review management tools","Priority support","Unlimited practice locations","Advanced analytics & insights","Publication showcase","Featured listing placement"]'::jsonb, 'Choose Plan', '/join-us', TRUE, NOW(), NOW()),
  ('premier', 'Premier', NULL, 0, 0, 'Enterprise-level features for large practices and groups.', '["Everything in Professional","Multi-provider account management","Custom integration support","Dedicated account manager","Custom reporting & analytics","White-label options","API access","Custom contract terms","On-site training & onboarding","24/7 priority support"]'::jsonb, 'Contact Sales', '/join-us', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 24. SEED: ADMIN USER (replace password hash before first use)
-- ----------------------------------------------------------------------------
-- Generate bcrypt hash: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin@12345', 10).then(h => console.log(h));"
-- Then replace REPLACE_WITH_BCRYPT_HASH below.
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
VALUES (
    'admin-user-001',
    'admin@aip.com',
    'REPLACE_WITH_BCRYPT_HASH',
    'admin',
    'active',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    email_verified = TRUE,
    updated_at = NOW();

INSERT INTO admins (id, user_id, name, email, created_at, updated_at)
VALUES (
    'admin-001',
    'admin-user-001',
    'System Administrator',
    'admin@aip.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

-- ----------------------------------------------------------------------------
-- 25. SEED: ORG POLICIES (sample; full set in POLICIES_EVENTS_MIGRATION.sql)
-- ----------------------------------------------------------------------------
INSERT INTO org_policies (id, category, title, body) VALUES
('policy-001', 'Governance', 'Code of Conduct', 'All members of the Alliance of Independent Physicians are expected to maintain the highest standards of professional conduct.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-002', 'Governance', 'Conflict of Interest Policy', 'Members must disclose any potential conflicts of interest that may arise in the course of their professional activities.')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 26. SEED: GLOBAL MEDICAL EVENTS (sample)
-- ----------------------------------------------------------------------------
INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('evt-001', 'Annual Medical Conference 2026', '2026-03-15', 'San Francisco, CA', FALSE, 'Join leading physicians for continuing education and networking.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('evt-002', 'Cardiology Symposium', '2026-04-22', 'Online', TRUE, 'Virtual symposium covering the latest advances in cardiology.', '#')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 27. VERIFICATION
-- ----------------------------------------------------------------------------
SELECT 'Tables created' AS step;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'Admin user (update password_hash if still placeholder)' AS step;
SELECT id, email, role, status FROM users WHERE email = 'admin@aip.com';

-- ============================================================================
-- DONE. Next steps:
-- 1. Replace REPLACE_WITH_BCRYPT_HASH with a real bcrypt hash for admin@aip.com.
-- 2. Point backend .env to this DB (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD).
-- 3. Deploy backend (e.g. Cloud Run) and frontend; configure secrets for DB.
-- ============================================================================
