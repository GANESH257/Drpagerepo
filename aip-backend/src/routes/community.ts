import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

const ALLOWED_POST_ROLES = ['admin', 'doctor', 'practice_admin'];

function makeId(prefix: string): string {
  return prefix + '-' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

/**
 * GET /api/community/sections
 * Returns General + all departments (for specialty sections). No auth required for read.
 */
router.get('/sections', async (_req, res) => {
  try {
    const sections: { id: string; name: string }[] = [{ id: 'general', name: 'General' }];
    try {
      const result = await pool.query(
        `SELECT slug, name FROM departments ORDER BY name ASC`
      );
      result.rows.forEach((r: any) => {
        if (r.slug && r.name) sections.push({ id: r.slug, name: r.name });
      });
    } catch (deptErr) {
      console.warn('Departments table not available, sections = General only:', deptErr);
    }
    res.json(sections);
  } catch (error) {
    console.error('Error fetching community sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/community/posts?section=general&page=1&limit=20
 * List posts (questions) for a section. No auth required for read.
 */
router.get('/posts', async (req, res) => {
  try {
    const { section = 'general', page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const result = await pool.query(
      `SELECT id, section, author_type, author_id, author_display_name, title, body, created_at, updated_at
       FROM community_posts
       WHERE section = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [section, limitNum, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM community_posts WHERE section = $1`,
      [section]
    );
    const total = parseInt(countResult.rows[0].total, 10);

    res.json({
      posts: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/community/posts
 * Create a post (question). Auth required; doctor, practice_admin, or admin.
 */
router.post('/posts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    if (!userRole || !ALLOWED_POST_ROLES.includes(userRole)) {
      return res.status(403).json({ error: 'Only doctors and admins can create posts' });
    }

    const { section, title, body } = req.body;
    if (!section || !title || !body) {
      return res.status(400).json({ error: 'section, title, and body are required' });
    }

    let authorType: string;
    let authorId: string;
    let authorDisplayName: string;

    if (userRole === 'admin') {
      authorType = 'admin';
      authorId = req.userId || 'admin';
      authorDisplayName = 'Admin';
    } else {
      authorType = 'doctor';
      authorId = req.doctorId || req.userId || '';
      const docResult = await pool.query(
        'SELECT full_name FROM doctors WHERE id = $1',
        [authorId]
      );
      authorDisplayName = docResult.rows[0]?.full_name || 'Physician';
    }

    const id = makeId('cpost');
    await pool.query(
      `INSERT INTO community_posts (id, section, author_type, author_id, author_display_name, title, body)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, section, authorType, authorId, authorDisplayName, title.trim(), body.trim()]
    );

    const row = await pool.query('SELECT * FROM community_posts WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/community/posts/:id
 * Single post with comments. No auth required for read.
 */
router.get('/posts/:id', async (req, res) => {
  try {
    const postResult = await pool.query(
      'SELECT * FROM community_posts WHERE id = $1',
      [req.params.id]
    );
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentsResult = await pool.query(
      `SELECT id, post_id, author_type, author_id, author_display_name, body, created_at, updated_at
       FROM community_comments
       WHERE post_id = $1
       ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({
      ...postResult.rows[0],
      comments: commentsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching community post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/community/posts/:id/comments
 * Add a comment (answer). Auth required; doctor, practice_admin, or admin.
 */
router.post('/posts/:id/comments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    if (!userRole || !ALLOWED_POST_ROLES.includes(userRole)) {
      return res.status(403).json({ error: 'Only doctors and admins can comment' });
    }

    const postId = req.params.id;
    const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const { body } = req.body;
    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ error: 'body is required' });
    }

    let authorType: string;
    let authorId: string;
    let authorDisplayName: string;

    if (userRole === 'admin') {
      authorType = 'admin';
      authorId = req.userId || 'admin';
      authorDisplayName = 'Admin';
    } else {
      authorType = 'doctor';
      authorId = req.doctorId || req.userId || '';
      const docResult = await pool.query(
        'SELECT full_name FROM doctors WHERE id = $1',
        [authorId]
      );
      authorDisplayName = docResult.rows[0]?.full_name || 'Physician';
    }

    const id = makeId('ccomm');
    await pool.query(
      `INSERT INTO community_comments (id, post_id, author_type, author_id, author_display_name, body)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, postId, authorType, authorId, authorDisplayName, body.trim()]
    );

    const row = await pool.query('SELECT * FROM community_comments WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error creating community comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/community/posts/:id/report
 * Report a post (doctor, practice_admin). Admin can also report.
 */
router.post('/posts/:id/report', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.userRole;
    if (!userRole || !ALLOWED_POST_ROLES.includes(userRole)) {
      return res.status(403).json({ error: 'Only doctors and admins can report posts' });
    }
    const postId = req.params.id;
    const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    const doctorId = req.doctorId;
    if (!doctorId) return res.status(400).json({ error: 'Only doctors can report posts' });
    const { reason } = req.body || {};
    const id = makeId('cprep');
    await pool.query(
      `INSERT INTO community_post_reports (id, post_id, reported_by_doctor_id, reason, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [id, postId, doctorId, reason || null]
    );
    const row = await pool.query('SELECT * FROM community_post_reports WHERE id = $1', [id]);
    res.status(201).json(row.rows[0]);
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/community/posts/:id - Delete post (admin only)
 */
router.delete('/posts/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const result = await pool.query('DELETE FROM community_posts WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/community/comments/:id - Delete comment (admin only)
 */
router.delete('/comments/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const result = await pool.query('DELETE FROM community_comments WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
