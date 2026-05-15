export interface BankEconomicsInput {
  estimatedDigitalUsers: bigint | number | null;
  monthlyAuthPerUser: number;
  authenticationFeeAssumption: number;
  keyraRevenueSharePercent: number;
  communityShareOfKeyraPercent: number;
}

export interface BankEconomicsResult {
  annualAuthProjection: bigint;
  estimatedAnnualUtilityRevenue: number;
  estimatedAnnualKeyraRevenue: number;
  estimatedAnnualCommunityPool: number;
}

export function calculateBankEconomics(input: BankEconomicsInput): BankEconomicsResult {
  const digitalUsers = Number(input.estimatedDigitalUsers ?? 0);
  const annualAuthProjection = BigInt(
    Math.floor(digitalUsers * input.monthlyAuthPerUser * 12)
  );
  const estimatedAnnualUtilityRevenue =
    Number(annualAuthProjection) * input.authenticationFeeAssumption;
  const estimatedAnnualKeyraRevenue =
    estimatedAnnualUtilityRevenue * input.keyraRevenueSharePercent;
  const estimatedAnnualCommunityPool =
    estimatedAnnualKeyraRevenue * input.communityShareOfKeyraPercent;

  return {
    annualAuthProjection,
    estimatedAnnualUtilityRevenue,
    estimatedAnnualKeyraRevenue,
    estimatedAnnualCommunityPool,
  };
}
