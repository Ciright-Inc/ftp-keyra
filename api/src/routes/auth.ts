import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { logAuditEvent } from '../lib/audit.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        fullName: parsed.data.fullName,
        emailVerified: false,
        phoneVerified: false,
        deviceTrustScore: 60,
        botRiskScore: 10,
        trustScore: 50,
      },
    });

    const sessionId = randomUUID();
    const token = signToken(
      {
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
      },
      sessionId
    );

    res.status(201).json({
      token,
      user: serializeUser(user),
      message: 'Account created. Complete verification to participate.',
    });
  } catch (err) {
    console.error('[POST /register]', err);
    return res.status(dbFailureStatus(err)).json(authErrorBody(err));
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!user?.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const sessionId = randomUUID();
    const authUser = {
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

    const token = signToken(authUser, sessionId);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    console.error('[POST /login]', err);
    return res.status(dbFailureStatus(err)).json(authErrorBody(err));
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: serializeUser(user) });
});

/** Dev/demo: mark verification flags (replace with KEYRA SSO in production) */
authRouter.post('/verify-demo', requireAuth, async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      emailVerified: true,
      phoneVerified: true,
      simVerified: true,
      deviceTrustScore: 85,
      botRiskScore: 5,
      trustScore: 90,
    },
  });
  await logAuditEvent({
    userId: user.id,
    eventType: 'USER_VERIFICATION_COMPLETED',
    entityType: 'user',
    entityId: user.id,
  });
  res.json({ user: serializeUser(user) });
});

function dbFailureStatus(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg.includes('Can\'t reach database server') ||
    msg.includes('P1001') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('ETIMEDOUT')
  ) {
    return 503;
  }
  return 500;
}

function authErrorBody(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  const dev = process.env.NODE_ENV !== 'production';
  return {
    error:
      dbFailureStatus(err) === 503
        ? 'Database unavailable — check PostgreSQL is running and DATABASE_URL in api/.env'
        : 'Server error during authentication',
    ...(dev ? { detail: message } : {}),
  };
}

function serializeUser(user: {
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
}) {
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
    canParticipate:
      user.emailVerified &&
      user.phoneVerified &&
      user.deviceTrustScore >= 50 &&
      user.botRiskScore <= 30,
  };
}
