import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  doctorId?: string;
}

interface JwtPayload {
  userId?: string;
  user_id?: string;
  role?: string;
  doctorId?: string | null;
  doctor_id?: string | null;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.userId = decoded.userId ?? decoded.user_id;
    req.userRole = decoded.role;
    req.doctorId = decoded.doctorId ?? decoded.doctor_id ?? undefined;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
