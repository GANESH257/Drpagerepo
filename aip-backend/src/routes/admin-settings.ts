import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

function requireAdmin(req: AuthRequest, res: express.Response): boolean {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return false;
  }
  return true;
}

router.use(authenticateToken);

/**
 * GET /api/admin/settings
 * Get all system settings as key-value object
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const result = await pool.query('SELECT key, value FROM system_settings');
    const settings: Record<string, string> = {};
    result.rows.forEach((r: { key: string; value: string }) => {
      settings[r.key] = r.value;
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/settings
 * Update system settings. Body: { key: value, ... } or { settings: { key: value } }
 */
router.put('/', async (req: AuthRequest, res) => {
  try {
    if (!requireAdmin(req, res)) return;
    const body = req.body || {};
    const settings = body.settings && typeof body.settings === 'object' ? body.settings : body;
    if (typeof settings !== 'object' || settings === null) {
      return res.status(400).json({ error: 'Invalid settings object' });
    }
    for (const [key, value] of Object.entries(settings)) {
      if (typeof key !== 'string') continue;
      await pool.query(
        `INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value != null ? String(value) : '']
      );
    }
    const result = await pool.query('SELECT key, value FROM system_settings');
    const out: Record<string, string> = {};
    result.rows.forEach((r: { key: string; value: string }) => { out[r.key] = r.value; });
    res.json(out);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
