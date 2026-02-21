import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/policies
 * Get all organization policies
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM org_policies ORDER BY category, title ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/policies/:id
 * Get single policy
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM org_policies WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/policies
 * Create new policy (admin only)
 */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { id, category, title, body } = req.body;

    if (!id || !category || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO org_policies (id, category, title, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, category, title, body]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/policies/:id
 * Update policy (admin only)
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { category, title, body } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (category !== undefined) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      values.push(category);
    }
    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (body !== undefined) {
      paramCount++;
      updates.push(`body = $${paramCount}`);
      values.push(body);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE org_policies 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/policies/:id
 * Delete policy (admin only)
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'DELETE FROM org_policies WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({ message: 'Policy deleted', policy: result.rows[0] });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
