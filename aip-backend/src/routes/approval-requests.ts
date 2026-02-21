import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/** Request types that require practice admin approval before system admin can see/approve */
const TYPES_REQUIRING_PRACTICE_ADMIN = [
  'doctor_join_practice', 'practice_doctor_add_request', 'practice_doctor_remove_request',
  'practice_edit_request', 'practice_location_add_request', 'practice_location_edit_request',
  'practice_location_remove_request', 'practice_location_change_request', 'practice_insurance_services_change_request',
];

/**
 * GET /api/approval-requests
 * Get approval requests with filters
 * Query params: type, status, practiceId, requestedBy (optional)
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, status, practiceId, requestedBy } = req.query;
    const userRole = req.userRole;
    const userId = req.userId;

    let query = 'SELECT * FROM approval_requests WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND (admin_status = $${paramCount} OR practice_admin_status = $${paramCount})`;
      params.push(status);
    }

    if (practiceId) {
      paramCount++;
      query += ` AND practice_id = $${paramCount}`;
      params.push(practiceId);
    }

    if (requestedBy) {
      paramCount++;
      query += ` AND requested_by = $${paramCount}`;
      params.push(requestedBy);
    }

    // Role-based filtering
    if (userRole === 'admin') {
      // Admin sees requests that need practice admin only after practice admin has approved
      const practiceAdminTypesList = TYPES_REQUIRING_PRACTICE_ADMIN.map((t) => `'${t.replace(/'/g, "''")}'`).join(',');
      query += ` AND (
        type NOT IN (${practiceAdminTypesList})
        OR practice_admin_status = 'approved'
      )`;
    } else if (userRole === 'practice_admin') {
      // Practice admin sees only their practice's requests
      const practiceAdminResult = await pool.query(
        `SELECT practice_id FROM practice_roles 
         WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = $1) 
         AND role = 'practice_admin'`,
        [userId]
      );

      if (practiceAdminResult.rows.length > 0) {
        const practiceIds = practiceAdminResult.rows.map(r => r.practice_id);
        paramCount++;
        query += ` AND practice_id = ANY($${paramCount})`;
        params.push(practiceIds);
      } else {
        return res.json([]);
      }
    } else {
      // Regular users see only their own requests
      paramCount++;
      query += ` AND requested_by = $${paramCount}`;
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching approval requests:', error);
    const message = error?.message || String(error);
    res.status(500).json({
      error: 'Internal server error',
      ...(message && { detail: message }),
    });
  }
});

/**
 * GET /api/approval-requests/:id
 * Get single approval request
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    const request = result.rows[0];

    // Admin can only see requests that need practice admin after practice admin has approved
    if (req.userRole === 'admin' && TYPES_REQUIRING_PRACTICE_ADMIN.includes(request.type)) {
      if (request.practice_admin_status !== 'approved') {
        return res.status(403).json({
          error: 'Request is pending practice admin approval. You will see it after the practice admin approves.',
          code: 'PENDING_PRACTICE_ADMIN',
        });
      }
    }

    // Get approval history
    const historyResult = await pool.query(
      'SELECT * FROM approval_history WHERE approval_request_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    const history = historyResult.rows;

    // Expose who approved (for admin to see practice admin approver)
    let practice_admin_approved_by: string | null = null;
    let practice_admin_approved_at: string | null = null;
    const paApproval = history.find(
      (h: any) => h.performed_by_type === 'practice_admin' && h.action === 'approved'
    );
    if (paApproval) {
      practice_admin_approved_by = paApproval.performed_by;
      practice_admin_approved_at = paApproval.created_at;
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.json({
      ...request,
      history,
      practice_admin_approved_by: practice_admin_approved_by ?? null,
      practice_admin_approved_at: practice_admin_approved_at ?? request.practice_admin_reviewed_at ?? null,
    });
  } catch (error: any) {
    console.error('Error fetching approval request:', error);
    const message = error?.message || String(error);
    res.status(500).json({
      error: 'Internal server error',
      ...(message && { detail: message }),
    });
  }
});

/**
 * POST /api/approval-requests
 * Create new approval request
 */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, practice_id, target_doctor_id, payload } = req.body;

    if (!type || !payload) {
      return res.status(400).json({ error: 'Type and payload required' });
    }

    const userId = req.userId;
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Determine requested_by_type
    let requested_by_type = 'applicant';
    if (req.userRole === 'doctor') {
      requested_by_type = 'doctor';
    } else if (req.userRole === 'practice_admin') {
      requested_by_type = 'practice_admin';
    }

    const result = await pool.query(
      `INSERT INTO approval_requests (
        id, type, requested_by, requested_by_type, practice_id, target_doctor_id, payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        requestId,
        type,
        userId,
        requested_by_type,
        practice_id || null,
        target_doctor_id || null,
        JSON.stringify(payload),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating approval request:', error);
    const message = error?.message || String(error);
    res.status(500).json({
      error: 'Internal server error',
      ...(message && { detail: message }),
    });
  }
});

/**
 * PUT /api/approval-requests/:id
 * Update approval request
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { payload } = req.body;

    // Only allow updating payload before approval
    const existing = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    const request = existing.rows[0];

    // Verify ownership
    if (request.requested_by !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Can only update if not yet approved/rejected
    if (request.admin_status !== 'pending' || request.practice_admin_status === 'approved') {
      return res.status(400).json({ error: 'Cannot update approved/rejected request' });
    }

    const result = await pool.query(
      `UPDATE approval_requests 
       SET payload = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [JSON.stringify(payload), req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating approval request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/approval-requests/:id/approve
 * Approve request (admin or practice admin).
 * Persists approval to DB with a single standalone UPDATE first (no transaction), so GET/list always see it.
 */
router.post('/:id/approve', authenticateToken, async (req: AuthRequest, res) => {
  const { notes } = req.body;
  const userRole = req.userRole;
  const userId = req.userId;
  const requestId = req.params.id;

  if (userRole !== 'admin' && userRole !== 'practice_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // 1) Load current request (read-only)
  const requestResult = await pool.query(
    'SELECT * FROM approval_requests WHERE id = $1',
    [requestId]
  );
  if (requestResult.rows.length === 0) {
    return res.status(404).json({ error: 'Approval request not found' });
  }
  const request = requestResult.rows[0];

  if (userRole === 'practice_admin') {
    const practiceAdminCheck = await pool.query(
      `SELECT practice_id FROM practice_roles 
       WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = $1) 
       AND role = 'practice_admin' AND practice_id = $2`,
      [userId, request.practice_id]
    );
    if (practiceAdminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized for this practice' });
    }
  }

  // Admin can only approve after practice admin has approved (for types that require it)
  if (userRole === 'admin' && TYPES_REQUIRING_PRACTICE_ADMIN.includes(request.type)) {
    if (request.practice_admin_status !== 'approved') {
      return res.status(403).json({
        error: 'Practice admin must approve first',
        code: 'PENDING_PRACTICE_ADMIN',
      });
    }
  }

  // 2) Persist approval with a single UPDATE (auto-commits). No transaction — so DB is updated and GET will see it.
  let savedRow: any;
  if (userRole === 'admin') {
    const updateResult = await pool.query(
      `UPDATE approval_requests 
       SET admin_status = 'approved', admin_notes = $1, admin_reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [notes || null, requestId]
    );
    if (updateResult.rows.length === 0) {
      console.error(`Approval DB update failed: no row for id=${requestId}`);
      return res.status(500).json({ error: 'Approval could not be saved' });
    }
    savedRow = updateResult.rows[0];
    console.log('Approval persisted (admin):', savedRow.id, 'admin_status=', savedRow.admin_status);
  } else {
    const updateResult = await pool.query(
      `UPDATE approval_requests 
       SET practice_admin_status = 'approved', practice_admin_notes = $1, practice_admin_reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [notes || null, requestId]
    );
    if (updateResult.rows.length === 0) {
      console.error(`Approval DB update failed: no row for id=${requestId}`);
      return res.status(500).json({ error: 'Approval could not be saved' });
    }
    savedRow = updateResult.rows[0];
    console.log('Approval persisted (practice_admin):', savedRow.id, 'practice_admin_status=', savedRow.practice_admin_status);
  }

  // 3) Insert history and run side effects (do not overwrite approval_requests)
  const historyId = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  try {
    await pool.query(
      `INSERT INTO approval_history (
        id, approval_request_id, action, performed_by, performed_by_type, actor_id, actor_type, notes
      ) VALUES ($1, $2, 'approved', $3, $4, $3, $4, $5)`,
      [historyId, requestId, userId, userRole, notes || null]
    );
  } catch (historyErr) {
    console.error('Approval history insert failed:', historyErr);
    // Still return success — approval is already in DB
  }

  const payload = typeof savedRow.payload === 'string' ? JSON.parse(savedRow.payload) : savedRow.payload;
  const needsPracticeAdmin = TYPES_REQUIRING_PRACTICE_ADMIN.includes(savedRow.type);
  const bothApproved = savedRow.admin_status === 'approved' &&
    (!needsPracticeAdmin || savedRow.practice_admin_status === 'approved');

  let sideEffectsApplied = false;
  let sideEffectsError: string | undefined;
  if (bothApproved) {
    const client = await pool.connect();
    try {
      await applyApprovalSideEffects(client, savedRow, payload);
      sideEffectsApplied = true;
    } catch (sideEffectError: any) {
      sideEffectsError = sideEffectError?.message || String(sideEffectError);
      console.error('Approval side effects failed:', sideEffectError);
    } finally {
      client.release();
    }
  }

  return res.json({
    ...savedRow,
    sideEffectsApplied,
    ...(sideEffectsError && { sideEffectsError }),
  });
});

/**
 * POST /api/approval-requests/:id/apply-side-effects
 * Admin-only. Re-run side effects for an already-approved request (e.g. if they failed the first time).
 * Idempotent: if user already has a doctor, only updates user role/status.
 */
router.post('/:id/apply-side-effects', authenticateToken, async (req: AuthRequest, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  const requestId = req.params.id;

  const requestResult = await pool.query(
    'SELECT * FROM approval_requests WHERE id = $1',
    [requestId]
  );
  if (requestResult.rows.length === 0) {
    return res.status(404).json({ error: 'Approval request not found' });
  }
  const request = requestResult.rows[0];
  if (request.admin_status !== 'approved') {
    return res.status(400).json({ error: 'Request is not approved' });
  }
  const payload = typeof request.payload === 'string' ? JSON.parse(request.payload) : request.payload;
  const joinTypes = ['new_practice_with_admin_doctor', 'doctor_join_practice'];
  if (!joinTypes.includes(request.type)) {
    return res.status(400).json({ error: 'Side effects only apply to join request types' });
  }

  const client = await pool.connect();
  try {
    const existingDoctor = await client.query(
      'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
      [request.requested_by]
    );
    if (existingDoctor.rows.length > 0) {
      await client.query(
        `UPDATE users SET role = 'doctor', status = 'active', updated_at = NOW() WHERE id = $1`,
        [request.requested_by]
      );
      return res.json({ ok: true, message: 'User already had doctor record; role and status updated.' });
    }
    await applyApprovalSideEffects(client, request, payload);
    return res.json({ ok: true, message: 'Side effects applied.' });
  } catch (err: any) {
    console.error('Apply side effects error:', err);
    res.status(500).json({ error: 'Failed to apply side effects', detail: err?.message });
  } finally {
    client.release();
  }
});

/**
 * Apply side effects when approval request is fully approved.
 * For join types: one transaction that creates practice, doctor, roles, membership, and updates user.
 * Either all steps succeed or none (ROLLBACK on any error).
 */
async function applyApprovalSideEffects(client: any, request: any, payload: any): Promise<void> {
  // For join requests, create practice/doctor records and update user in one transaction
  if (request.type === 'new_practice_with_admin_doctor' || request.type === 'doctor_join_practice') {
    if (!request.requested_by) {
      throw new Error('Approval request has no requested_by (user id)');
    }
    if (!payload || typeof payload !== 'object') {
      throw new Error('Approval payload is missing or invalid');
    }

    const doctorData = payload.doctor || {};
    const practiceData = payload.practice || {};
    const planData = payload.plan || { planId: 'basic', billingCycle: 'monthly' };

    try {
      await client.query('BEGIN');

      // 1) Get user
      console.log('[Approval setup] Loading user:', request.requested_by);
      const userResult = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [request.requested_by]
      );
      if (userResult.rows.length === 0) {
        throw new Error(`User not found: ${request.requested_by}`);
      }
      const user = userResult.rows[0];

      let practiceId: string;
      let doctorId: string;

      if (request.type === 'new_practice_with_admin_doctor') {
        // 2) Create practice
        practiceId = `practice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const practiceSlug = practiceData.name
          ? practiceData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          : `practice-${Date.now()}`;
        console.log('[Approval setup] Creating practice:', practiceId);

        // Cloud SQL schema: city, state, zip, country (not address_city/address_state/...)
        await client.query(
          `INSERT INTO practices (
            id, slug, name, description, phone, email, website,
            address_line1, address_line2, city, state, zip, country,
            status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`,
          [
            practiceId,
            practiceSlug,
            practiceData.name || 'New Practice',
            practiceData.description || null,
            doctorData.phone || null,
            user.email,
            practiceData.website || null,
            practiceData.address?.line1 || null,
            practiceData.address?.line2 || null,
            practiceData.address?.city || null,
            practiceData.address?.state || null,
            practiceData.address?.zip || null,
            (practiceData.address?.country || 'USA').substring(0, 2),
            'active',
          ]
        );

        // practice_locations: address_line1 NOT NULL, city/state/zip NOT NULL
        const locCity = practiceData.address?.city || 'N/A';
        const locState = practiceData.address?.state || 'NA';
        const locZip = practiceData.address?.zip || '00000';
        const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await client.query(
          `INSERT INTO practice_locations (
            id, practice_id, name, address_line1, address_line2, city, state, zip, phone,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            locationId,
            practiceId,
            'Main Office',
            practiceData.address?.line1 || 'N/A',
            practiceData.address?.line2 || null,
            locCity,
            locState.substring(0, 2),
            locZip,
            doctorData.phone || null,
          ]
        );
        if (doctorData.specialty) {
          await client.query(
            `INSERT INTO practice_specialties (practice_id, specialty)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [practiceId, doctorData.specialty]
          );
        }
      } else {
        // doctor_join_practice - use existing practice
        practiceId = request.practice_id || payload.practiceId;
        if (!practiceId) {
          throw new Error('Practice ID required for doctor_join_practice');
        }
      }

      // 3) Create doctor record (Cloud SQL: slug, first_name, last_name required)
      doctorId = `doctor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullName = doctorData.fullName || user.email.split('@')[0] || 'Doctor';
      const nameParts = String(fullName).trim().split(/\s+/);
      const firstName = nameParts[0] || 'Doctor';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
      const doctorSlug = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${doctorId.slice(-8)}`;
      console.log('[Approval setup] Creating doctor:', doctorId, 'for user:', user.id);
      await client.query(
        `INSERT INTO doctors (
          id, user_id, practice_id, slug, first_name, last_name, full_name, credentials, specialty, phone, email,
          verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [
          doctorId,
          user.id,
          practiceId,
          doctorSlug,
          firstName,
          lastName,
          fullName,
          doctorData.credentials || null,
          doctorData.specialty || 'General',
          doctorData.phone || null,
          user.email,
          true,
        ]
      );

      // 4) Practice role (Cloud SQL: practice_role_type enum is 'practice_admin' | 'doctor', not 'admin')
      const roleId = `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const role = request.type === 'new_practice_with_admin_doctor' ? 'practice_admin' : 'doctor';
      await client.query(
        `INSERT INTO practice_roles (id, practice_id, doctor_id, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (practice_id, doctor_id) DO NOTHING`,
        [roleId, practiceId, doctorId, role]
      );

      // 5) Membership (Cloud SQL: plan_name, amount, expiry_date, payment_method required)
      const membershipId = `membership-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const billingCycle = planData.billingCycle || 'monthly';
      const startDate = new Date();
      const expiryDate = new Date();
      if (billingCycle === 'annual') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      }
      const planName = planData.planName || 'Basic';
      const amount = 0; // or look up from membership_plans
      const paymentMethod = payload.paymentMethod || 'paypal';
      await client.query(
        `INSERT INTO memberships (
          id, doctor_id, practice_id, plan_id, plan_name, billing_cycle, amount, status, start_date, expiry_date, payment_method,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          membershipId,
          doctorId,
          practiceId,
          planData.planId || 'basic',
          planName,
          billingCycle,
          amount,
          'active',
          startDate.toISOString().slice(0, 10),
          expiryDate.toISOString().slice(0, 10),
          paymentMethod,
        ]
      );

      // 6) Update user so they can log in as doctor
      console.log('[Approval setup] Updating user role/status:', user.id);
      await client.query(
        `UPDATE users 
         SET role = 'doctor', status = 'active', updated_at = NOW()
         WHERE id = $1`,
        [user.id]
      );

      await client.query('COMMIT');
      console.log('[Approval setup] Done. User', user.id, 'can now log in as doctor.');
    } catch (err: any) {
      await client.query('ROLLBACK').catch(() => {});
      const msg = err?.message || String(err);
      console.error('[Approval setup] Failed:', msg);
      throw new Error(`Account setup failed: ${msg}`);
    }
  } else if (request.type === 'practice_edit_request') {
        // Update practice details
        const practiceId = request.practice_id || payload.practiceId;
        if (!practiceId) {
          throw new Error('Practice ID required');
        }

        const after = payload.after;
        await client.query(
          `UPDATE practices 
           SET name = $1, description = $2, phone = $3, website = $4, updated_at = NOW()
           WHERE id = $5`,
          [
            after.name,
            after.description || null,
            after.phone || null,
            after.website || null,
            practiceId,
          ]
        );

        // Update services
        if (after.services) {
          await client.query('DELETE FROM practice_services WHERE practice_id = $1', [practiceId]);
          for (const service of after.services) {
            await client.query(
              'INSERT INTO practice_services (practice_id, service) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [practiceId, service]
            );
          }
        }

        // Update insurance
        if (after.insurances) {
          await client.query('DELETE FROM practice_insurance WHERE practice_id = $1', [practiceId]);
          for (const insuranceName of after.insurances) {
            const insuranceSlug = insuranceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await client.query(
              `INSERT INTO practice_insurance (practice_id, name, slug) 
               VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [practiceId, insuranceName, insuranceSlug]
            );
          }
        }
      } else if (request.type === 'practice_location_add_request') {
        // Add location to practice
        const practiceId = request.practice_id || payload.practiceId;
        if (!practiceId || !payload.location || !payload.location.id) {
          throw new Error('Practice ID and location required');
        }

        const location = payload.location;
        await client.query(
          `INSERT INTO practice_locations (
            id, practice_id, name, address, city, state, zip, phone
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING`,
          [
            location.id,
            practiceId,
            location.name || 'Location',
            location.address || null,
            location.city || null,
            location.state || null,
            location.zip || null,
            location.phone || null,
          ]
        );
      } else if (request.type === 'practice_location_edit_request') {
        // Update location
        const practiceId = request.practice_id || payload.practiceId;
        if (!practiceId || !payload.locationId || !payload.updatedLocation) {
          throw new Error('Practice ID, location ID, and updated location required');
        }

        const location = payload.updatedLocation;
        await client.query(
          `UPDATE practice_locations 
           SET name = $1, address = $2, city = $3, state = $4, zip = $5, phone = $6
           WHERE id = $7 AND practice_id = $8`,
          [
            location.name || 'Location',
            location.address || null,
            location.city || null,
            location.state || null,
            location.zip || null,
            location.phone || null,
            payload.locationId,
            practiceId,
          ]
        );
      } else if (request.type === 'practice_location_remove_request') {
        // Remove location
        const practiceId = request.practice_id || payload.practiceId;
        if (!practiceId || !payload.locationId) {
          throw new Error('Practice ID and location ID required');
        }

        // Check if it's the last location
        const locationCount = await client.query(
          'SELECT COUNT(*) as count FROM practice_locations WHERE practice_id = $1',
          [practiceId]
        );
        if (parseInt(locationCount.rows[0].count) <= 1) {
          throw new Error('Cannot remove the last remaining location');
        }

        await client.query(
          'DELETE FROM practice_locations WHERE id = $1 AND practice_id = $2',
          [payload.locationId, practiceId]
        );
      } else if (request.type === 'practice_location_change_request') {
        // Bulk update locations
        const practiceId = request.practice_id;
        if (!practiceId || !payload.locations) {
          throw new Error('Practice ID and locations array required');
        }

        // Delete all existing locations
        await client.query('DELETE FROM practice_locations WHERE practice_id = $1', [practiceId]);

        // Insert new locations
        for (const location of payload.locations) {
          await client.query(
            `INSERT INTO practice_locations (
              id, practice_id, name, address, city, state, zip, phone
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              location.id,
              practiceId,
              location.name || 'Location',
              location.address || null,
              location.city || null,
              location.state || null,
              location.zip || null,
              location.phone || null,
            ]
          );
        }
      } else if (request.type === 'practice_insurance_services_change_request') {
        // Update insurance and/or services
        const practiceId = request.practice_id;
        if (!practiceId) {
          throw new Error('Practice ID required');
        }

        if (payload.insurance !== undefined) {
          await client.query('DELETE FROM practice_insurance WHERE practice_id = $1', [practiceId]);
          for (const insurance of payload.insurance) {
            const insuranceSlug = insurance.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await client.query(
              `INSERT INTO practice_insurance (practice_id, name, slug) 
               VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [practiceId, insurance.name, insuranceSlug]
            );
          }
        }

        if (payload.services !== undefined) {
          await client.query('DELETE FROM practice_services WHERE practice_id = $1', [practiceId]);
          for (const service of payload.services) {
            await client.query(
              'INSERT INTO practice_services (practice_id, service) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [practiceId, service]
            );
          }
        }
      } else if (request.type === 'practice_doctor_add_request') {
        // Add doctor to practice
        const practiceId = request.practice_id || payload.practiceId;
        const doctorEmail = payload.email || payload.doctorEmail || request.target_doctor_id;

        if (!practiceId || !doctorEmail) {
          throw new Error('Practice ID and doctor email required');
        }

        // Find doctor by email
        const doctorResult = await client.query(
          'SELECT id FROM doctors WHERE email = $1',
          [doctorEmail]
        );

        if (doctorResult.rows.length === 0) {
          throw new Error(`Doctor with email ${doctorEmail} not found`);
        }

        const doctorId = doctorResult.rows[0].id;

        // Check if doctor already belongs to a practice
        const existingPractice = await client.query(
          'SELECT practice_id FROM doctors WHERE id = $1 AND practice_id IS NOT NULL',
          [doctorId]
        );

        if (existingPractice.rows.length > 0 && existingPractice.rows[0].practice_id !== practiceId) {
          throw new Error(`Doctor already belongs to practice ${existingPractice.rows[0].practice_id}`);
        }

        // Update doctor's practice_id
        await client.query(
          'UPDATE doctors SET practice_id = $1, updated_at = NOW() WHERE id = $2',
          [practiceId, doctorId]
        );

        // Add practice role
        await client.query(
          `INSERT INTO practice_roles (id, practice_id, doctor_id, role)
           VALUES ($1, $2, $3, 'doctor')
           ON CONFLICT (practice_id, doctor_id) DO NOTHING`,
          [`pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, practiceId, doctorId]
        );

        // Update practice specialties
        const doctorSpecialtyResult = await client.query(
          'SELECT specialty FROM doctors WHERE id = $1',
          [doctorId]
        );
        if (doctorSpecialtyResult.rows.length > 0 && doctorSpecialtyResult.rows[0].specialty) {
          await client.query(
            `INSERT INTO practice_specialties (practice_id, specialty)
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [practiceId, doctorSpecialtyResult.rows[0].specialty]
          );
        }
      } else if (request.type === 'practice_doctor_remove_request') {
        // Remove doctor from practice
        const practiceId = request.practice_id || payload.practiceId;
        const doctorId = request.target_doctor_id || payload.doctorId;

        if (!practiceId || !doctorId) {
          throw new Error('Practice ID and doctor ID required');
        }

        // Check if doctor belongs to this practice
        const doctorCheck = await client.query(
          'SELECT practice_id FROM doctors WHERE id = $1',
          [doctorId]
        );

        if (doctorCheck.rows.length === 0) {
          throw new Error('Doctor not found');
        }

        if (doctorCheck.rows[0].practice_id !== practiceId) {
          throw new Error(`Doctor does not belong to practice ${practiceId}`);
        }

        // Check if removing last practice admin
        const practiceAdminCount = await client.query(
          `SELECT COUNT(*) as count FROM practice_roles 
           WHERE practice_id = $1 AND role = 'practice_admin'`,
          [practiceId]
        );

        const doctorRoleCheck = await client.query(
          `SELECT role FROM practice_roles 
           WHERE practice_id = $1 AND doctor_id = $2`,
          [practiceId, doctorId]
        );

        if (parseInt(practiceAdminCount.rows[0].count) === 1 && 
            doctorRoleCheck.rows.length > 0 && 
            doctorRoleCheck.rows[0].role === 'admin') {
          throw new Error('Cannot remove the last practice admin');
        }

        // Remove practice role
        await client.query(
          'DELETE FROM practice_roles WHERE practice_id = $1 AND doctor_id = $2',
          [practiceId, doctorId]
        );

        // Update doctor's practice_id to NULL
        await client.query(
          'UPDATE doctors SET practice_id = NULL, updated_at = NOW() WHERE id = $1',
          [doctorId]
        );
      }
}

/**
 * POST /api/approval-requests/:id/reject
 * Reject request (admin or practice admin)
 */
router.post('/:id/reject', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;
    const userRole = req.userRole;
    const userId = req.userId;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const requestResult = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [req.params.id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    const request = requestResult.rows[0];
    const historyId = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (userRole === 'admin') {
      await pool.query(
        `UPDATE approval_requests 
         SET admin_status = 'rejected', rejection_reason = $1, rejected_by = 'admin', admin_reviewed_at = NOW(), updated_at = NOW()
         WHERE id = $2`,
        [reason, req.params.id]
      );

      await pool.query(
        `INSERT INTO approval_history (
          id, approval_request_id, action, performed_by, performed_by_type, actor_id, actor_type, notes
        ) VALUES ($1, $2, 'rejected', $3, 'admin', $3, 'admin', $4)`,
        [historyId, req.params.id, userId, reason]
      );
    } else if (userRole === 'practice_admin') {
      const practiceAdminCheck = await pool.query(
        `SELECT practice_id FROM practice_roles 
         WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = $1) 
         AND role = 'practice_admin' AND practice_id = $2`,
        [userId, request.practice_id]
      );

      if (practiceAdminCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not authorized for this practice' });
      }

      await pool.query(
        `UPDATE approval_requests 
         SET practice_admin_status = 'rejected', rejection_reason = $1, rejected_by = 'practice_admin', practice_admin_reviewed_at = NOW(), updated_at = NOW()
         WHERE id = $2`,
        [reason, req.params.id]
      );

      await pool.query(
        `INSERT INTO approval_history (
          id, approval_request_id, action, performed_by, performed_by_type, actor_id, actor_type, notes
        ) VALUES ($1, $2, 'rejected', $3, 'practice_admin', $3, 'practice_admin', $4)`,
        [historyId, req.params.id, userId, reason]
      );
    } else {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [req.params.id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/approval-requests/admin/history
 * Get all approval history records (admin only)
 */
router.get('/admin/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT ah.*, 
              ar.type as request_type,
              ar.practice_id,
              ar.target_doctor_id,
              ar.payload,
              d.full_name as doctor_name,
              p.name as practice_name
       FROM approval_history ah
       LEFT JOIN approval_requests ar ON ah.approval_request_id = ar.id
       LEFT JOIN doctors d ON ar.target_doctor_id = d.id
       LEFT JOIN practices p ON ar.practice_id = p.id
       ORDER BY ah.created_at DESC
       LIMIT 1000`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching approval history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
