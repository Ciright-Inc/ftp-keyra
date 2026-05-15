import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { calculateBankEconomics } from '../lib/economics.js';
import { logAuditEvent } from '../lib/audit.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/countries', async (_req, res) => {
  try {
    const countries = await prisma.country.findMany({ orderBy: { countryName: 'asc' } });
    res.json({ countries: countries.map(serializeCountry) });
  } catch (e) {
    console.error('[GET /admin/countries]', e);
    res.status(500).json({ error: 'Failed to load countries' });
  }
});

const countrySchema = z.object({
  countryCode: z.string().length(2),
  countryName: z.string(),
  region: z.string().optional(),
  continent: z.string().optional(),
  currencyCode: z.string().optional(),
  primaryLanguage: z.string().optional(),
  flagUrl: z.string().optional(),
  status: z.string().optional(),
});

adminRouter.post('/countries', async (req, res) => {
  const parsed = countrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const country = await prisma.country.create({
    data: {
      countryCode: parsed.data.countryCode.toLowerCase(),
      countryName: parsed.data.countryName,
      region: parsed.data.region,
      continent: parsed.data.continent,
      currencyCode: parsed.data.currencyCode,
      primaryLanguage: parsed.data.primaryLanguage,
      flagUrl: parsed.data.flagUrl,
      status: parsed.data.status ?? 'active',
    },
  });
  res.status(201).json({ country: serializeCountry(country) });
});

adminRouter.patch('/countries/:id', async (req, res) => {
  const country = await prisma.country.update({
    where: { id: req.params.id },
    data: req.body,
  });
  await logAuditEvent({
    userId: req.user!.id,
    eventType: 'ADMIN_COUNTRY_UPDATED',
    entityType: 'country',
    entityId: country.id,
  });
  res.json({ country: serializeCountry(country) });
});

adminRouter.get('/banks', async (req, res) => {
  try {
    const countryCode = req.query.country as string | undefined;
    const banks = await prisma.bank.findMany({
      where: countryCode ? { countryCode: countryCode.toLowerCase() } : {},
      include: { country: true },
      orderBy: { bankName: 'asc' },
    });
    res.json({ banks: banks.map(serializeBankWithCountry) });
  } catch (e) {
    console.error('[GET /admin/banks]', e);
    res.status(500).json({ error: 'Failed to load banks' });
  }
});

const bankSchema = z.object({
  countryId: z.string().uuid(),
  countryCode: z.string(),
  bankName: z.string(),
  bankSlug: z.string(),
  legalName: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryBankEmail: z.string().email().optional(),
  verifiedEmailStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  bankAdoptionStatus: z.string().optional(),
  estimatedDigitalUsers: z.number().optional(),
  monthlyAuthPerUser: z.number().optional(),
  maxSpots: z.number().optional(),
});

adminRouter.post('/banks', async (req, res) => {
  const parsed = bankSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const economics = calculateBankEconomics({
    estimatedDigitalUsers: parsed.data.estimatedDigitalUsers ?? 0,
    monthlyAuthPerUser: parsed.data.monthlyAuthPerUser ?? 45,
    authenticationFeeAssumption: 0.001,
    keyraRevenueSharePercent: 0.4,
    communityShareOfKeyraPercent: 0.1,
  });

  const bank = await prisma.bank.create({
    data: {
      countryId: parsed.data.countryId,
      countryCode: parsed.data.countryCode.toLowerCase(),
      bankName: parsed.data.bankName,
      bankSlug: parsed.data.bankSlug.toLowerCase(),
      legalName: parsed.data.legalName,
      logoUrl: parsed.data.logoUrl,
      primaryBankEmail: parsed.data.primaryBankEmail,
      verifiedEmailStatus: parsed.data.verifiedEmailStatus ?? 'pending',
      bankAdoptionStatus: parsed.data.bankAdoptionStatus ?? 'not_started',
      estimatedDigitalUsers: BigInt(parsed.data.estimatedDigitalUsers ?? 0),
      monthlyAuthPerUser: parsed.data.monthlyAuthPerUser ?? 45,
      maxSpots: parsed.data.maxSpots ?? 10000,
      remainingSpots: parsed.data.maxSpots ?? 10000,
      ...economics,
    },
  });

  await prisma.country.update({
    where: { id: parsed.data.countryId },
    data: { bankCount: { increment: 1 } },
  });

  res.status(201).json({ bank: serializeBank(bank as unknown as Record<string, unknown>) });
});

adminRouter.patch('/banks/:id', async (req, res) => {
  const existing = await prisma.bank.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Bank not found' });

  const data = { ...req.body };
  if (data.estimatedDigitalUsers != null) {
    data.estimatedDigitalUsers = BigInt(data.estimatedDigitalUsers);
    const economics = calculateBankEconomics({
      estimatedDigitalUsers: data.estimatedDigitalUsers,
      monthlyAuthPerUser: data.monthlyAuthPerUser ?? existing.monthlyAuthPerUser,
      authenticationFeeAssumption:
        data.authenticationFeeAssumption ?? existing.authenticationFeeAssumption,
      keyraRevenueSharePercent:
        data.keyraRevenueSharePercent ?? existing.keyraRevenueSharePercent,
      communityShareOfKeyraPercent:
        data.communityShareOfKeyraPercent ?? existing.communityShareOfKeyraPercent,
    });
    Object.assign(data, economics);
  }

  if (data.primaryBankEmail && data.verifiedEmailStatus === 'verified') {
    await logAuditEvent({
      userId: req.user!.id,
      eventType: 'BANK_EMAIL_UPDATED',
      entityType: 'bank',
      entityId: req.params.id,
    });
  }

  const bank = await prisma.bank.update({ where: { id: req.params.id }, data });
  await logAuditEvent({
    userId: req.user!.id,
    eventType: 'ADMIN_BANK_RECORD_UPDATED',
    entityType: 'bank',
    entityId: bank.id,
  });
  res.json({ bank: serializeBank(bank as unknown as Record<string, unknown>) });
});

adminRouter.get('/participants', async (req, res) => {
  const bankId = req.query.bankId as string | undefined;
  const participants = await prisma.campaignParticipant.findMany({
    where: bankId ? { bankId } : {},
    include: {
      user: { select: { email: true, fullName: true } },
      bank: {
        select: {
          bankName: true,
          bankSlug: true,
          countryCode: true,
        },
      },
    },
    orderBy: { participantNumber: 'asc' },
    take: 100,
  });
  res.json({ participants });
});

adminRouter.get('/messages', async (req, res) => {
  const messages = await prisma.bankMessage.findMany({
    include: { bank: { select: { bankName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ messages });
});

adminRouter.get('/templates', async (_req, res) => {
  const templates = await prisma.messageTemplate.findMany();
  res.json({ templates });
});

adminRouter.get('/audit', async (req, res) => {
  const events = await prisma.auditEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json({ events });
});

adminRouter.get('/security', async (_req, res) => {
  const blocked = await prisma.auditEvent.findMany({
    where: {
      eventType: {
        in: ['BOT_RISK_BLOCKED', 'DUPLICATE_ATTEMPT_BLOCKED'],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  const highRiskMessages = await prisma.bankMessage.findMany({
    where: { abuseFilterStatus: { not: 'passed' } },
    take: 50,
  });
  res.json({ blocked, highRiskMessages });
});

function serializeCountry<C extends { authenticationProjection?: bigint | null }>(c: C) {
  return {
    ...c,
    authenticationProjection:
      c.authenticationProjection != null ? c.authenticationProjection.toString() : null,
  };
}

function serializeBank(bank: Record<string, unknown>) {
  const { country: _nested, ...rest } = bank as Record<string, unknown> & {
    country?: unknown;
  };
  return {
    ...rest,
    estimatedCustomers: bigStr(bank.estimatedCustomers),
    estimatedDigitalUsers: bigStr(bank.estimatedDigitalUsers),
    annualAuthProjection: bigStr(bank.annualAuthProjection),
  };
}

function bigStr(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'bigint') return v.toString();
  return String(v);
}

function serializeBankWithCountry(bank: {
  country: {
    authenticationProjection?: bigint | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}) {
  const { country, ...rest } = bank;
  return {
    ...serializeBank(rest as Record<string, unknown>),
    country: serializeCountry(country as { authenticationProjection?: bigint | null }),
  };
}
