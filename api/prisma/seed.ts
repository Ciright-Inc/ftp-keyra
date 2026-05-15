import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateBankEconomics } from '../src/lib/economics.js';

const prisma = new PrismaClient();

const banksSeed = [
  { country: 'us', name: 'Chase', slug: 'chase', digital: 60_000_000 },
  { country: 'us', name: 'Bank of America', slug: 'bankofamerica', digital: 55_000_000 },
  { country: 'us', name: 'Wells Fargo', slug: 'wellsfargo', digital: 50_000_000 },
  { country: 'ca', name: 'RBC', slug: 'rbc', digital: 12_000_000 },
  { country: 'uk', name: 'Barclays', slug: 'barclays', digital: 18_000_000 },
  { country: 'in', name: 'HDFC Bank', slug: 'hdfc', digital: 40_000_000 },
];

async function main() {
  const adminHash = await bcrypt.hash('KeyraAdmin2026!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@keyra.ie' },
    update: { isAdmin: true, emailVerified: true, phoneVerified: true },
    create: {
      email: 'admin@keyra.ie',
      passwordHash: adminHash,
      fullName: 'KEYRA Admin',
      isAdmin: true,
      emailVerified: true,
      phoneVerified: true,
      simVerified: true,
      deviceTrustScore: 100,
      botRiskScore: 0,
      trustScore: 100,
    },
  });

  const demoHash = await bcrypt.hash('DemoUser2026!', 12);
  await prisma.user.upsert({
    where: { email: 'demo@keyra.ie' },
    update: { emailVerified: true, phoneVerified: true },
    create: {
      email: 'demo@keyra.ie',
      passwordHash: demoHash,
      fullName: 'Demo User',
      emailVerified: true,
      phoneVerified: true,
      simVerified: true,
      deviceTrustScore: 90,
      botRiskScore: 5,
      trustScore: 85,
    },
  });

  const countries = [
    { code: 'us', name: 'United States', region: 'North America', continent: 'Americas', currency: 'USD', flag: 'https://flagcdn.com/w80/us.png' },
    { code: 'ca', name: 'Canada', region: 'North America', continent: 'Americas', currency: 'CAD', flag: 'https://flagcdn.com/w80/ca.png' },
    { code: 'uk', name: 'United Kingdom', region: 'Europe', continent: 'Europe', currency: 'GBP', flag: 'https://flagcdn.com/w80/gb.png' },
    { code: 'in', name: 'India', region: 'South Asia', continent: 'Asia', currency: 'INR', flag: 'https://flagcdn.com/w80/in.png' },
  ];

  for (const c of countries) {
    const country = await prisma.country.upsert({
      where: { countryCode: c.code },
      update: {},
      create: {
        countryCode: c.code,
        countryName: c.name,
        region: c.region,
        continent: c.continent,
        currencyCode: c.currency,
        primaryLanguage: 'en',
        flagUrl: c.flag,
        status: 'active',
      },
    });

    const countryBanks = banksSeed.filter((b) => b.country === c.code);
    for (const b of countryBanks) {
      const economics = calculateBankEconomics({
        estimatedDigitalUsers: b.digital,
        monthlyAuthPerUser: 45,
        authenticationFeeAssumption: 0.001,
        keyraRevenueSharePercent: 0.4,
        communityShareOfKeyraPercent: 0.1,
      });

      await prisma.bank.upsert({
        where: {
          countryCode_bankSlug: { countryCode: c.code, bankSlug: b.slug },
        },
        update: {},
        create: {
          countryId: country.id,
          countryCode: c.code,
          bankName: b.name,
          bankSlug: b.slug,
          legalName: `${b.name} (Demo)`,
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=1a1a1a&color=fff&size=128`,
          estimatedDigitalUsers: BigInt(b.digital),
          monthlyAuthPerUser: 45,
          primaryBankEmail: `security@${b.slug}.bank.demo`,
          securityEmail: `security@${b.slug}.bank.demo`,
          verifiedEmailStatus: 'verified',
          bankAdoptionStatus: 'community_building',
          maxSpots: 10000,
          remainingSpots: 10000,
          ...economics,
        },
      });
    }

    const count = await prisma.bank.count({ where: { countryId: country.id } });
    await prisma.country.update({
      where: { id: country.id },
      data: { bankCount: count },
    });
  }

  await prisma.messageTemplate.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      templateName: 'default_auth_request',
      languageCode: 'en',
      subject: 'Request for Modern Banking Authentication Security',
      body: 'Default hardware-rooted authentication request template.',
      active: true,
      version: '1.0',
      legalReviewStatus: 'approved',
    },
  });

  await prisma.globalCounter.upsert({
    where: { name: 'global_participants' },
    update: {},
    create: { name: 'global_participants', value: 0 },
  });

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
