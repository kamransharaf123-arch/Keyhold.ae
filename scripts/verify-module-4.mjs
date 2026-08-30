import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const errors = [];

const requiredFiles = [
  "types/investment.ts",
  "lib/investment.ts",
  "components/investment/investment-simulator.tsx",
  "components/investment/investment-project-picker.tsx",
  "app/investment-calculator/page.tsx",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing Module 4 file: ${file}`);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

const investmentTypes = read("types/investment.ts");
const realEstateTypes = read("types/real-estate.ts");
const investmentLib = read("lib/investment.ts");
const simulator = read("components/investment/investment-simulator.tsx");
const picker = read("components/investment/investment-project-picker.tsx");
const projectPage = read("app/projects/[slug]/page.tsx");
const unitSelector = read("components/real-estate/unit-selector.tsx");
const comparison = read("components/discovery/project-comparison.tsx");
const discoveryCard = read("components/discovery/discovery-project-card.tsx");
const data = read("data/real-estate.ts");
const sitemap = read("app/sitemap.ts");
const footer = read("components/site-footer.tsx");
const siteData = read("data/site.ts");
const header = read("components/site-header.tsx");

for (const capability of [
  "InvestmentScenarioKey",
  "InvestmentProfile",
  "InvestmentInputs",
  "InvestmentResult",
  "InvestmentYearProjection",
  "PaymentScheduleSummary",
]) {
  if (!investmentTypes.includes(capability)) errors.push(`Investment types missing: ${capability}`);
}

if (!realEstateTypes.includes("investment?: InvestmentProfile")) {
  errors.push("Project type is missing the optional InvestmentProfile relationship.");
}

for (const capability of [
  "getScenarioInputs",
  "applyMechanicalStressTest",
  "calculateMonthlyMortgagePayment",
  "getRemainingLoanBalance",
  "calculateInvestment",
  "classifyPaymentMilestone",
  "buildPaymentSchedule",
  "summarizePaymentSchedule",
]) {
  if (!investmentLib.includes(`function ${capability}`)) errors.push(`Investment engine missing function: ${capability}`);
}

const saleCategories = [...data.matchAll(/category:\s*"(Off-Plan|Ready)"/g)].length;
const investmentProfileUsages = [...data.matchAll(/investment:\s*createDemoInvestmentProfile\(/g)].length;
if (saleCategories === 0) errors.push("No acquisition projects found for Module 4.");
if (investmentProfileUsages !== saleCategories) {
  errors.push(`Every Off-Plan/Ready demo project needs investment assumptions: found ${investmentProfileUsages} profiles for ${saleCategories} acquisition projects.`);
}

if (!data.includes('status: "demo-placeholder"')) errors.push("Demo investment assumptions must be explicitly marked demo-placeholder.");
if (data.includes('status: "verified-project-data"')) errors.push("Demo data must not claim verified-project-data status.");
if (!data.includes("handoverAdditionalCostsAed: 0")) errors.push("Demo handover additional costs must default to zero rather than a fabricated fee.");

const requiredSimulatorCopy = [
  "Gross yield",
  "Effective gross yield",
  "Net yield",
  "True cost of ownership",
  "Model acquisition cash",
  "Cash vs mortgage",
  "Cash-on-cash",
  "Payment plan & cash requirement timeline",
  "Handover cash estimate",
  "Scenario comparison",
  "Run mechanical stress test",
  "Break-even headline rent",
  "Equity multiple",
  "Annualised return*",
  "not guaranteed returns",
];
for (const copy of requiredSimulatorCopy) {
  if (!simulator.includes(copy) && !data.includes(copy)) errors.push(`Investment simulator missing required capability/copy: ${copy}`);
}
if (!simulator.includes('"conservative"') || !simulator.includes('"expected"') || !simulator.includes('"optimistic"')) errors.push("Three-scenario control is incomplete.");
if (!simulator.includes("Hold outcome + rental cash flow") || !simulator.includes("Sell outcome + rental cash flow")) errors.push("Hold-vs-sell exit outcome display is incomplete.");
if (!picker.includes("projectCategory={project.category}")) errors.push("Standalone calculator does not pass project category into the simulator.");

if (!projectPage.includes('id="investment"') || !projectPage.includes("InvestmentSimulator")) {
  errors.push("Project detail page does not embed the Module 4 investment simulator.");
}
if (!projectPage.includes("units={project.units}") || !simulator.includes("investmentUnit") || !simulator.includes("useSearchParams")) {
  errors.push("Project detail page does not support unit-to-simulator deep linking.");
}
if (!projectPage.includes("projectCategory={project.category}")) errors.push("Project simulator does not receive the project category.");
if (!unitSelector.includes("Simulate unit") || !unitSelector.includes("investmentUnit=")) {
  errors.push("Unit Selector does not link priced units into the investment simulator.");
}

const availabilityDisclaimer = "Unit availability is subject to current developer/seller availability and confirmation and may change without prior notice.";
if (!unitSelector.includes(availabilityDisclaimer)) errors.push("Module 4 altered or removed the mandatory Unit Selector availability disclaimer.");

if (!comparison.includes("Gross yield · expected*") || !comparison.includes("Net yield · expected*") || !comparison.includes("Total ROI · expected*")) {
  errors.push("Project comparison is missing the Module 4 financial snapshot rows.");
}
if (!comparison.includes("estimates, not guaranteed returns or live quotations")) errors.push("Project comparison is missing the financial estimate disclaimer.");
if (!discoveryCard.includes("Model investment")) errors.push("Discovery project cards do not expose the investment model for eligible acquisition projects.");

if (!sitemap.includes('"/investment-calculator"')) errors.push("Sitemap is missing /investment-calculator.");
if (!footer.includes('href="/investment-calculator"') && !footer.includes('"/investment-calculator"')) errors.push("Footer is missing the Investment Calculator link.");

// Preserve the exact public header contract from Modules 1–3.
const primaryNavMatch = siteData.match(/export const primaryNav:[\s\S]*?= \[([\s\S]*?)\];/);
const navLabels = primaryNavMatch ? [...primaryNavMatch[1].matchAll(/label: "([^"]+)"/g)].map((match) => match[1]) : [];
const expectedPrimaryNav = ["Home", "Updates", "Insights", "Services", "Who We Are"];
if (JSON.stringify(navLabels) !== JSON.stringify(expectedPrimaryNav)) errors.push(`Primary navigation contract changed: ${JSON.stringify(navLabels)}`);
if (!header.includes("Projects")) errors.push("Projects dropdown is missing from header.");
const projectNavMatch = siteData.match(/export const projectNav:[\s\S]*?= \[([\s\S]*?)\];/);
const projectNavLabels = projectNavMatch ? [...projectNavMatch[1].matchAll(/label: "([^"]+)"/g)].map((match) => match[1]) : [];
const expectedProjectNav = ["Off-Plan", "Ready", "Short-Term Rentals", "Long-Term Rentals"];
if (JSON.stringify(projectNavLabels) !== JSON.stringify(expectedProjectNav)) errors.push(`Projects dropdown contract changed: ${JSON.stringify(projectNavLabels)}`);

// Execute the pure financial engine after transpiling TypeScript. This catches formula and finite-number regressions.
try {
  const transpiled = ts.transpileModule(investmentLib, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`;
  const engine = await import(moduleUrl);

  const base = {
    purchasePriceAed: 2_000_000,
    unitSizeSqft: 1_000,
    annualRentAed: 150_000,
    occupancyPct: 90,
    transferRegistrationFeePct: 4,
    trusteeAdminFeeAed: 4_000,
    agencyFeePct: 2,
    furnishingEstimateAed: 80_000,
    otherOneTimeCostsAed: 2_000,
    handoverAdditionalCostsAed: 0,
    serviceChargePerSqftAed: 18,
    managementFeePct: 5,
    maintenanceReservePct: 3,
    otherAnnualCostsAed: 2_500,
    annualAppreciationPct: 4,
    annualRentGrowthPct: 2.5,
    annualExpenseGrowthPct: 2,
    sellingCostPct: 2,
    holdYears: 5,
    useMortgage: false,
    downPaymentPct: 30,
    annualInterestRatePct: 4.75,
    mortgageTermYears: 25,
    mortgageRegistrationFeePct: 0.25,
    mortgageRegistrationAdminFeeAed: 290,
  };

  for (const inputs of [
    base,
    { ...base, useMortgage: true },
    { ...base, annualRentAed: 0, occupancyPct: 0 },
    { ...base, annualAppreciationPct: -5, annualRentGrowthPct: -3 },
    { ...base, useMortgage: true, downPaymentPct: 100, annualInterestRatePct: 0 },
    { ...base, holdYears: 30, mortgageTermYears: 1 },
    { ...base, handoverAdditionalCostsAed: 25_000 },
  ]) {
    const result = engine.calculateInvestment(inputs);
    const serialized = JSON.stringify(result);
    if (serialized.includes("null")) {
      // JSON serialises non-finite numbers as null. InvestmentResult has no legitimate nullable fields.
      errors.push(`Financial engine produced a non-finite value for test case: ${JSON.stringify(inputs)}`);
      break;
    }
    if (result.years.length < 1 || result.years.length > 30) errors.push(`Projection year count outside 1–30: ${result.years.length}`);
  }

  const cash = engine.calculateInvestment(base);
  if (Math.round(cash.scheduledRentYear1Aed) !== 150_000) errors.push(`Scheduled year-one rent regression: ${cash.scheduledRentYear1Aed}`);
  if (Math.round(cash.collectedRentYear1Aed) !== 135_000) errors.push(`Occupancy-adjusted year-one rent regression: ${cash.collectedRentYear1Aed}`);
  if (Math.abs(cash.grossYieldPct - 7.5) > 0.0001) errors.push(`Gross yield definition regression: ${cash.grossYieldPct}`);
  if (Math.abs(cash.effectiveGrossYieldPct - 6.75) > 0.0001) errors.push(`Effective gross yield regression: ${cash.effectiveGrossYieldPct}`);
  if (cash.initialCashRequiredAed <= base.purchasePriceAed) errors.push("Cash acquisition should include modelled one-time acquisition costs.");
  if (!(cash.equityMultiple > 0 && Number.isFinite(cash.equityMultiple))) errors.push("Equity multiple must be finite and positive in the reference case.");
  if (!(cash.breakEvenAnnualRentAed > 0 && Number.isFinite(cash.breakEvenAnnualRentAed))) errors.push("Break-even annual rent must be finite and positive in the reference case.");
  if (cash.holdOutcomeValueAed < cash.sellOutcomeValueAed) errors.push("Hold outcome before selling costs should not be below sell outcome in the reference case.");

  const withHandoverExtras = engine.calculateInvestment({ ...base, handoverAdditionalCostsAed: 25_000 });
  if (Math.round(withHandoverExtras.totalAcquisitionCostsAed - cash.totalAcquisitionCostsAed) !== 25_000) errors.push("Handover additional costs are not included exactly once in acquisition costs.");

  const mortgage = engine.calculateInvestment({ ...base, useMortgage: true });
  if (!(mortgage.loanAmountAed > 0 && mortgage.monthlyMortgagePaymentAed > 0)) errors.push("Mortgage calculation did not produce a positive loan/payment.");
  if (!(mortgage.initialCashRequiredAed < cash.initialCashRequiredAed)) errors.push("Mortgage model acquisition cash should be lower than all-cash acquisition cash in the reference case.");
  if (mortgage.remainingLoanBalanceAtExitAed < 0) errors.push("Remaining loan balance must never be negative.");

  const zeroInterest = engine.calculateMonthlyMortgagePayment(1_200_000, 0, 20);
  if (Math.abs(zeroInterest - 5_000) > 0.01) errors.push(`Zero-interest mortgage payment regression: ${zeroInterest}`);

  const stressed = engine.applyMechanicalStressTest(base);
  if (!(stressed.annualRentAed < base.annualRentAed)) errors.push("Stress test must reduce scheduled rent.");
  if (!(stressed.occupancyPct < base.occupancyPct)) errors.push("Stress test must reduce occupancy.");
  if (stressed.annualAppreciationPct > 0) errors.push("Stress test appreciation must be capped at 0%.");

  const schedule = engine.buildPaymentSchedule(2_000_000, [
    { label: "Booking", percentage: 20, timing: "On reservation" },
    { label: "Construction", percentage: 50, timing: "During construction" },
    { label: "Handover", percentage: 30, timing: "At handover" },
  ]);
  const scheduleTotal = schedule.reduce((sum, item) => sum + item.amountAed, 0);
  if (Math.abs(scheduleTotal - 2_000_000) > 0.01) errors.push(`Payment schedule amount regression: ${scheduleTotal}`);
  const summary = engine.summarizePaymentSchedule(schedule);
  if (Math.round(summary.initialAed) !== 400_000) errors.push(`Initial milestone classification regression: ${summary.initialAed}`);
  if (Math.round(summary.preHandoverAed) !== 1_000_000) errors.push(`Pre-handover milestone classification regression: ${summary.preHandoverAed}`);
  if (Math.round(summary.handoverAed) !== 600_000) errors.push(`Handover milestone classification regression: ${summary.handoverAed}`);
  if (Math.round(summary.cashThroughHandoverAed) !== 2_000_000) errors.push(`Cash-through-handover summary regression: ${summary.cashThroughHandoverAed}`);

  const post = engine.buildPaymentSchedule(1_000_000, [{ label: "Post-handover", percentage: 20, timing: "12 months after handover" }]);
  if (post[0]?.bucket !== "post-handover") errors.push(`Post-handover classification regression: ${post[0]?.bucket}`);
} catch (error) {
  errors.push(`Unable to execute investment engine verification: ${error instanceof Error ? error.message : String(error)}`);
}

if (errors.length > 0) {
  console.error("KeyHold Module 4 verification failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`KeyHold Module 4 verification passed: ${saleCategories} acquisition projects have demo investment profiles; gross/effective/net yield, cash-vs-mortgage, stress test, payment/handover timeline, scenario comparison, hold/sell outcomes and unit deep links verified.`);
