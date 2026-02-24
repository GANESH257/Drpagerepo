import express from 'express';
import { pool } from '../db/connection';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/messages/unread-count
 * Count unread messages for current user (messages in their threads sent by others, read = false)
 */
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res) => {
  try {
    let doctorId: string | null = req.doctorId ?? null;
    if (!doctorId) {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [req.userId]
      );
      if (doctorResult.rows.length === 0) return res.json({ count: 0 });
      doctorId = doctorResult.rows[0].id;
    }
    const result = await pool.query(
      `SELECT COUNT(m.id)::int as count
       FROM messages m
       INNER JOIN thread_participants tp ON tp.thread_id = m.thread_id AND tp.participant_id = $1 AND tp.participant_type = 'doctor'
       WHERE m.sender_id != $1 AND (m.read = false OR m.read IS NULL)`,
      [doctorId]
    );
    res.json({ count: result.rows[0]?.count || 0 });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/messages/threads
 * Get all message threads for authenticated user
 */
router.get('/threads', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    // Prefer doctor ID from JWT (set at login); fallback to lookup by user_id
    let doctorId: string | null = req.doctorId ?? null;
    if (!doctorId && userId) {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      if (doctorResult.rows.length === 0) {
        return res.json([]);
      }
      doctorId = doctorResult.rows[0].id;
    }
    if (!doctorId || typeof doctorId !== 'string') {
      return res.json([]);
    }

    // Get threads where user is a participant
    const result = await pool.query(
      `SELECT DISTINCT t.id, t.type, t.practice_id, t.created_at, t.updated_at,
              COUNT(DISTINCT m.id)::int as message_count,
              MAX(m.created_at) as last_message_at
       FROM message_threads t
       INNER JOIN thread_participants tp ON t.id = tp.thread_id
       LEFT JOIN messages m ON t.id = m.thread_id
       WHERE tp.participant_id = $1 AND tp.participant_type = 'doctor'
       GROUP BY t.id, t.type, t.practice_id, t.created_at, t.updated_at
       ORDER BY last_message_at DESC NULLS LAST, t.created_at DESC`,
      [doctorId]
    );

    const threads = Array.isArray(result.rows) ? result.rows : [];
    if (threads.length === 0 && process.env.NODE_ENV !== 'production') {
      console.log('[messages] GET /threads: no threads for doctorId=', doctorId);
    }
    // Help debug: response header shows which doctorId was used (check in Network tab)
    res.setHeader('X-Doctor-Id', doctorId);
    res.setHeader('X-Thread-Count', String(threads.length));

    const withParticipants = await Promise.all(
      threads.map(async (row: any) => {
        const partResult = await pool.query(
          `SELECT tp.participant_id as id, d.full_name
           FROM thread_participants tp
           LEFT JOIN doctors d ON tp.participant_id = d.id AND tp.participant_type = 'doctor'
           WHERE tp.thread_id = $1 AND tp.participant_id != $2`,
          [row.id, doctorId]
        );
        const participants = Array.isArray(partResult.rows) ? partResult.rows : [];
        return {
          id: row.id,
          type: row.type ?? 'direct',
          practice_id: row.practice_id ?? null,
          created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
          updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
          message_count: row.message_count ?? 0,
          last_message_at: row.last_message_at instanceof Date ? row.last_message_at.toISOString() : (row.last_message_at ?? null),
          participants: participants.map((p: any) => ({
            id: p.id,
            full_name: p.full_name ?? p.id ?? 'Unknown',
          })),
        };
      })
    );

    res.json(withParticipants);
  } catch (error: any) {
    console.error('Error fetching message threads:', error?.message ?? error);
    if (error?.stack) console.error(error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/messages/threads/:threadId
 * Get thread with all messages
 */
router.get('/threads/:threadId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { threadId } = req.params;
    let doctorId: string | null = req.doctorId ?? null;
    if (!doctorId) {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [req.userId]
      );
      if (doctorResult.rows.length === 0) return res.status(403).json({ error: 'Unauthorized' });
      doctorId = doctorResult.rows[0].id;
    }

    const participantCheck = await pool.query(
      'SELECT * FROM thread_participants WHERE thread_id = $1 AND participant_id = $2 AND participant_type = $3',
      [threadId, doctorId, 'doctor']
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get thread
    const threadResult = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1',
      [threadId]
    );

    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Get messages
    const messagesResult = await pool.query(
      `SELECT m.*
       FROM messages m
       WHERE m.thread_id = $1
       ORDER BY m.created_at ASC`,
      [threadId]
    );

    // Get participants
    const participantsResult = await pool.query(
      `SELECT tp.*, 
              CASE 
                WHEN tp.participant_type = 'doctor' THEN d.full_name
                ELSE tp.participant_id
              END as participant_name
       FROM thread_participants tp
       LEFT JOIN doctors d ON tp.participant_id = d.id AND tp.participant_type = 'doctor'
       WHERE tp.thread_id = $1`,
      [threadId]
    );

    res.json({
      ...threadResult.rows[0],
      messages: messagesResult.rows,
      participants: participantsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/messages/threads
 * Create new message thread
 */
router.post('/threads', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type = 'direct', practice_id, participant_ids, initial_message } = req.body;

    if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
      return res.status(400).json({ error: 'At least one participant required' });
    }

    let creatorId: string | null = req.doctorId ?? null;
    if (!creatorId) {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [req.userId]
      );
      if (doctorResult.rows.length === 0) return res.status(403).json({ error: 'Doctor profile not found' });
      creatorId = doctorResult.rows[0].id;
    }
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create thread
    await pool.query(
      'INSERT INTO message_threads (id, type, practice_id) VALUES ($1, $2, $3)',
      [threadId, type, practice_id || null]
    );

    // Add participants (including creator)
    const allParticipants = [...new Set([creatorId, ...participant_ids])];
    for (const participantId of allParticipants) {
      await pool.query(
        'INSERT INTO thread_participants (thread_id, participant_id, participant_type) VALUES ($1, $2, $3)',
        [threadId, participantId, 'doctor']
      );
    }

    // Add initial message if provided
    if (initial_message) {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const doctorResult = await pool.query(
        'SELECT full_name FROM doctors WHERE id = $1',
        [creatorId]
      );
      const senderName = doctorResult.rows[0]?.full_name || 'Unknown';
      
      await pool.query(
        'INSERT INTO messages (id, thread_id, sender_id, sender_type, sender_name, content) VALUES ($1, $2, $3, $4, $5, $6)',
        [messageId, threadId, creatorId, 'doctor', senderName, initial_message]
      );
    }

    // Return thread with messages
    const threadResult = await pool.query(
      'SELECT * FROM message_threads WHERE id = $1',
      [threadId]
    );

    res.status(201).json(threadResult.rows[0]);
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/messages
 * Send message in thread
 */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { thread_id, content } = req.body;

    if (!thread_id || !content) {
      return res.status(400).json({ error: 'Thread ID and content required' });
    }

    let senderId: string | null = req.doctorId ?? null;
    if (!senderId) {
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1 LIMIT 1',
        [req.userId]
      );
      if (doctorResult.rows.length === 0) return res.status(403).json({ error: 'Doctor profile not found' });
      senderId = doctorResult.rows[0].id;
    }

    // Verify user is participant
    const participantCheck = await pool.query(
      'SELECT * FROM thread_participants WHERE thread_id = $1 AND participant_id = $2 AND participant_type = $3',
      [thread_id, senderId, 'doctor']
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a participant in this thread' });
    }

    // Get sender name
    const senderNameResult = await pool.query(
      'SELECT full_name FROM doctors WHERE id = $1',
      [senderId]
    );
    const senderName = senderNameResult.rows[0]?.full_name || 'Unknown';

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(
      'INSERT INTO messages (id, thread_id, sender_id, sender_type, sender_name, content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [messageId, thread_id, senderId, 'doctor', senderName, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
