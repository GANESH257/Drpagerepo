-- Migration 004: Doctor portal - contacts, profile views, committees, announcements, preferences
-- Requires: doctors, practices tables

-- Doctor contacts (My Contacts)
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

-- Profile views (dashboard metric)
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

-- Committees (Leadership & Committees)
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

-- Announcements (replace Firestore)
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

-- Doctor preferences (Account Settings)
CREATE TABLE IF NOT EXISTS doctor_preferences (
    doctor_id VARCHAR(50) PRIMARY KEY,
    email_digest BOOLEAN DEFAULT true,
    notify_referrals BOOLEAN DEFAULT true,
    notify_messages BOOLEAN DEFAULT true,
    notify_announcements BOOLEAN DEFAULT true,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
