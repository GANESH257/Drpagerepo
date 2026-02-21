import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/join-requests
 * Get all join requests (approval requests with types: new_practice_with_admin_doctor, doctor_join_practice)
 * Returns in AdminJoinRequest format
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    // Only admins can view join requests
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Query approval_requests for join request types
    const result = await pool.query(
      `SELECT * FROM approval_requests 
       WHERE type IN ('new_practice_with_admin_doctor', 'doctor_join_practice')
       ORDER BY created_at DESC`
    );

    // Transform to AdminJoinRequest format
    const joinRequests = result.rows.map((req) => {
      const payload = typeof req.payload === 'string' ? JSON.parse(req.payload) : req.payload;
      const doctor = payload.doctor || {};
      const practice = payload.practice || {};
      const plan = payload.plan || { planId: 'basic', billingCycle: 'monthly' };
      const paymentMethod = payload.paymentMethod || 'paypal';

      // Map admin_status to JoinRequest status
      let status: 'submitted' | 'under_review' | 'approved' | 'rejected' = 'submitted';
      if (req.admin_status === 'approved') {
        status = 'approved';
      } else if (req.admin_status === 'rejected') {
        status = 'rejected';
      } else if (req.admin_status === 'pending' && req.admin_notes) {
        status = 'under_review';
      }

      // Determine practice selection
      let practiceSelection;
      if (req.type === 'doctor_join_practice' && req.practice_id) {
        practiceSelection = {
          type: 'existing' as const,
          practiceId: req.practice_id,
        };
      } else if (req.type === 'new_practice_with_admin_doctor') {
        practiceSelection = {
          type: 'new' as const,
          practiceName: practice.name || '',
          website: practice.website,
        };
      }

      return {
        id: req.id,
        submittedAt: req.created_at,
        status,
        applicant: {
          email: doctor.email || req.requested_by,
          fullName: doctor.fullName || '',
          credentials: doctor.credentials || '',
          specialty: doctor.specialty || '',
          phone: doctor.phone || '',
          city: practice.address?.city || doctor.locations?.[0]?.city || '',
          state: practice.address?.state || doctor.locations?.[0]?.state || '',
          practiceName: practice.name,
          website: practice.website,
          messageToAdmin: payload.messageToAdmin,
          practiceSelection,
        },
        plan: {
          planId: plan.planId || 'basic',
          billingCycle: plan.billingCycle || 'monthly',
        },
        paymentMethod: paymentMethod as 'paypal' | 'card',
        paymentDetails: payload.paymentDetails,
        // AdminJoinRequest extensions
        decidedAt: req.admin_reviewed_at || undefined,
        decidedBy: req.admin_notes ? 'admin' : undefined,
        notes: req.admin_notes || undefined,
        rejectionReason: req.rejection_reason || undefined,
      };
    });

    res.json(joinRequests);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/join-requests/:id
 * Get single join request
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT * FROM approval_requests 
       WHERE id = $1 AND type IN ('new_practice_with_admin_doctor', 'doctor_join_practice')`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    const reqData = result.rows[0];
    const payload = typeof reqData.payload === 'string' ? JSON.parse(reqData.payload) : reqData.payload;
    const doctor = payload.doctor || {};
    const practice = payload.practice || {};
    const plan = payload.plan || { planId: 'basic', billingCycle: 'monthly' };
    const paymentMethod = payload.paymentMethod || 'paypal';

    let status: 'submitted' | 'under_review' | 'approved' | 'rejected' = 'submitted';
    if (reqData.admin_status === 'approved') {
      status = 'approved';
    } else if (reqData.admin_status === 'rejected') {
      status = 'rejected';
    } else if (reqData.admin_status === 'pending' && reqData.admin_notes) {
      status = 'under_review';
    }

    let practiceSelection;
    if (reqData.type === 'doctor_join_practice' && reqData.practice_id) {
      practiceSelection = {
        type: 'existing' as const,
        practiceId: reqData.practice_id,
      };
    } else if (reqData.type === 'new_practice_with_admin_doctor') {
      practiceSelection = {
        type: 'new' as const,
        practiceName: practice.name || '',
        website: practice.website,
      };
    }

    res.json({
      id: reqData.id,
      submittedAt: reqData.created_at,
      status,
      applicant: {
        email: doctor.email || reqData.requested_by,
        fullName: doctor.fullName || '',
        credentials: doctor.credentials || '',
        specialty: doctor.specialty || '',
        phone: doctor.phone || '',
        city: practice.address?.city || doctor.locations?.[0]?.city || '',
        state: practice.address?.state || doctor.locations?.[0]?.state || '',
        practiceName: practice.name,
        website: practice.website,
        messageToAdmin: payload.messageToAdmin,
        practiceSelection,
      },
      plan: {
        planId: plan.planId || 'basic',
        billingCycle: plan.billingCycle || 'monthly',
      },
      paymentMethod: paymentMethod as 'paypal' | 'card',
      paymentDetails: payload.paymentDetails,
      decidedAt: reqData.admin_reviewed_at || undefined,
      decidedBy: reqData.admin_notes ? 'admin' : undefined,
      notes: reqData.admin_notes || undefined,
      rejectionReason: reqData.rejection_reason || undefined,
    });
  } catch (error) {
    console.error('Error fetching join request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/join-requests/:id
 * Update join request status (maps to approval request)
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status, notes } = req.body;

    // Map JoinRequest status to approval_request admin_status
    let adminStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    if (status === 'approved') {
      adminStatus = 'approved';
    } else if (status === 'rejected') {
      adminStatus = 'rejected';
    } else if (status === 'under_review' || status === 'submitted') {
      adminStatus = 'pending';
    }

    // Do not overwrite an already approved/rejected request with pending
    const current = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1 AND type IN (\'new_practice_with_admin_doctor\', \'doctor_join_practice\')',
      [req.params.id]
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }
    const existing = current.rows[0];
    if (adminStatus === 'pending' && (existing.admin_status === 'approved' || existing.admin_status === 'rejected')) {
      return res.json({ ...existing, admin_notes: notes ?? existing.admin_notes });
    }

    const result = await pool.query(
      `UPDATE approval_requests 
       SET admin_status = $1, admin_notes = $2, updated_at = NOW()
       ${adminStatus === 'approved' ? ', admin_reviewed_at = NOW()' : ''}
       WHERE id = $3 AND type IN ('new_practice_with_admin_doctor', 'doctor_join_practice')
       RETURNING *`,
      [adminStatus, notes || null, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating join request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/join-requests/:id/approve
 * Approve join request (uses approval-requests approve endpoint logic)
 */
router.post('/:id/approve', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { notes } = req.body;
    const userId = req.userId;
    const historyId = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update approval request
    await pool.query(
      `UPDATE approval_requests 
       SET admin_status = 'approved', admin_notes = $1, admin_reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [notes || null, req.params.id]
    );

    // Add to approval history (matching approval-requests.ts format)
    await pool.query(
      `INSERT INTO approval_history (
        id, approval_request_id, action, performed_by, performed_by_type, notes
      ) VALUES ($1, $2, 'approved', $3, 'admin', $4)`,
      [historyId, req.params.id, userId, notes || null]
    );

    const updated = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [req.params.id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error approving join request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/join-requests/:id/reject
 * Reject join request (uses approval-requests reject endpoint logic)
 */
router.post('/:id/reject', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const userId = req.userId;
    const historyId = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update approval request
    await pool.query(
      `UPDATE approval_requests 
       SET admin_status = 'rejected', rejection_reason = $1, rejected_by = 'admin', admin_reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [reason, req.params.id]
    );

    // Add to approval history (matching approval-requests.ts format)
    await pool.query(
      `INSERT INTO approval_history (
        id, approval_request_id, action, performed_by, performed_by_type, notes
      ) VALUES ($1, $2, 'rejected', $3, 'admin', $4)`,
      [historyId, req.params.id, userId, reason]
    );

    const updated = await pool.query(
      'SELECT * FROM approval_requests WHERE id = $1',
      [req.params.id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error rejecting join request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
