-- Populate Departments/Specialties Data
-- Run this SQL in Cloud SQL to populate departments

-- Insert specialties into practice_specialties table
-- Note: This requires at least one practice to exist
-- If you don't have practices yet, create a temporary practice first

-- Option 1: If you have practices, insert specialties for each practice
-- Replace 'YOUR_PRACTICE_ID' with an actual practice ID

-- Option 2: Create a dedicated departments table (RECOMMENDED)
-- This is better for reference data that doesn't depend on practices

-- Create departments table if it doesn't exist
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

-- Insert departments data
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
('dept-013', 'Orthopedic Spine', 'orthopedic-spine', 'Specialized spine care including minimally invasive spine surgery, endoscopic procedures, and treatment of spinal disorders.'),
('dept-014', 'Pediatrics', 'pediatrics', 'Comprehensive healthcare for infants, children, and adolescents, focusing on growth, development, and wellness.'),
('dept-015', 'Plastic / Reconstructive Surgery', 'plastic-reconstructive-surgery', 'Cosmetic and reconstructive surgical procedures to enhance appearance and restore function.'),
('dept-016', 'Podiatry', 'podiatry', 'Expert foot and ankle care, including treatment of injuries, deformities, and chronic conditions.'),
('dept-017', 'Psychiatry', 'psychiatry', 'Mental health care including diagnosis, treatment, and management of psychiatric disorders and emotional conditions.'),
('dept-018', 'Pulmonology', 'pulmonology', 'Respiratory system care including diagnosis and treatment of lung diseases and breathing disorders.'),
('dept-019', 'Rheumatology', 'rheumatology', 'Specialized care for autoimmune diseases, arthritis, and conditions affecting joints, muscles, and bones.'),
('dept-020', 'Sports Medicine', 'sports-medicine', 'Specialized care for athletes and active individuals, focusing on injury prevention, treatment, and performance optimization.'),
('dept-021', 'Vascular Surgery', 'vascular-surgery', 'Treatment of diseases affecting blood vessels, including minimally invasive and surgical interventions.')
ON CONFLICT (id) DO NOTHING;

-- Update backend route to use departments table instead of practice_specialties
-- The route will need to be updated to: SELECT * FROM departments ORDER BY name ASC
