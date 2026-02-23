import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

function makeId(prefix: string): string {
  return prefix + '-' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

function requireAdmin(req: AuthRequest, res: express.Response): boolean {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return false;
  }
  return true;
}

/**
 * GET /api/committees
 * List all committees with members (name, role, doctor info)
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const committeesResult = await pool.query(
      `SELECT id, name, slug, description, sort_order
       FROM committees
       ORDER BY sort_order ASC, name ASC`
    );

    const committees = committeesResult.rows;
    const withMembers = await Promise.all(
      committees.map(async (c: any) => {
        const membersResult = await pool.query(
          `SELECT cm.id, cm.role, cm.sort_order,
                  d.id as doctor_id, d.full_name, d.slug as doctor_slug, d.specialty, d.profile_image_url
           FROM committee_members cm
           JOIN doctors d ON d.id = cm.doctor_id
           WHERE cm.committee_id = $1
           ORDER BY cm.sort_order ASC, d.full_name ASC`,
          [c.id]
        );
        return { ...c, members: membersResult.rows };
      })
    );

    res.json(withMembers);
  } catch (error) {
    console.error('Error fetching committees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/committees - Create committee (admin only) */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, slug, description, sort_order } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug required' });
    }
    const id = makeId('comm');
    await pool.query(
      `INSERT INTO committees (id, name, slug, description, sort_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, slug, description || null, sort_order != null ? Number(sort_order) : 0]
    );
    const row = await pool.query('SELECT * FROM committees WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error creating committee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** GET /api/committees/:id - Get one committee with members */
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const cResult = await pool.query('SELECT * FROM committees WHERE id = $1', [req.params.id]);
    if (cResult.rows.length === 0) return res.status(404).json({ error: 'Committee not found' });
    const membersResult = await pool.query(
      `SELECT cm.id, cm.role, cm.sort_order, d.id as doctor_id, d.full_name, d.slug as doctor_slug, d.specialty, d.profile_image_url
       FROM committee_members cm JOIN doctors d ON d.id = cm.doctor_id
       WHERE cm.committee_id = $1 ORDER BY cm.sort_order ASC, d.full_name ASC`,
      [req.params.id]
    );
    res.json({ ...cResult.rows[0], members: membersResult.rows });
  } catch (error) {
    console.error('Error fetching committee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** PUT /api/committees/:id - Update committee (admin only) */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { name, slug, description, sort_order } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
    if (slug !== undefined) { updates.push(`slug = $${i++}`); values.push(slug); }
    if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }
    if (sort_order !== undefined) { updates.push(`sort_order = $${i++}`); values.push(Number(sort_order)); }
    if (updates.length === 0) {
      const r = await pool.query('SELECT * FROM committees WHERE id = $1', [req.params.id]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Committee not found' });
      return res.json(r.rows[0]);
    }
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE committees SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Committee not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating committee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** DELETE /api/committees/:id - Delete committee (admin only) */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query('DELETE FROM committees WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Committee not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting committee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** POST /api/committees/:id/members - Add member (admin only) */
router.post('/:id/members', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const committeeId = req.params.id;
    const { doctor_id, role, sort_order } = req.body;
    if (!doctor_id) return res.status(400).json({ error: 'doctor_id required' });
    const exist = await pool.query('SELECT id FROM committees WHERE id = $1', [committeeId]);
    if (exist.rows.length === 0) return res.status(404).json({ error: 'Committee not found' });
    const memberId = makeId('cm');
    await pool.query(
      `INSERT INTO committee_members (id, committee_id, doctor_id, role, sort_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [memberId, committeeId, doctor_id, role || null, sort_order != null ? Number(sort_order) : 0]
    );
    const row = await pool.query(
      `SELECT cm.id, cm.role, cm.sort_order, d.id as doctor_id, d.full_name, d.slug as doctor_slug, d.specialty, d.profile_image_url
       FROM committee_members cm JOIN doctors d ON d.id = cm.doctor_id WHERE cm.id = $1`,
      [memberId]
    );
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error adding committee member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** PUT /api/committees/:id/members/:memberId - Update member (admin only) */
router.put('/:id/members/:memberId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { memberId } = req.params;
    const { role, sort_order } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (role !== undefined) { updates.push(`role = $${i++}`); values.push(role); }
    if (sort_order !== undefined) { updates.push(`sort_order = $${i++}`); values.push(Number(sort_order)); }
    if (updates.length === 0) {
      const r = await pool.query('SELECT * FROM committee_members WHERE id = $1', [memberId]);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
      return res.json(r.rows[0]);
    }
    values.push(memberId);
    const result = await pool.query(
      `UPDATE committee_members SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating committee member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** DELETE /api/committees/:id/members/:memberId - Remove member (admin only) */
router.delete('/:id/members/:memberId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query('DELETE FROM committee_members WHERE id = $1 RETURNING id', [req.params.memberId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error removing committee member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
