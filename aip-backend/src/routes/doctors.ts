import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/doctors - Get all doctors (public)
// Query params: specialty, city, state, search, page, limit
router.get('/', async (req, res) => {
  try {
    const { specialty, city, state, search, page = '1', limit = '100' } = req.query;
    
    let query = `
      SELECT d.*, p.name as practice_name, p.city as practice_city, p.state as practice_state
      FROM doctors d
      LEFT JOIN practices p ON d.practice_id = p.id
      WHERE d.verified = true
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (specialty) {
      paramCount++;
      query += ` AND d.specialty = $${paramCount}`;
      params.push(specialty);
    }

    if (city) {
      paramCount++;
      query += ` AND p.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    if (state) {
      paramCount++;
      query += ` AND p.state = $${paramCount}`;
      params.push(state);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        d.full_name ILIKE $${paramCount} OR
        d.specialty ILIKE $${paramCount} OR
        p.name ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY d.full_name ASC';

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 100;
    const offset = (pageNum - 1) * limitNum;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limitNum);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM doctors d
      LEFT JOIN practices p ON d.practice_id = p.id
      WHERE d.verified = true
    `;
    const countParams: any[] = [];
    let countParamCount = 0;

    if (specialty) {
      countParamCount++;
      countQuery += ` AND d.specialty = $${countParamCount}`;
      countParams.push(specialty);
    }

    if (city) {
      countParamCount++;
      countQuery += ` AND p.city ILIKE $${countParamCount}`;
      countParams.push(`%${city}%`);
    }

    if (state) {
      countParamCount++;
      countQuery += ` AND p.state = $${countParamCount}`;
      countParams.push(state);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        d.full_name ILIKE $${countParamCount} OR
        d.specialty ILIKE $${countParamCount} OR
        p.name ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      doctors: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Subquery to get role_in_practice from practice_roles for a doctor
const roleInPracticeSubquery = `(SELECT pr.role FROM practice_roles pr WHERE pr.practice_id = d.practice_id AND pr.doctor_id = d.id LIMIT 1)`;

// GET /api/doctors/slug/:slug - Get single doctor by slug (must be before /:id)
router.get('/slug/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name as practice_name, ${roleInPracticeSubquery} as role_in_practice
       FROM doctors d
       LEFT JOIN practices p ON d.practice_id = p.id
       WHERE d.slug = $1`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching doctor by slug:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Authenticated /me routes (must be before /:id) ---

// GET /api/doctors/me/contacts - List my contacts (doctor summaries)
router.get('/me/contacts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctorId = req.doctorId;
    if (!doctorId) return res.status(403).json({ error: 'Doctor not found' });
    const result = await pool.query(
      `SELECT d.id, d.full_name, d.slug, d.specialty, d.profile_image_url, dc.created_at as added_at
       FROM doctor_contacts dc
       JOIN doctors d ON d.id = dc.contact_doctor_id
       WHERE dc.doctor_id = $1
       ORDER BY dc.created_at DESC`,
      [doctorId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/doctors/me/contacts - Add contact
router.post('/me/contacts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctorId = req.doctorId;
    const { doctor_id: contactDoctorId } = req.body;
    if (!doctorId || !contactDoctorId) return res.status(400).json({ error: 'doctor_id required' });
    if (contactDoctorId === doctorId) return res.status(400).json({ error: 'Cannot add yourself' });
    const id = `dc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await pool.query(
      'INSERT INTO doctor_contacts (id, doctor_id, contact_doctor_id) VALUES ($1, $2, $3) ON CONFLICT (doctor_id, contact_doctor_id) DO NOTHING',
      [id, doctorId, contactDoctorId]
    );
    const row = await pool.query(
      `SELECT d.id, d.full_name, d.slug, d.specialty, d.profile_image_url
       FROM doctor_contacts dc JOIN doctors d ON d.id = dc.contact_doctor_id
       WHERE dc.doctor_id = $1 AND dc.contact_doctor_id = $2`,
      [doctorId, contactDoctorId]
    );
    if (row.rows.length === 0) return res.status(400).json({ error: 'Contact already exists or invalid' });
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/doctors/me/contacts/:contactDoctorId
router.delete('/me/contacts/:contactDoctorId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctorId = req.doctorId;
    const contactDoctorId = req.params.contactDoctorId;
    if (!doctorId) return res.status(403).json({ error: 'Unauthorized' });
    const result = await pool.query(
      'DELETE FROM doctor_contacts WHERE doctor_id = $1 AND contact_doctor_id = $2 RETURNING id',
      [doctorId, contactDoctorId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact not found' });
    res.json({ ok: true });
  } catch (error) {
    console.error('Error removing contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/doctors/me/profile-stats - Profile views this month, etc.
router.get('/me/profile-stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctorId = req.doctorId;
    if (!doctorId) return res.status(403).json({ error: 'Doctor not found' });
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM doctor_profile_views WHERE doctor_id = $1 AND viewed_at >= $2',
      [doctorId, startOfMonth.toISOString()]
    );
    const profile_views_this_month = parseInt(countResult.rows[0]?.total || '0', 10);
    res.json({ profile_views_this_month });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/doctors/:id/view - Record profile view (public or optional auth)
router.post('/:id/view', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const viewerDoctorId = (req as any).doctorId || null;
    const id = `dpv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await pool.query(
      'INSERT INTO doctor_profile_views (id, doctor_id, viewer_doctor_id) VALUES ($1, $2, $3)',
      [id, doctorId, viewerDoctorId]
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error recording profile view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/doctors/me/preferences
router.get('/me/preferences', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctorId = req.doctorId;
    if (!doctorId) return res.status(403).json({ error: 'Unauthorized' });
    const result = await pool.query('SELECT * FROM doctor_preferences WHERE doctor_id = $1', [doctorId]);
    if (result.rows.length === 0) {
      return res.json({
        doctor_id: doctorId,
        email_digest: true,
        notify_referrals: true,
        notify_messages: true,
        notify_announcements: true,
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/doctors/me/preferences
router.put('/me/preferences', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctorId = req.doctorId;
    if (!doctorId) return res.status(403).json({ error: 'Unauthorized' });
    const { email_digest, notify_referrals, notify_messages, notify_announcements } = req.body;
    await pool.query(
      `INSERT INTO doctor_preferences (doctor_id, email_digest, notify_referrals, notify_messages, notify_announcements, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (doctor_id) DO UPDATE SET
         email_digest = COALESCE(EXCLUDED.email_digest, doctor_preferences.email_digest),
         notify_referrals = COALESCE(EXCLUDED.notify_referrals, doctor_preferences.notify_referrals),
         notify_messages = COALESCE(EXCLUDED.notify_messages, doctor_preferences.notify_messages),
         notify_announcements = COALESCE(EXCLUDED.notify_announcements, doctor_preferences.notify_announcements),
         updated_at = NOW()`,
      [doctorId, email_digest ?? true, notify_referrals ?? true, notify_messages ?? true, notify_announcements ?? true]
    );
    const row = await pool.query('SELECT * FROM doctor_preferences WHERE doctor_id = $1', [doctorId]);
    res.json(row.rows[0] || { doctor_id: doctorId, email_digest: true, notify_referrals: true, notify_messages: true, notify_announcements: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/doctors/me/membership
router.get('/me/membership', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const doctorId = req.doctorId;
    if (!doctorId) return res.status(403).json({ error: 'Unauthorized' });
    const result = await pool.query(
      'SELECT * FROM memberships WHERE doctor_id = $1 ORDER BY created_at DESC LIMIT 1',
      [doctorId]
    );
    if (result.rows.length === 0) return res.json(null);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching membership:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/doctors/:id - Get single doctor by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, p.name as practice_name, ${roleInPracticeSubquery} as role_in_practice
       FROM doctors d
       LEFT JOIN practices p ON d.practice_id = p.id
       WHERE d.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Map camelCase (frontend) to snake_case (DB) for doctor columns
const doctorUpdateKeyMap: Record<string, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  fullName: 'full_name',
  profileImageUrl: 'profile_image_url',
  medicalSchool: 'medical_school',
  boardCertifications: 'board_certifications',
  hospitalPrivileges: 'hospital_privileges',
  statesLicensedIn: 'states_licensed_in',
  conditionsAndServices: 'conditions_and_services',
  conditionServices: 'conditions_and_services',
  insurance: 'insurance',
  acceptsNewPatients: 'accepts_new_patients',
  reviewCount: 'review_count',
  practiceId: 'practice_id',
  roleInPractice: 'role_in_practice',
  profileStatus: 'profile_status',
  badgesAwards: 'badges_awards',
};

// PUT /api/doctors/:id - Update doctor (authenticated)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verify ownership or admin
    if (req.doctorId !== req.params.id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const body = req.body as Record<string, unknown>;
    const allowed = new Set([
      'first_name', 'last_name', 'full_name', 'credentials', 'specialty', 'bio', 'about',
      'profile_image_url', 'email', 'phone', 'website', 'medical_school', 'residency', 'internship',
      'board_certifications', 'hospital_privileges', 'states_licensed_in', 'conditions_and_services',
      'insurance',
      'verified', 'featured', 'accepts_new_patients', 'npi', 'profile_status', 'badges_awards', 'status',
    ]);
    const setParts: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(body)) {
      const dbKey = doctorUpdateKeyMap[key] || key;
      if (value === undefined) continue;
      if (!allowed.has(dbKey)) continue;
      setParts.push(`${dbKey} = $${idx + 1}`);
      // JSONB columns: stringify for JSON
      let val: unknown = value;
      if (dbKey === 'insurance' && Array.isArray(value)) val = JSON.stringify(value);
      else if (dbKey === 'conditions_and_services' && (Array.isArray(value) || (typeof value === 'object' && value !== null))) val = JSON.stringify(value);
      values.push(val);
      idx++;
    }
    if (setParts.length === 0) {
      const current = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
      return res.json(current.rows[0]);
    }
    const setClause = setParts.join(', ');
    const result = await pool.query(
      `UPDATE doctors SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id, ...values]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
