import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  requireAuth,
  requireParticipationEligibility,
} from '../middleware/auth.js';
import { joinCampaign, CampaignError } from '../services/campaign.js';
import {
  filterMessage,
  buildDefaultMessage,
} from '../lib/message-filter.js';
import { sendBankEmail, markMessageSent, logEmailAudit } from '../services/email.js';
import { logAuditEvent } from '../lib/audit.js';
import { param } from '../lib/params.js';

export const campaignRouter = Router();

const joinLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many join attempts' },
});

const messageLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: { error: 'Daily message limit reached for this account' },
});

campaignRouter.post(
  '/join/:countryCode/:bankSlug',
  requireAuth,
  requireParticipationEligibility,
  joinLimiter,
  async (req, res) => {
    try {
      const result = await joinCampaign({
        user: req.user!,
        countryCode: param(req.params.countryCode),
        bankSlug: param(req.params.bankSlug),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        sessionId: req.sessionId,
      });

      res.status(201).json({
        message: 'Your verified position has been secured.',
        participantNumber: result.participant.participantNumber,
        bankName: result.bank.bankName,
        country: result.bank.countryCode.toUpperCase(),
        participant: result.participant,
      });
    } catch (err) {
      if (err instanceof CampaignError) {
        return res.status(err.statusCode).json({
          error: err.message,
          existing: err.existing,
        });
      }
      throw err;
    }
  }
);

campaignRouter.get('/my-participations', requireAuth, async (req, res) => {
  const participations = await prisma.campaignParticipant.findMany({
    where: { userId: req.user!.id },
    include: {
      bank: {
        select: {
          bankName: true,
          bankSlug: true,
          countryCode: true,
          logoUrl: true,
          bankAdoptionStatus: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ participations });
});

campaignRouter.get(
  '/message-template/:countryCode/:bankSlug',
  requireAuth,
  async (req, res) => {
    const bank = await prisma.bank.findFirst({
      where: {
        countryCode: param(req.params.countryCode).toLowerCase(),
        bankSlug: param(req.params.bankSlug).toLowerCase(),
      },
    });
    if (!bank) return res.status(404).json({ error: 'Bank not found' });

    const template = buildDefaultMessage(
      bank.bankName,
      req.user!.fullName,
      req.user!.email
    );
    res.json({
      to: bank.verifiedEmailStatus === 'verified' ? bank.primaryBankEmail : null,
      from: req.user!.email,
      cc: bank.customerServiceEmail,
      subject: template.subject,
      body: template.body,
      defaultTemplateVersion: '1.0',
    });
  }
);

const sendMessageSchema = z.object({
  subject: z.string().min(5).max(200),
  body: z.string().min(50).max(5000),
  ccEmails: z.array(z.string().email()).optional(),
});

campaignRouter.post(
  '/send-message/:countryCode/:bankSlug',
  requireAuth,
  requireParticipationEligibility,
  messageLimiter,
  async (req, res) => {
    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const countryCode = param(req.params.countryCode).toLowerCase();
    const bankSlug = param(req.params.bankSlug).toLowerCase();

    const bank = await prisma.bank.findFirst({
      where: { countryCode, bankSlug },
    });
    if (!bank) return res.status(404).json({ error: 'Bank not found' });

    if (bank.verifiedEmailStatus !== 'verified' || !bank.primaryBankEmail) {
      return res.status(400).json({ error: 'Bank destination email not verified' });
    }

    const participant = await prisma.campaignParticipant.findUnique({
      where: { userId_bankId: { userId: req.user!.id, bankId: bank.id } },
    });
    if (!participant) {
      return res.status(403).json({
        error: 'You must join the campaign before sending a message',
      });
    }

    const defaultTpl = buildDefaultMessage(
      bank.bankName,
      req.user!.fullName,
      req.user!.email
    );
    const filter = filterMessage(parsed.data.subject, parsed.data.body);
    if (!filter.ok) {
      await logAuditEvent({
        userId: req.user!.id,
        eventType: 'BOT_RISK_BLOCKED',
        entityType: 'bank_message',
        countryCode,
        bankId: bank.id,
        eventPayload: { reasons: filter.reasons },
      });
      return res.status(400).json({ error: 'Message blocked', reasons: filter.reasons });
    }

    const userModified =
      parsed.data.subject !== defaultTpl.subject ||
      parsed.data.body !== defaultTpl.body;

    if (userModified) {
      await logAuditEvent({
        userId: req.user!.id,
        eventType: 'MESSAGE_EDITED',
        entityType: 'bank',
        entityId: bank.id,
        countryCode,
        bankId: bank.id,
      });
    }

    const message = await prisma.bankMessage.create({
      data: {
        userId: req.user!.id,
        participantId: participant.id,
        bankId: bank.id,
        countryCode,
        bankSlug,
        fromUserEmail: req.user!.email,
        fromUserName: req.user!.fullName,
        toBankEmail: bank.primaryBankEmail,
        ccEmails: parsed.data.ccEmails ?? [],
        bccInternalAuditEmail: process.env.INTERNAL_AUDIT_EMAIL ?? 'audit@keyra.ie',
        subject: filter.sanitizedSubject,
        messageBody: filter.sanitizedBody,
        userModifiedMessage: userModified,
        defaultTemplateVersion: '1.0',
        messageStatus: 'pending',
        emailVerifiedBeforeSend: req.user!.emailVerified,
        sessionSignature: req.sessionId,
        deviceSignature: req.headers['x-device-id'] as string | undefined,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        botRiskScore: req.user!.botRiskScore,
        abuseFilterStatus: 'passed',
      },
    });

    const delivery = await sendBankEmail({
      to: bank.primaryBankEmail,
      cc: parsed.data.ccEmails,
      bcc: process.env.INTERNAL_AUDIT_EMAIL,
      subject: filter.sanitizedSubject,
      body: filter.sanitizedBody,
      from: req.user!.email,
      fromName: req.user!.fullName,
      messageId: message.id,
    });

    await markMessageSent(message.id, delivery.deliveryId);
    await logEmailAudit(req.user!.id, message.id, bank.id, countryCode);

    await prisma.campaignParticipant.update({
      where: { id: participant.id },
      data: {
        messageSentCount: { increment: 1 },
        lastMessageSentAt: new Date(),
      },
    });

    await prisma.bank.update({
      where: { id: bank.id },
      data: { messageCount: { increment: 1 } },
    });

    res.status(201).json({
      message: 'This request is authenticated, logged, and auditable.',
      bankMessage: message,
      delivery,
    });
  }
);

campaignRouter.get('/my-messages', requireAuth, async (req, res) => {
  const messages = await prisma.bankMessage.findMany({
    where: { userId: req.user!.id },
    include: {
      bank: { select: { bankName: true, bankSlug: true, countryCode: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ messages });
});

campaignRouter.get('/dashboard', requireAuth, async (req, res) => {
  const [participations, messages, auditEvents] = await Promise.all([
    prisma.campaignParticipant.findMany({
      where: { userId: req.user!.id },
      include: {
        bank: {
          select: {
            bankName: true,
            bankSlug: true,
            countryCode: true,
            bankAdoptionStatus: true,
            logoUrl: true,
          },
        },
      },
    }),
    prisma.bankMessage.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.auditEvent.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);

  res.json({
    user: req.user,
    participations,
    messages,
    activityLog: auditEvents,
  });
});
