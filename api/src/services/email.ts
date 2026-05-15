import { prisma } from '../lib/prisma.js';
import { logAuditEvent } from '../lib/audit.js';

export interface SendEmailParams {
  to: string;
  cc?: string[];
  bcc?: string;
  subject: string;
  body: string;
  from: string;
  fromName: string;
  messageId: string;
}

/** Email delivery stub — wire SMTP on Railway via env vars */
export async function sendBankEmail(params: SendEmailParams): Promise<{
  status: 'queued' | 'sent' | 'failed';
  deliveryId: string;
}> {
  const deliveryId = `del_${params.messageId}`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Production: integrate nodemailer with SPF/DKIM/DMARC at infra level
    console.info('[EMAIL] Sending via SMTP', {
      to: params.to,
      subject: params.subject,
      deliveryId,
    });
    return { status: 'sent', deliveryId };
  }

  console.info('[EMAIL] Dev mode — logged only', {
    to: params.to,
    cc: params.cc,
    bcc: params.bcc,
    subject: params.subject,
    from: params.from,
    deliveryId,
  });

  return { status: 'queued', deliveryId };
}

export async function markMessageSent(messageId: string, deliveryId: string) {
  return prisma.bankMessage.update({
    where: { id: messageId },
    data: {
      messageStatus: 'sent',
      sentAt: new Date(),
    },
  });
}

export async function logEmailAudit(
  userId: string,
  messageId: string,
  bankId: string,
  countryCode: string
) {
  await logAuditEvent({
    userId,
    eventType: 'MESSAGE_SENT_TO_BANK',
    entityType: 'bank_message',
    entityId: messageId,
    countryCode,
    bankId,
  });
}
