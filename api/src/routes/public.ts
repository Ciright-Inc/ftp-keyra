import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { optionalAuth } from '../middleware/auth.js';
import { logAuditEvent } from '../lib/audit.js';
import { param } from '../lib/params.js';

export const publicRouter = Router();

publicRouter.get('/countries', async (_req, res) => {
  const countries = await prisma.country.findMany({
    where: { status: 'active' },
    orderBy: { countryName: 'asc' },
  });
  res.json({
    countries: countries.map((c) => ({
      ...c,
      authenticationProjection:
        c.authenticationProjection != null ? c.authenticationProjection.toString() : null,
    })),
  });
});

publicRouter.get('/countries/:countryCode', async (req, res) => {
  const country = await prisma.country.findUnique({
    where: { countryCode: param(req.params.countryCode).toLowerCase() },
    include: {
      banks: {
        orderBy: { bankName: 'asc' },
        select: {
          id: true,
          bankName: true,
          bankSlug: true,
          logoUrl: true,
          bankAdoptionStatus: true,
          participantCount: true,
          remainingSpots: true,
          maxSpots: true,
          pressureScore: true,
        },
      },
    },
  });
  if (!country) return res.status(404).json({ error: 'Country not found' });
  const { authenticationProjection, ...rest } = country;
  res.json({
    country: {
      ...rest,
      authenticationProjection:
        authenticationProjection != null ? authenticationProjection.toString() : null,
    },
  });
});

publicRouter.get('/banks/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const countryCode = req.query.country
    ? String(req.query.country).toLowerCase()
    : undefined;

  const banks = await prisma.bank.findMany({
    where: {
      ...(countryCode ? { countryCode } : {}),
      ...(q
        ? {
            OR: [
              { bankName: { contains: q, mode: 'insensitive' } },
              { bankSlug: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    take: 20,
    orderBy: { bankName: 'asc' },
    select: {
      id: true,
      bankName: true,
      bankSlug: true,
      countryCode: true,
      country: { select: { countryName: true, flagUrl: true } },
    },
  });
  res.json({ banks });
});

publicRouter.get(
  '/banks/:countryCode/:bankSlug',
  optionalAuth,
  async (req, res) => {
    const countryCode = param(req.params.countryCode).toLowerCase();
    const bankSlug = param(req.params.bankSlug).toLowerCase();

    const bank = await prisma.bank.findFirst({
      where: { countryCode, bankSlug },
      include: { country: true },
    });

    if (!bank) return res.status(404).json({ error: 'Bank not found' });

    await logAuditEvent({
      userId: req.user?.id,
      eventType: 'USER_VIEWED_BANK_PAGE',
      entityType: 'bank',
      entityId: bank.id,
      countryCode,
      bankId: bank.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    let myParticipation = null;
    if (req.user) {
      myParticipation = await prisma.campaignParticipant.findUnique({
        where: { userId_bankId: { userId: req.user.id, bankId: bank.id } },
      });
    }

    const publicBank = {
      id: bank.id,
      countryCode: bank.countryCode,
      bankName: bank.bankName,
      bankSlug: bank.bankSlug,
      logoUrl: bank.logoUrl,
      websiteUrl: bank.websiteUrl,
      bankAdoptionStatus: bank.bankAdoptionStatus,
      verifiedEmailStatus: bank.verifiedEmailStatus,
      primaryBankEmail:
        bank.verifiedEmailStatus === 'verified' ? bank.primaryBankEmail : null,
      participantCount: bank.participantCount,
      remainingSpots: bank.remainingSpots,
      maxSpots: bank.maxSpots,
      messageCount: bank.messageCount,
      pressureScore: bank.pressureScore,
      annualAuthProjection: bank.annualAuthProjection?.toString(),
      estimatedAnnualCommunityPool: bank.estimatedAnnualCommunityPool,
      estimatedAnnualUtilityRevenue: bank.estimatedAnnualUtilityRevenue,
      trustModernizationScore: bank.trustModernizationScore,
      country: {
        countryName: bank.country.countryName,
        flagUrl: bank.country.flagUrl,
      },
    };

    res.json({
      bank: publicBank,
      authenticated: !!req.user,
      canParticipate: req.user
        ? req.user.emailVerified &&
          req.user.phoneVerified &&
          req.user.deviceTrustScore >= 50 &&
          req.user.botRiskScore <= 30
        : false,
      myParticipation,
    });
  }
);

publicRouter.get('/stats/global', async (_req, res) => {
  const [countries, banks, participants, messages] = await Promise.all([
    prisma.country.count({ where: { status: 'active' } }),
    prisma.bank.count(),
    prisma.campaignParticipant.count(),
    prisma.bankMessage.count({ where: { messageStatus: 'sent' } }),
  ]);

  const pressureAgg = await prisma.bank.aggregate({
    _avg: { pressureScore: true },
  });

  res.json({
    countriesActive: countries,
    banksActive: banks,
    totalVerifiedUsers: participants,
    totalMessagesSent: messages,
    totalPositionsReserved: participants,
    globalPressureIndex: pressureAgg._avg.pressureScore ?? 0,
  });
});
