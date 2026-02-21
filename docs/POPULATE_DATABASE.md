# Populate Database with Departments Data

**Goal**: Add departments/specialties data to Cloud SQL database

---

## Option 1: Use GCP Console (Easiest)

1. **Go to Cloud SQL Console**: https://console.cloud.google.com/sql/instances
2. **Click your instance**: `aip-database`
3. **Click "Databases"** tab
4. **Click "Open Cloud Shell"** or use the SQL editor
5. **Run the SQL** from `POPULATE_DEPARTMENTS.sql`

---

## Option 2: Use Cloud Shell with psql

```bash
# Connect to database
gcloud sql connect aip-database --user=postgres

# Then paste the SQL from POPULATE_DEPARTMENTS.sql
```

---

## Option 3: Use Cloud Shell with gcloud sql

```bash
# Run SQL file directly
gcloud sql databases execute-sql aip-database \
  --sql-file=populate_departments.sql \
  --database=aip_production
```

---

## Quick SQL Commands (Copy-Paste)

Run these in Cloud SQL:

```sql
-- Create departments table
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

-- Insert departments
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
```

---

## After Running SQL

1. **Update backend route** to use `departments` table (see `UPDATE_DEPARTMENTS_ENDPOINT.md`)
2. **Upload updated file** to Cloud Shell
3. **Rebuild and redeploy** backend

---

## Verify Data Was Inserted

```sql
SELECT COUNT(*) FROM departments;
-- Should return 21
```
