import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

const BLOCKED_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:text\/html/i,
];

const SPAM_PHRASES = [
  'guaranteed earnings',
  'passive income',
  'crypto rewards',
  'investment yield',
  'click here now',
  'act now',
  'limited time offer',
];

const ABUSE_WORDS = ['spam', 'blast your bank', 'spam your bank'];

export interface MessageFilterResult {
  ok: boolean;
  sanitizedSubject: string;
  sanitizedBody: string;
  reasons: string[];
}

export function filterMessage(
  subject: string,
  body: string,
  maxLength = 5000
): MessageFilterResult {
  const reasons: string[] = [];

  if (subject.length > 200) reasons.push('Subject too long');
  if (body.length > maxLength) reasons.push('Message too long');
  if (body.length < 50) reasons.push('Message too short');

  const combined = `${subject} ${body}`.toLowerCase();
  for (const phrase of SPAM_PHRASES) {
    if (combined.includes(phrase)) reasons.push(`Blocked phrase: ${phrase}`);
  }
  for (const word of ABUSE_WORDS) {
    if (combined.includes(word)) reasons.push(`Abusive content detected`);
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(subject) || pattern.test(body)) {
      reasons.push('Malicious content blocked');
      break;
    }
  }

  const urlRegex = /https?:\/\/[^\s]+/gi;
  const urls = body.match(urlRegex) ?? [];
  for (const url of urls) {
    if (!validator.isURL(url, { require_protocol: true })) {
      reasons.push('Invalid URL detected');
    }
    if (/bit\.ly|tinyurl|t\.co/i.test(url)) {
      reasons.push('Shortened URLs not permitted');
    }
  }

  const sanitizedSubject = sanitizeHtml(subject, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();

  const sanitizedBody = sanitizeHtml(body, {
    allowedTags: ['p', 'br', 'strong', 'em'],
    allowedAttributes: {},
  }).trim();

  return {
    ok: reasons.length === 0,
    sanitizedSubject,
    sanitizedBody,
    reasons,
  };
}

export function buildDefaultMessage(
  bankName: string,
  customerName: string,
  customerEmail: string
): { subject: string; body: string } {
  return {
    subject: 'Request for Modern Banking Authentication Security',
    body: `Dear ${bankName},

As a customer, I am requesting stronger digital banking security protections through hardware-rooted authentication infrastructure.

I would like ${bankName} to review modern authentication technologies designed to reduce phishing, OTP interception, SIM-swap fraud, password compromise, and account takeover risk.

Please review KEYRA's secure authentication framework and consider implementing hardware-rooted, carrier-backed authentication protections for your customers.

Thank you for your time and consideration.

Sincerely,

${customerName}
${customerEmail}`,
  };
}
