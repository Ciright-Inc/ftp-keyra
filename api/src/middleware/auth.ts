import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  simVerified: boolean;
  deviceTrustScore: number;
  botRiskScore: number;
  trustScore: number;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export function signToken(user: AuthUser, sessionId: string): string {
  return jwt.sign(
    { sub: user.id, sessionId, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as {
      sub: string;
      sessionId: string;
    };
    req.sessionId = payload.sessionId;
    prisma.user
      .findUnique({ where: { id: payload.sub } })
      .then((user) => {
        if (user) {
          req.user = mapUser(user);
        }
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as {
      sub: string;
      sessionId: string;
    };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'Invalid session' });

    req.user = mapUser(user);
    req.sessionId = payload.sessionId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireParticipationEligibility(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Authentication required' });

  const issues: string[] = [];
  if (!user.emailVerified) issues.push('email_not_verified');
  if (!user.phoneVerified) issues.push('phone_not_verified');
  if (user.deviceTrustScore < 50) issues.push('device_trust_low');
  if (user.botRiskScore > 30) issues.push('bot_risk_high');

  if (issues.length > 0) {
    return res.status(403).json({
      error: 'Participation requires full KEYRA verification',
      issues,
      message: 'Sign in with KEYRA to participate securely.',
    });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function mapUser(user: {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  simVerified: boolean;
  deviceTrustScore: number;
  botRiskScore: number;
  trustScore: number;
  isAdmin: boolean;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    simVerified: user.simVerified,
    deviceTrustScore: user.deviceTrustScore,
    botRiskScore: user.botRiskScore,
    trustScore: user.trustScore,
    isAdmin: user.isAdmin,
  };
}
