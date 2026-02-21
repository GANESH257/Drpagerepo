import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/membership-plans
 * Get all active membership plans
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM membership_plans 
       WHERE active = true 
       ORDER BY monthly_price ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/membership-plans/:id
 * Get single membership plan
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching membership plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/membership-plans
 * Create new membership plan (admin only)
 */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      id,
      name,
      badge,
      monthly_price,
      annual_price,
      description,
      features,
      cta_label,
      cta_href,
      active = true,
    } = req.body;

    if (!id || !name || monthly_price === undefined || annual_price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure features is an array (JSONB expects array format)
    let featuresArray: any[] | null = null;
    if (features !== undefined && features !== null) {
      if (Array.isArray(features)) {
        featuresArray = features as any[];
      } else if (typeof features === 'string') {
        try {
          const parsed = JSON.parse(features);
          featuresArray = Array.isArray(parsed) ? (parsed as any[]) : ([] as any[]);
        } catch {
          featuresArray = [] as any[];
        }
      } else {
        featuresArray = [] as any[];
      }
    }

    const result = await pool.query(
      `INSERT INTO membership_plans (
        id, name, badge, monthly_price, annual_price, description, features, cta_label, cta_href, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [id, name, badge || null, monthly_price, annual_price, description || null, featuresArray, cta_label || null, cta_href || null, active]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating membership plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/membership-plans/:id
 * Update membership plan (admin only)
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      name,
      badge,
      monthly_price,
      annual_price,
      description,
      features,
      cta_label,
      cta_href,
      active,
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
    }
    if (badge !== undefined) {
      paramCount++;
      updates.push(`badge = $${paramCount}`);
      values.push(badge);
    }
    if (monthly_price !== undefined) {
      paramCount++;
      updates.push(`monthly_price = $${paramCount}`);
      values.push(monthly_price);
    }
    if (annual_price !== undefined) {
      paramCount++;
      updates.push(`annual_price = $${paramCount}`);
      values.push(annual_price);
    }
    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      values.push(description);
    }
    if (features !== undefined) {
      paramCount++;
      // Ensure features is an array (JSONB expects array format)
      let featuresArray: any[] | null = null;
      if (features !== null) {
        if (Array.isArray(features)) {
          featuresArray = features as any[];
        } else if (typeof features === 'string') {
          try {
            const parsed = JSON.parse(features);
            featuresArray = Array.isArray(parsed) ? (parsed as any[]) : ([] as any[]);
          } catch {
            featuresArray = [] as any[];
          }
        } else {
          featuresArray = [] as any[];
        }
      }
      updates.push(`features = $${paramCount}`);
      values.push(featuresArray);
    }
    if (cta_label !== undefined) {
      paramCount++;
      updates.push(`cta_label = $${paramCount}`);
      values.push(cta_label);
    }
    if (cta_href !== undefined) {
      paramCount++;
      updates.push(`cta_href = $${paramCount}`);
      values.push(cta_href);
    }
    if (active !== undefined) {
      paramCount++;
      updates.push(`active = $${paramCount}`);
      values.push(active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    updates.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE membership_plans 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating membership plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/membership-plans/:id
 * Delete membership plan (admin only) - soft delete by setting active=false
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `UPDATE membership_plans 
       SET active = false, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    res.json({ message: 'Membership plan deleted', plan: result.rows[0] });
  } catch (error) {
    console.error('Error deleting membership plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
