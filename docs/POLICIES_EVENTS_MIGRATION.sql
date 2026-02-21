-- ============================================================================
-- POLICIES AND EVENTS TABLES MIGRATION
-- ============================================================================
-- Run this after the main CLOUD_SQL_MIGRATION.sql

-- Table: Organization Policies
CREATE TABLE IF NOT EXISTS org_policies (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_policies_category ON org_policies(category);
CREATE INDEX idx_org_policies_updated_at ON org_policies(updated_at);

-- Table: Global Medical Events
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

CREATE INDEX idx_global_medical_events_date ON global_medical_events(date);
CREATE INDEX idx_global_medical_events_is_online ON global_medical_events(is_online);

-- Insert default policies (from orgPolicies.ts)
INSERT INTO org_policies (id, category, title, body) VALUES
('policy-001', 'Governance', 'Code of Conduct', 'All members of the Alliance of Independent Physicians are expected to maintain the highest standards of professional conduct. This includes:

• Treating all patients with dignity, respect, and compassion
• Maintaining confidentiality of patient information
• Adhering to all applicable medical ethics guidelines
• Engaging in honest and transparent communication
• Respecting the professional boundaries of colleagues

Violations of the Code of Conduct may result in disciplinary action, including suspension or termination of membership.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-002', 'Governance', 'Conflict of Interest Policy', 'Members must disclose any potential conflicts of interest that may arise in the course of their professional activities. This includes:

• Financial relationships with pharmaceutical companies, medical device manufacturers, or other healthcare entities
• Ownership interests in healthcare facilities or services
• Consulting arrangements or speaking engagements
• Research funding or grants

All disclosures must be made in writing to the Board of Trustees. The Board will review each disclosure and determine appropriate management strategies.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-003', 'Governance', 'Governance Bylaws', 'The Alliance of Independent Physicians operates under a set of bylaws that govern:

• Board composition and election procedures
• Meeting schedules and quorum requirements
• Decision-making processes
• Financial management and reporting
• Amendment procedures

All members are entitled to review the complete bylaws document. The current bylaws are effective February 4, 2026, and may be amended by a two-thirds majority vote of the Board of Trustees.

[Download the complete bylaws document](/policies/governance-bylaws.pdf)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-004', 'Compliance', 'Privacy & Data Handling', 'The Alliance is committed to protecting the privacy and security of member and patient data. Our data handling practices comply with:

• Health Insurance Portability and Accountability Act (HIPAA)
• General Data Protection Regulation (GDPR) where applicable
• State and federal privacy laws

Key principles:

• Data is collected only for legitimate business purposes
• Access to data is restricted to authorized personnel
• Data is encrypted both in transit and at rest
• Regular security audits are conducted
• Breach notification procedures are in place

Members must also comply with all applicable privacy regulations in their own practices.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-005', 'Compliance', 'Patient Safety Commitment', 'Patient safety is our highest priority. All members commit to:

• Following evidence-based medical practices
• Maintaining current medical licenses and certifications
• Participating in continuing medical education
• Reporting adverse events through appropriate channels
• Engaging in quality improvement initiatives

Members are expected to maintain professional liability insurance and adhere to all applicable standards of care. The Alliance provides resources and support for quality improvement efforts.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-006', 'Operations', 'Meeting Minutes Policy', 'All official meetings of the Board of Trustees and committees are documented through meeting minutes. The minutes include:

• Date, time, and location of the meeting
• List of attendees
• Agenda items discussed
• Decisions made and votes taken
• Action items assigned

Minutes are reviewed and approved at the subsequent meeting. Approved minutes are made available to all members within 30 days of approval. Confidential matters may be documented separately.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-007', 'Membership', 'Membership Eligibility', 'To be eligible for membership in the Alliance of Independent Physicians, applicants must:

• Hold a valid medical license in good standing
• Be board-certified in their specialty (or board-eligible for recent graduates)
• Practice independently or in a small group practice
• Agree to abide by the Code of Conduct and all Alliance policies
• Complete the application process and pay applicable fees

Membership applications are reviewed by the Membership Committee. Decisions are typically made within 30 days of receiving a complete application.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-008', 'Membership', 'Membership Dues and Fees', 'Membership dues are structured as follows:

• Basic Plan: $99/month or $990/year
• Professional Plan: $199/month or $1,990/year
• Premier Plan: Custom pricing (contact for details)

Dues are billed according to the selected billing cycle. Members may upgrade or downgrade their plan at any time, with prorated adjustments. Late payments may result in suspension of membership benefits. Refunds are available within 30 days of initial membership for new members who are not satisfied with the service.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-009', 'Membership', 'Member Benefits and Services', 'Membership benefits vary by plan level:

Basic Plan includes:
• Directory listing
• Basic profile management
• Referral network access
• Community forum access
• Email support

Professional Plan includes all Basic benefits plus:
• Advanced profile customization
• Priority referral matching
• Appointment request system
• Review management tools
• Priority support
• Advanced analytics

Premier Plan includes all Professional benefits plus:
• Multi-provider account management
• Custom integration support
• Dedicated account manager
• Custom reporting
• White-label options
• API access

Additional services may be available for an additional fee.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-010', 'Privacy', 'Member Directory Privacy', 'Member directory listings are publicly accessible and include:

• Name and credentials
• Specialty
• Practice location(s)
• Contact information (as provided by member)
• Professional bio (optional)

Members can control which information is displayed in their directory listing through their dashboard. The Alliance respects member privacy preferences and will not share contact information without explicit consent, except as required by law.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO org_policies (id, category, title, body) VALUES
('policy-011', 'Privacy', 'Data Retention and Deletion', 'The Alliance retains member data for as long as membership is active and for a reasonable period thereafter for legal and business purposes. Upon termination of membership:

• Member profile is removed from public directory
• Access to member portal is revoked
• Data is archived for 7 years (as required by law)
• After 7 years, data may be permanently deleted

Members may request deletion of their data at any time, subject to legal retention requirements. Requests must be made in writing to the Privacy Officer.')
ON CONFLICT (id) DO NOTHING;

-- Insert default events (from globalMedicalEvents.ts)
INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('1', 'Annual Medical Conference 2026', '2026-03-15', 'San Francisco, CA', FALSE, 'Join leading physicians for three days of continuing education, networking, and the latest medical research presentations.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('2', 'Cardiology Symposium: Advances in Heart Care', '2026-04-22', 'Online', TRUE, 'Virtual symposium covering the latest advances in cardiology, featuring expert presentations and case studies.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('3', 'Primary Care Summit', '2026-05-10', 'Chicago, IL', FALSE, 'Comprehensive conference for primary care physicians focusing on evidence-based practices and patient care optimization.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('4', 'Endocrinology Webinar Series', '2026-06-05', 'Online', TRUE, 'Monthly webinar series covering diabetes management, thyroid disorders, and metabolic health updates.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('5', 'Rheumatology Annual Meeting', '2026-07-18', 'Boston, MA', FALSE, 'Annual gathering of rheumatology specialists featuring research presentations, workshops, and networking opportunities.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('6', 'Telemedicine Best Practices Workshop', '2026-08-12', 'Online', TRUE, 'Interactive workshop on implementing effective telemedicine practices, patient engagement, and technology integration.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('7', 'Medical Ethics & Patient Care Conference', '2026-09-20', 'Washington, DC', FALSE, 'Explore ethical considerations in modern healthcare delivery, patient autonomy, and professional responsibilities.', '#')
ON CONFLICT (id) DO NOTHING;

INSERT INTO global_medical_events (id, title, date, location, is_online, description, url) VALUES
('8', 'Preventive Medicine Forum', '2026-10-15', 'Online', TRUE, 'Virtual forum discussing preventive care strategies, screening guidelines, and population health initiatives.', '#')
ON CONFLICT (id) DO NOTHING;
