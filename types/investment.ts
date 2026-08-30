export type InvestmentScenarioKey = "conservative" | "expected" | "optimistic";

export type InvestmentAssumptionStatus = "demo-placeholder" | "advisor-estimate" | "verified-project-data";

export type InvestmentScenarioAssumptions = {
  label: string;
  annualRentAed: number;
  occupancyPct: number;
  annualAppreciationPct: number;
  annualRentGrowthPct: number;
  annualExpenseGrowthPct: number;
};

export type InvestmentProfile = {
  status: InvestmentAssumptionStatus;
  reviewedAt?: string;
  defaultUnitSizeSqft: number;
  acquisition: {
    transferRegistrationFeePct: number;
    trusteeAdminFeeAed: number;
    agencyFeePct: number;
    furnishingEstimateAed: number;
    otherOneTimeCostsAed: number;
    handoverAdditionalCostsAed: number;
  };
  operations: {
    serviceChargePerSqftAed: number;
    managementFeePct: number;
    maintenanceReservePct: number;
    otherAnnualCostsAed: number;
  };
  financing: {
    downPaymentPct: number;
    annualInterestRatePct: number;
    termYears: number;
    mortgageRegistrationFeePct: number;
    mortgageRegistrationAdminFeeAed: number;
  };
  exit: {
    sellingCostPct: number;
    defaultHoldYears: number;
  };
  scenarios: Record<InvestmentScenarioKey, InvestmentScenarioAssumptions>;
  notes: string[];
};

export type InvestmentInputs = {
  purchasePriceAed: number;
  unitSizeSqft: number;
  annualRentAed: number;
  occupancyPct: number;
  transferRegistrationFeePct: number;
  trusteeAdminFeeAed: number;
  agencyFeePct: number;
  furnishingEstimateAed: number;
  otherOneTimeCostsAed: number;
  handoverAdditionalCostsAed: number;
  serviceChargePerSqftAed: number;
  managementFeePct: number;
  maintenanceReservePct: number;
  otherAnnualCostsAed: number;
  annualAppreciationPct: number;
  annualRentGrowthPct: number;
  annualExpenseGrowthPct: number;
  sellingCostPct: number;
  holdYears: number;
  useMortgage: boolean;
  downPaymentPct: number;
  annualInterestRatePct: number;
  mortgageTermYears: number;
  mortgageRegistrationFeePct: number;
  mortgageRegistrationAdminFeeAed: number;
};

export type InvestmentYearProjection = {
  year: number;
  propertyValueAed: number;
  scheduledRentAed: number;
  collectedRentAed: number;
  operatingCostsAed: number;
  netOperatingIncomeAed: number;
  debtServiceAed: number;
  netCashFlowAed: number;
  remainingLoanBalanceAed: number;
};

export type InvestmentResult = {
  purchasePriceAed: number;
  loanAmountAed: number;
  downPaymentAed: number;
  transferRegistrationFeeAed: number;
  trusteeAdminFeeAed: number;
  agencyFeeAed: number;
  furnishingEstimateAed: number;
  otherOneTimeCostsAed: number;
  handoverAdditionalCostsAed: number;
  mortgageRegistrationCostAed: number;
  totalAcquisitionCostsAed: number;
  allInAcquisitionCostAed: number;
  initialCashRequiredAed: number;
  scheduledRentYear1Aed: number;
  collectedRentYear1Aed: number;
  serviceChargeYear1Aed: number;
  operatingCostsYear1Aed: number;
  netOperatingIncomeYear1Aed: number;
  monthlyMortgagePaymentAed: number;
  annualDebtServiceYear1Aed: number;
  netAnnualCashFlowYear1Aed: number;
  grossYieldPct: number;
  effectiveGrossYieldPct: number;
  netYieldPct: number;
  cashOnCashPct: number;
  breakEvenAnnualRentAed: number;
  futurePropertyValueAed: number;
  exitSellingCostsAed: number;
  remainingLoanBalanceAtExitAed: number;
  equityAtHorizonAed: number;
  netSaleProceedsAed: number;
  cumulativeNetCashFlowAed: number;
  holdOutcomeValueAed: number;
  sellOutcomeValueAed: number;
  totalProfitAed: number;
  totalRoiPct: number;
  equityMultiple: number;
  annualizedReturnPct: number;
  years: InvestmentYearProjection[];
};

export type PaymentScheduleBucket = "initial" | "pre-handover" | "handover" | "post-handover" | "unclassified";

export type PaymentScheduleItem = {
  label: string;
  timing: string;
  percentage: number;
  amountAed: number;
  note?: string;
  bucket: PaymentScheduleBucket;
};

export type PaymentScheduleSummary = {
  totalPct: number;
  totalAed: number;
  initialAed: number;
  preHandoverAed: number;
  handoverAed: number;
  postHandoverAed: number;
  unclassifiedAed: number;
  cashThroughHandoverAed: number;
};
