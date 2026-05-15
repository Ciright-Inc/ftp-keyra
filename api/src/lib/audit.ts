import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

export async function logAuditEvent(params: {
  userId?: string;
  eventType: string;
  entityType?: string;
  entityId?: string;
  countryCode?: string;
  bankId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  sessionId?: string;
  riskScore?: number;
  eventPayload?: Record<string, unknown>;
}) {
  return prisma.auditEvent.create({
    data: {
      userId: params.userId,
      eventType: params.eventType,
      entityType: params.entityType,
      entityId: params.entityId,
      countryCode: params.countryCode,
      bankId: params.bankId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      deviceId: params.deviceId,
      sessionId: params.sessionId,
      riskScore: params.riskScore,
      eventPayloadJson: params.eventPayload as Prisma.InputJsonValue | undefined,
    },
  });
}
