import { prisma } from '../lib/prisma.js';
import { logAuditEvent } from '../lib/audit.js';
import type { AuthUser } from '../middleware/auth.js';

export async function joinCampaign(params: {
  user: AuthUser;
  countryCode: string;
  bankSlug: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  sessionId?: string;
}) {
  const { user, countryCode, bankSlug } = params;
  const bank = await prisma.bank.findFirst({
    where: { countryCode: countryCode.toLowerCase(), bankSlug: bankSlug.toLowerCase() },
    include: { country: true },
  });

  if (!bank) {
    throw new CampaignError('Bank not found', 404);
  }

  const existing = await prisma.campaignParticipant.findUnique({
    where: { userId_bankId: { userId: user.id, bankId: bank.id } },
  });
  if (existing) {
    await logAuditEvent({
      userId: user.id,
      eventType: 'DUPLICATE_ATTEMPT_BLOCKED',
      entityType: 'campaign_participant',
      entityId: existing.id,
      countryCode,
      bankId: bank.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    throw new CampaignError('You already hold a position for this bank', 409, existing);
  }

  if (bank.remainingSpots <= 0) {
    throw new CampaignError('No spots remaining for this campaign', 400);
  }

  return prisma.$transaction(async (tx) => {
    const decremented = await tx.bank.updateMany({
      where: { id: bank.id, remainingSpots: { gt: 0 } },
      data: {
        remainingSpots: { decrement: 1 },
        participantCount: { increment: 1 },
      },
    });

    if (decremented.count === 0) {
      throw new CampaignError('No spots remaining for this campaign', 400);
    }

    const updatedBank = await tx.bank.findUniqueOrThrow({ where: { id: bank.id } });
    const participantNumber = updatedBank.participantCount;

    let globalNumber = 1;
    const counter = await tx.globalCounter.upsert({
      where: { name: 'global_participants' },
      create: { name: 'global_participants', value: 1 },
      update: { value: { increment: 1 } },
    });
    globalNumber = counter.value;

    const participant = await tx.campaignParticipant.create({
      data: {
        userId: user.id,
        countryCode: countryCode.toLowerCase(),
        bankId: bank.id,
        bankSlug: bank.bankSlug,
        participantNumber,
        globalParticipantNumber: globalNumber,
        positionLocked: true,
        positionLockedAt: new Date(),
        participationStatus: 'active',
        trustScore: user.trustScore,
        identityVerified: true,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        simVerified: user.simVerified,
        deviceVerified: user.deviceTrustScore >= 50,
        botRiskScore: user.botRiskScore,
      },
    });

    const pressureScore = Math.min(
      100,
      (updatedBank.participantCount / updatedBank.maxSpots) * 100 +
        updatedBank.messageCount * 0.1
    );

    await tx.bank.update({
      where: { id: bank.id },
      data: { pressureScore },
    });

    await tx.country.update({
      where: { id: bank.countryId },
      data: { participantCount: { increment: 1 } },
    });

    await logAuditEvent({
      userId: user.id,
      eventType: 'USER_JOINED_CAMPAIGN',
      entityType: 'campaign_participant',
      entityId: participant.id,
      countryCode,
      bankId: bank.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceId: params.deviceId,
      sessionId: params.sessionId,
    });

    await logAuditEvent({
      userId: user.id,
      eventType: 'POSITION_RESERVED',
      entityType: 'campaign_participant',
      entityId: participant.id,
      countryCode,
      bankId: bank.id,
      eventPayload: { participantNumber },
    });

    return {
      participant,
      bank: {
        ...bank,
        remainingSpots: updatedBank.remainingSpots,
        participantCount: updatedBank.participantCount,
        pressureScore,
      },
    };
  });
}

export class CampaignError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public existing?: unknown
  ) {
    super(message);
    this.name = 'CampaignError';
  }
}
