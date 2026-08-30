import type { PaymentMilestone } from "@/types/real-estate";
import type {
  InvestmentInputs,
  InvestmentProfile,
  InvestmentResult,
  InvestmentScenarioKey,
  PaymentScheduleBucket,
  PaymentScheduleItem,
  PaymentScheduleSummary,
} from "@/types/investment";

const ZERO = 0;

function finite(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, finite(value, min)));
}

function money(value: number) {
  return Math.max(0, finite(value));
}

function percentage(value: number, max = 100) {
  return clamp(value, 0, max);
}

export function getScenarioInputs(
  profile: InvestmentProfile,
  scenarioKey: InvestmentScenarioKey,
  purchasePriceAed: number,
  unitSizeSqft?: number | null,
): InvestmentInputs {
  const scenario = profile.scenarios[scenarioKey];

  return {
    purchasePriceAed: money(purchasePriceAed),
    unitSizeSqft: money(unitSizeSqft ?? profile.defaultUnitSizeSqft),
    annualRentAed: money(scenario.annualRentAed),
    occupancyPct: percentage(scenario.occupancyPct),
    transferRegistrationFeePct: percentage(profile.acquisition.transferRegistrationFeePct),
    trusteeAdminFeeAed: money(profile.acquisition.trusteeAdminFeeAed),
    agencyFeePct: percentage(profile.acquisition.agencyFeePct),
    furnishingEstimateAed: money(profile.acquisition.furnishingEstimateAed),
    otherOneTimeCostsAed: money(profile.acquisition.otherOneTimeCostsAed),
    handoverAdditionalCostsAed: money(profile.acquisition.handoverAdditionalCostsAed),
    serviceChargePerSqftAed: money(profile.operations.serviceChargePerSqftAed),
    managementFeePct: percentage(profile.operations.managementFeePct),
    maintenanceReservePct: percentage(profile.operations.maintenanceReservePct),
    otherAnnualCostsAed: money(profile.operations.otherAnnualCostsAed),
    annualAppreciationPct: clamp(scenario.annualAppreciationPct, -20, 30),
    annualRentGrowthPct: clamp(scenario.annualRentGrowthPct, -20, 30),
    annualExpenseGrowthPct: clamp(scenario.annualExpenseGrowthPct, -20, 30),
    sellingCostPct: percentage(profile.exit.sellingCostPct),
    holdYears: clamp(Math.round(profile.exit.defaultHoldYears), 1, 30),
    useMortgage: false,
    downPaymentPct: percentage(profile.financing.downPaymentPct),
    annualInterestRatePct: percentage(profile.financing.annualInterestRatePct, 30),
    mortgageTermYears: clamp(Math.round(profile.financing.termYears), 1, 35),
    mortgageRegistrationFeePct: percentage(profile.financing.mortgageRegistrationFeePct),
    mortgageRegistrationAdminFeeAed: money(profile.financing.mortgageRegistrationAdminFeeAed),
  };
}

/**
 * Applies a mechanical downside stress, not a forecast:
 * - scheduled rent -10%
 * - occupancy -10 percentage points
 * - appreciation capped at 0%
 * - rent growth capped at 0%
 * - expense growth +2 percentage points
 */
export function applyMechanicalStressTest(inputs: InvestmentInputs): InvestmentInputs {
  return {
    ...inputs,
    annualRentAed: money(inputs.annualRentAed * 0.9),
    occupancyPct: clamp(inputs.occupancyPct - 10, 0, 100),
    annualAppreciationPct: Math.min(0, clamp(inputs.annualAppreciationPct, -20, 30)),
    annualRentGrowthPct: Math.min(0, clamp(inputs.annualRentGrowthPct, -20, 30)),
    annualExpenseGrowthPct: clamp(inputs.annualExpenseGrowthPct + 2, -20, 30),
  };
}

export function calculateMonthlyMortgagePayment(
  loanAmountAed: number,
  annualInterestRatePct: number,
  termYears: number,
) {
  const principal = money(loanAmountAed);
  const months = Math.max(1, Math.round(clamp(termYears, 1, 35) * 12));
  const monthlyRate = percentage(annualInterestRatePct, 30) / 100 / 12;

  if (principal === 0) return ZERO;
  if (monthlyRate === 0) return principal / months;

  const factor = (1 + monthlyRate) ** months;
  return principal * ((monthlyRate * factor) / (factor - 1));
}

export function getRemainingLoanBalance(
  loanAmountAed: number,
  annualInterestRatePct: number,
  termYears: number,
  monthsPaid: number,
) {
  const principal = money(loanAmountAed);
  const totalMonths = Math.max(1, Math.round(clamp(termYears, 1, 35) * 12));
  const paidMonths = clamp(Math.round(monthsPaid), 0, totalMonths);

  if (principal === 0 || paidMonths >= totalMonths) return ZERO;

  const monthlyRate = percentage(annualInterestRatePct, 30) / 100 / 12;
  if (monthlyRate === 0) {
    return principal * (1 - paidMonths / totalMonths);
  }

  const payment = calculateMonthlyMortgagePayment(principal, annualInterestRatePct, termYears);
  const factor = (1 + monthlyRate) ** paidMonths;
  const balance = principal * factor - payment * ((factor - 1) / monthlyRate);
  return Math.max(0, finite(balance));
}

export function calculateInvestment(raw: InvestmentInputs): InvestmentResult {
  const purchasePriceAed = money(raw.purchasePriceAed);
  const unitSizeSqft = money(raw.unitSizeSqft);
  const occupancyPct = percentage(raw.occupancyPct);
  const holdYears = clamp(Math.round(raw.holdYears), 1, 30);
  const useMortgage = Boolean(raw.useMortgage);
  const downPaymentPct = percentage(raw.downPaymentPct);
  const mortgageTermYears = clamp(Math.round(raw.mortgageTermYears), 1, 35);
  const interestRatePct = percentage(raw.annualInterestRatePct, 30);

  const loanAmountAed = useMortgage ? purchasePriceAed * (1 - downPaymentPct / 100) : ZERO;
  const downPaymentAed = useMortgage ? purchasePriceAed - loanAmountAed : purchasePriceAed;

  const transferRegistrationFeeAed = purchasePriceAed * percentage(raw.transferRegistrationFeePct) / 100;
  const trusteeAdminFeeAed = money(raw.trusteeAdminFeeAed);
  const agencyFeeAed = purchasePriceAed * percentage(raw.agencyFeePct) / 100;
  const furnishingEstimateAed = money(raw.furnishingEstimateAed);
  const otherOneTimeCostsAed = money(raw.otherOneTimeCostsAed);
  const handoverAdditionalCostsAed = money(raw.handoverAdditionalCostsAed);
  const mortgageRegistrationCostAed = useMortgage
    ? loanAmountAed * percentage(raw.mortgageRegistrationFeePct) / 100 + money(raw.mortgageRegistrationAdminFeeAed)
    : ZERO;

  const totalAcquisitionCostsAed =
    transferRegistrationFeeAed +
    trusteeAdminFeeAed +
    agencyFeeAed +
    furnishingEstimateAed +
    otherOneTimeCostsAed +
    handoverAdditionalCostsAed +
    mortgageRegistrationCostAed;
  const allInAcquisitionCostAed = purchasePriceAed + totalAcquisitionCostsAed;
  const initialCashRequiredAed = downPaymentAed + totalAcquisitionCostsAed;

  const monthlyMortgagePaymentAed = useMortgage
    ? calculateMonthlyMortgagePayment(loanAmountAed, interestRatePct, mortgageTermYears)
    : ZERO;

  const years = [] as InvestmentResult["years"];
  let cumulativeNetCashFlowAed = ZERO;

  for (let year = 1; year <= holdYears; year += 1) {
    const rentGrowthFactor = (1 + clamp(raw.annualRentGrowthPct, -20, 30) / 100) ** (year - 1);
    const expenseGrowthFactor = (1 + clamp(raw.annualExpenseGrowthPct, -20, 30) / 100) ** (year - 1);
    const propertyGrowthFactor = (1 + clamp(raw.annualAppreciationPct, -20, 30) / 100) ** year;

    const scheduledRentAed = money(raw.annualRentAed) * rentGrowthFactor;
    const collectedRentAed = scheduledRentAed * occupancyPct / 100;
    const serviceChargeAed = unitSizeSqft * money(raw.serviceChargePerSqftAed) * expenseGrowthFactor;
    const managementFeeAed = collectedRentAed * percentage(raw.managementFeePct) / 100;
    const maintenanceReserveAed = collectedRentAed * percentage(raw.maintenanceReservePct) / 100;
    const otherAnnualCostsAed = money(raw.otherAnnualCostsAed) * expenseGrowthFactor;
    const operatingCostsAed = serviceChargeAed + managementFeeAed + maintenanceReserveAed + otherAnnualCostsAed;
    const netOperatingIncomeAed = collectedRentAed - operatingCostsAed;

    const monthsBeforeYear = (year - 1) * 12;
    const totalMortgageMonths = mortgageTermYears * 12;
    const monthsOfDebtService = useMortgage ? Math.max(0, Math.min(12, totalMortgageMonths - monthsBeforeYear)) : 0;
    const debtServiceAed = monthlyMortgagePaymentAed * monthsOfDebtService;
    const netCashFlowAed = netOperatingIncomeAed - debtServiceAed;
    const remainingLoanBalanceAed = useMortgage
      ? getRemainingLoanBalance(loanAmountAed, interestRatePct, mortgageTermYears, year * 12)
      : ZERO;

    cumulativeNetCashFlowAed += netCashFlowAed;
    years.push({
      year,
      propertyValueAed: purchasePriceAed * propertyGrowthFactor,
      scheduledRentAed,
      collectedRentAed,
      operatingCostsAed,
      netOperatingIncomeAed,
      debtServiceAed,
      netCashFlowAed,
      remainingLoanBalanceAed,
    });
  }

  const yearOne = years[0];
  const futurePropertyValueAed = years.at(-1)?.propertyValueAed ?? purchasePriceAed;
  const exitSellingCostsAed = futurePropertyValueAed * percentage(raw.sellingCostPct) / 100;
  const remainingLoanBalanceAtExitAed = years.at(-1)?.remainingLoanBalanceAed ?? loanAmountAed;
  const equityAtHorizonAed = Math.max(0, futurePropertyValueAed - remainingLoanBalanceAtExitAed);
  const netSaleProceedsAed = Math.max(0, equityAtHorizonAed - exitSellingCostsAed);
  const holdOutcomeValueAed = equityAtHorizonAed + cumulativeNetCashFlowAed;
  const sellOutcomeValueAed = netSaleProceedsAed + cumulativeNetCashFlowAed;
  const totalProfitAed = sellOutcomeValueAed - initialCashRequiredAed;
  const totalRoiPct = initialCashRequiredAed > 0 ? totalProfitAed / initialCashRequiredAed * 100 : ZERO;
  const equityMultiple = initialCashRequiredAed > 0 ? sellOutcomeValueAed / initialCashRequiredAed : ZERO;
  const annualizedReturnPct = totalRoiPct > -100
    ? (((1 + totalRoiPct / 100) ** (1 / holdYears)) - 1) * 100
    : -100;

  const scheduledRentYear1Aed = yearOne?.scheduledRentAed ?? ZERO;
  const collectedRentYear1Aed = yearOne?.collectedRentAed ?? ZERO;
  const grossYieldPct = purchasePriceAed > 0 ? scheduledRentYear1Aed / purchasePriceAed * 100 : ZERO;
  const effectiveGrossYieldPct = purchasePriceAed > 0 ? collectedRentYear1Aed / purchasePriceAed * 100 : ZERO;
  const netYieldPct = allInAcquisitionCostAed > 0 ? (yearOne?.netOperatingIncomeAed ?? 0) / allInAcquisitionCostAed * 100 : ZERO;
  const cashOnCashPct = initialCashRequiredAed > 0 ? (yearOne?.netCashFlowAed ?? 0) / initialCashRequiredAed * 100 : ZERO;

  const variableOperatingPct = clamp(raw.managementFeePct + raw.maintenanceReservePct, 0, 99.9) / 100;
  const fixedOperatingAed = unitSizeSqft * money(raw.serviceChargePerSqftAed) + money(raw.otherAnnualCostsAed);
  const debtServiceYear1Aed = yearOne?.debtServiceAed ?? ZERO;
  const breakEvenCollectedRentAed = (fixedOperatingAed + debtServiceYear1Aed) / Math.max(0.001, 1 - variableOperatingPct);
  const breakEvenAnnualRentAed = occupancyPct > 0 ? breakEvenCollectedRentAed / (occupancyPct / 100) : ZERO;

  return {
    purchasePriceAed,
    loanAmountAed,
    downPaymentAed,
    transferRegistrationFeeAed,
    trusteeAdminFeeAed,
    agencyFeeAed,
    furnishingEstimateAed,
    otherOneTimeCostsAed,
    handoverAdditionalCostsAed,
    mortgageRegistrationCostAed,
    totalAcquisitionCostsAed,
    allInAcquisitionCostAed,
    initialCashRequiredAed,
    scheduledRentYear1Aed,
    collectedRentYear1Aed,
    serviceChargeYear1Aed: unitSizeSqft * money(raw.serviceChargePerSqftAed),
    operatingCostsYear1Aed: yearOne?.operatingCostsAed ?? ZERO,
    netOperatingIncomeYear1Aed: yearOne?.netOperatingIncomeAed ?? ZERO,
    monthlyMortgagePaymentAed,
    annualDebtServiceYear1Aed: debtServiceYear1Aed,
    netAnnualCashFlowYear1Aed: yearOne?.netCashFlowAed ?? ZERO,
    grossYieldPct: finite(grossYieldPct),
    effectiveGrossYieldPct: finite(effectiveGrossYieldPct),
    netYieldPct: finite(netYieldPct),
    cashOnCashPct: finite(cashOnCashPct),
    breakEvenAnnualRentAed: finite(breakEvenAnnualRentAed),
    futurePropertyValueAed,
    exitSellingCostsAed,
    remainingLoanBalanceAtExitAed,
    equityAtHorizonAed,
    netSaleProceedsAed,
    cumulativeNetCashFlowAed,
    holdOutcomeValueAed,
    sellOutcomeValueAed,
    totalProfitAed,
    totalRoiPct: finite(totalRoiPct),
    equityMultiple: finite(equityMultiple),
    annualizedReturnPct: finite(annualizedReturnPct),
    years,
  };
}

export function classifyPaymentMilestone(milestone: Pick<PaymentMilestone, "label" | "timing">): PaymentScheduleBucket {
  const text = `${milestone.label} ${milestone.timing}`.toLowerCase();
  if (/post[- ]?handover|after handover|after completion/.test(text)) return "post-handover";
  if (/handover|completion|on key|key collection/.test(text)) return "handover";
  if (/booking|reservation|initial|down payment/.test(text)) return "initial";
  if (/construction|during|instalment|installment|milestone|progress/.test(text)) return "pre-handover";
  return "unclassified";
}

export function buildPaymentSchedule(priceAed: number, milestones: PaymentMilestone[]): PaymentScheduleItem[] {
  const price = money(priceAed);
  return milestones.map((milestone) => ({
    ...milestone,
    percentage: percentage(milestone.percentage),
    amountAed: price * percentage(milestone.percentage) / 100,
    bucket: classifyPaymentMilestone(milestone),
  }));
}

export function summarizePaymentSchedule(items: PaymentScheduleItem[]): PaymentScheduleSummary {
  const summary: PaymentScheduleSummary = {
    totalPct: ZERO,
    totalAed: ZERO,
    initialAed: ZERO,
    preHandoverAed: ZERO,
    handoverAed: ZERO,
    postHandoverAed: ZERO,
    unclassifiedAed: ZERO,
    cashThroughHandoverAed: ZERO,
  };

  for (const item of items) {
    summary.totalPct += finite(item.percentage);
    summary.totalAed += money(item.amountAed);
    if (item.bucket === "initial") summary.initialAed += money(item.amountAed);
    else if (item.bucket === "pre-handover") summary.preHandoverAed += money(item.amountAed);
    else if (item.bucket === "handover") summary.handoverAed += money(item.amountAed);
    else if (item.bucket === "post-handover") summary.postHandoverAed += money(item.amountAed);
    else summary.unclassifiedAed += money(item.amountAed);
  }

  summary.cashThroughHandoverAed = summary.initialAed + summary.preHandoverAed + summary.handoverAed + summary.unclassifiedAed;
  return summary;
}

export function getPaymentPlanTotal(milestones: PaymentMilestone[]) {
  return milestones.reduce((sum, item) => sum + finite(item.percentage), 0);
}
