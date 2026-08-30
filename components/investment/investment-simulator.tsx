"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PaymentMilestone, ProjectCategory, ProjectUnit } from "@/types/real-estate";
import type { InvestmentInputs, InvestmentProfile, InvestmentScenarioKey } from "@/types/investment";
import { applyMechanicalStressTest, buildPaymentSchedule, calculateInvestment, getScenarioInputs, summarizePaymentSchedule } from "@/lib/investment";
import { formatAed } from "@/lib/format";

const scenarioKeys: InvestmentScenarioKey[] = ["conservative", "expected", "optimistic"];

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value.toFixed(1)}%`;
}

function parseNumber(value: string, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function fieldId(projectSlug: string, name: string) {
  return `investment-${projectSlug}-${name}`;
}

export type InvestmentSimulatorProps = {
  projectTitle: string;
  projectSlug: string;
  profile: InvestmentProfile;
  defaultPurchasePriceAed: number;
  defaultUnitSizeSqft?: number | null;
  selectedUnitLabel?: string;
  units?: ProjectUnit[];
  paymentPlan: PaymentMilestone[];
  projectCategory?: ProjectCategory;
  compactHeading?: boolean;
};

export function InvestmentSimulator({
  projectTitle,
  projectSlug,
  profile,
  defaultPurchasePriceAed,
  defaultUnitSizeSqft,
  selectedUnitLabel,
  units,
  paymentPlan,
  projectCategory,
  compactHeading = false,
}: InvestmentSimulatorProps) {
  const searchParams = useSearchParams();
  const investmentUnitId = units ? searchParams.get("investmentUnit") : null;
  const selectedUnit = investmentUnitId
    ? units?.find((unit) => unit.id === investmentUnitId && unit.priceAed !== null)
    : undefined;
  const resolvedPurchasePriceAed = selectedUnit?.priceAed ?? defaultPurchasePriceAed;
  const resolvedUnitSizeSqft = selectedUnit?.sizeSqft ?? defaultUnitSizeSqft;
  const resolvedUnitLabel = selectedUnit
    ? `Unit ${selectedUnit.unitNumber} · ${selectedUnit.bedrooms} BR · ${selectedUnit.sizeSqft.toLocaleString("en-US")} sqft`
    : selectedUnitLabel;

  const [scenarioKey, setScenarioKey] = useState<InvestmentScenarioKey>("expected");
  const [inputs, setInputs] = useState<InvestmentInputs>(() =>
    getScenarioInputs(profile, "expected", resolvedPurchasePriceAed, resolvedUnitSizeSqft),
  );
  const [edited, setEdited] = useState(false);
  const [stressActive, setStressActive] = useState(false);

  const result = useMemo(() => calculateInvestment(inputs), [inputs]);
  const paymentSchedule = useMemo(
    () => buildPaymentSchedule(inputs.purchasePriceAed, paymentPlan),
    [inputs.purchasePriceAed, paymentPlan],
  );
  const paymentSummary = useMemo(() => summarizePaymentSchedule(paymentSchedule), [paymentSchedule]);
  const cashComparison = useMemo(() => calculateInvestment({ ...inputs, useMortgage: false }), [inputs]);
  const mortgageComparison = useMemo(() => calculateInvestment({ ...inputs, useMortgage: true }), [inputs]);
  const scenarioResults = useMemo(
    () => scenarioKeys.map((key) => {
      const scenario = profile.scenarios[key];
      const scenarioInputs: InvestmentInputs = {
        ...inputs,
        annualRentAed: scenario.annualRentAed,
        occupancyPct: scenario.occupancyPct,
        annualAppreciationPct: scenario.annualAppreciationPct,
        annualRentGrowthPct: scenario.annualRentGrowthPct,
        annualExpenseGrowthPct: scenario.annualExpenseGrowthPct,
      };
      return { key, label: scenario.label, result: calculateInvestment(scenarioInputs) };
    }),
    [inputs, profile.scenarios],
  );
  const handoverCashEstimateAed = paymentSummary.handoverAed + inputs.furnishingEstimateAed + inputs.handoverAdditionalCostsAed;

  const maxProjectionValue = Math.max(
    inputs.purchasePriceAed,
    ...result.years.map((year) => Math.max(year.propertyValueAed, 0)),
    1,
  );

  function update<K extends keyof InvestmentInputs>(key: K, value: InvestmentInputs[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
    setEdited(true);
    setStressActive(false);
  }

  function updateNumber<K extends keyof InvestmentInputs>(
    key: K,
    raw: string,
    options?: { min?: number; max?: number },
  ) {
    const current = inputs[key];
    if (typeof current !== "number") return;
    const value = parseNumber(raw, current, options?.min ?? 0, options?.max ?? Number.MAX_SAFE_INTEGER);
    update(key, value as InvestmentInputs[K]);
  }

  function applyScenario(nextScenario: InvestmentScenarioKey) {
    setScenarioKey(nextScenario);
    setInputs((current) => {
      const scenario = profile.scenarios[nextScenario];
      return {
        ...current,
        annualRentAed: scenario.annualRentAed,
        occupancyPct: scenario.occupancyPct,
        annualAppreciationPct: scenario.annualAppreciationPct,
        annualRentGrowthPct: scenario.annualRentGrowthPct,
        annualExpenseGrowthPct: scenario.annualExpenseGrowthPct,
      };
    });
    setEdited(false);
    setStressActive(false);
  }

  function runStressTest() {
    setInputs((current) => applyMechanicalStressTest(current));
    setEdited(true);
    setStressActive(true);
  }

  return (
    <div className="space-y-8">
      {!compactHeading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow">KeyHold Investment Simulator</p>
            <h3 className="font-display mt-3 text-3xl sm:text-4xl">Model the deal before you commit.</h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-stone)]">
              Start with the project assumptions, then change any input. Every result recalculates immediately. Figures are illustrative estimates, not guaranteed returns.
            </p>
          </div>
          {resolvedUnitLabel ? (
            <div className="border border-black/10 bg-[var(--color-bone)] px-4 py-3 text-sm">
              <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">Selected unit</span>
              <strong className="mt-1 block font-medium">{resolvedUnitLabel}</strong>
            </div>
          ) : null}
        </div>
      ) : resolvedUnitLabel ? (
        <div className="inline-block border border-black/10 bg-[var(--color-bone)] px-4 py-3 text-sm">
          <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">Selected unit</span>
          <strong className="mt-1 block font-medium">{resolvedUnitLabel}</strong>
        </div>
      ) : null}

      <div className="border border-[var(--color-champagne)]/45 bg-[var(--color-bone)] p-4 text-xs leading-6 text-[var(--color-stone)]">
        <strong className="text-[var(--color-graphite)]">Demo assumptions:</strong> this Module 4 dataset is intentionally marked {profile.status}. Verify official transaction fees, project service charges, rental evidence, financing terms and legal/tax implications before public launch or client reliance.
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6 border border-black/10 p-5 sm:p-6">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Scenario</p>
            <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Investment scenario">
              {scenarioKeys.map((key) => {
                const active = scenarioKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyScenario(key)}
                    aria-pressed={active}
                    className={`min-h-11 border px-2 text-xs font-medium transition-colors sm:px-4 ${active ? "border-[var(--color-graphite)] bg-[var(--color-graphite)] text-white" : "border-black/10 hover:bg-[var(--color-bone)]"}`}
                  >
                    {profile.scenarios[key].label}
                  </button>
                );
              })}
            </div>
            {edited ? <p className="mt-2 text-xs text-[var(--color-stone)]">{stressActive ? "Mechanical downside stress is active." : "Scenario inputs adjusted manually."}</p> : null}
            <button
              type="button"
              onClick={runStressTest}
              className="mt-3 min-h-11 w-full border border-black/10 px-4 text-xs font-semibold transition-colors hover:border-[var(--color-champagne)] hover:bg-[var(--color-bone)]"
            >
              Run mechanical stress test
            </button>
            <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">Stress rule: rent −10%, occupancy −10 points, appreciation capped at 0%, rent growth capped at 0%, expense growth +2 points. This is a mechanical downside test, not a forecast.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id={fieldId(projectSlug, "price")}
              label="Purchase price"
              value={inputs.purchasePriceAed}
              prefix="AED"
              step={10_000}
              onChange={(value) => updateNumber("purchasePriceAed", value, { min: 1 })}
            />
            <NumberField
              id={fieldId(projectSlug, "rent")}
              label="Expected annual rent"
              value={inputs.annualRentAed}
              prefix="AED"
              step={5_000}
              onChange={(value) => updateNumber("annualRentAed", value)}
            />
            <NumberField
              id={fieldId(projectSlug, "occupancy")}
              label="Occupancy"
              value={inputs.occupancyPct}
              suffix="%"
              step={1}
              onChange={(value) => updateNumber("occupancyPct", value, { max: 100 })}
            />
            <NumberField
              id={fieldId(projectSlug, "hold")}
              label="Holding period"
              value={inputs.holdYears}
              suffix="years"
              step={1}
              onChange={(value) => updateNumber("holdYears", value, { min: 1, max: 30 })}
            />
          </div>

          <div className="border-t border-black/10 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Financing</p>
                <p className="mt-1 text-xs text-[var(--color-stone)]">Compare cash purchase with an illustrative mortgage.</p>
              </div>
              <div className="inline-flex border border-black/10 p-1">
                <button type="button" onClick={() => update("useMortgage", false)} aria-pressed={!inputs.useMortgage} className={`min-h-10 px-4 text-xs font-medium ${!inputs.useMortgage ? "bg-[var(--color-graphite)] text-white" : "hover:bg-[var(--color-bone)]"}`}>Cash</button>
                <button type="button" onClick={() => update("useMortgage", true)} aria-pressed={inputs.useMortgage} className={`min-h-10 px-4 text-xs font-medium ${inputs.useMortgage ? "bg-[var(--color-graphite)] text-white" : "hover:bg-[var(--color-bone)]"}`}>Mortgage</button>
              </div>
            </div>
          </div>

          <details className="group border-t border-black/10 pt-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium">
              Advanced assumptions
              <span aria-hidden="true" className="text-[var(--color-champagne)] transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField id={fieldId(projectSlug, "size")} label="Unit size" value={inputs.unitSizeSqft} suffix="sqft" step={10} onChange={(value) => updateNumber("unitSizeSqft", value)} />
              <NumberField id={fieldId(projectSlug, "service")} label="Service charge / sqft" value={inputs.serviceChargePerSqftAed} prefix="AED" step={1} onChange={(value) => updateNumber("serviceChargePerSqftAed", value)} />
              <NumberField id={fieldId(projectSlug, "management")} label="Management fee" value={inputs.managementFeePct} suffix="%" step={0.25} onChange={(value) => updateNumber("managementFeePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "maintenance")} label="Maintenance reserve" value={inputs.maintenanceReservePct} suffix="%" step={0.25} onChange={(value) => updateNumber("maintenanceReservePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "otherannual")} label="Other annual costs" value={inputs.otherAnnualCostsAed} prefix="AED" step={500} onChange={(value) => updateNumber("otherAnnualCostsAed", value)} />
              <NumberField id={fieldId(projectSlug, "furnishing")} label="Furnishing estimate" value={inputs.furnishingEstimateAed} prefix="AED" step={5_000} onChange={(value) => updateNumber("furnishingEstimateAed", value)} />
              <NumberField id={fieldId(projectSlug, "transferfee")} label="Transfer / registration fee" value={inputs.transferRegistrationFeePct} suffix="%" step={0.1} onChange={(value) => updateNumber("transferRegistrationFeePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "trustee")} label="Trustee / admin fee" value={inputs.trusteeAdminFeeAed} prefix="AED" step={100} onChange={(value) => updateNumber("trusteeAdminFeeAed", value)} />
              <NumberField id={fieldId(projectSlug, "agency")} label="Agency fee" value={inputs.agencyFeePct} suffix="%" step={0.1} onChange={(value) => updateNumber("agencyFeePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "otheroneoff")} label="Other one-time costs" value={inputs.otherOneTimeCostsAed} prefix="AED" step={500} onChange={(value) => updateNumber("otherOneTimeCostsAed", value)} />
              <NumberField id={fieldId(projectSlug, "handoverextras")} label="Other handover costs" value={inputs.handoverAdditionalCostsAed} prefix="AED" step={500} onChange={(value) => updateNumber("handoverAdditionalCostsAed", value)} />
              <NumberField id={fieldId(projectSlug, "appreciation")} label="Annual appreciation" value={inputs.annualAppreciationPct} suffix="%" step={0.25} onChange={(value) => updateNumber("annualAppreciationPct", value, { min: -20, max: 30 })} />
              <NumberField id={fieldId(projectSlug, "rentgrowth")} label="Annual rent growth" value={inputs.annualRentGrowthPct} suffix="%" step={0.25} onChange={(value) => updateNumber("annualRentGrowthPct", value, { min: -20, max: 30 })} />
              <NumberField id={fieldId(projectSlug, "expensegrowth")} label="Annual expense growth" value={inputs.annualExpenseGrowthPct} suffix="%" step={0.25} onChange={(value) => updateNumber("annualExpenseGrowthPct", value, { min: -20, max: 30 })} />
              <NumberField id={fieldId(projectSlug, "sellingcost")} label="Exit selling costs" value={inputs.sellingCostPct} suffix="%" step={0.1} onChange={(value) => updateNumber("sellingCostPct", value, { max: 100 })} />
              {inputs.useMortgage ? (
                <>
                  <NumberField id={fieldId(projectSlug, "downpayment")} label="Down payment" value={inputs.downPaymentPct} suffix="%" step={1} onChange={(value) => updateNumber("downPaymentPct", value, { max: 100 })} />
                  <NumberField id={fieldId(projectSlug, "interest")} label="Annual interest rate" value={inputs.annualInterestRatePct} suffix="%" step={0.05} onChange={(value) => updateNumber("annualInterestRatePct", value, { max: 30 })} />
                  <NumberField id={fieldId(projectSlug, "term")} label="Mortgage term" value={inputs.mortgageTermYears} suffix="years" step={1} onChange={(value) => updateNumber("mortgageTermYears", value, { min: 1, max: 35 })} />
                  <NumberField id={fieldId(projectSlug, "mortgagereg")} label="Mortgage registration fee" value={inputs.mortgageRegistrationFeePct} suffix="%" step={0.05} onChange={(value) => updateNumber("mortgageRegistrationFeePct", value, { max: 100 })} />
                  <NumberField id={fieldId(projectSlug, "mortgageadmin")} label="Mortgage admin fee" value={inputs.mortgageRegistrationAdminFeeAed} prefix="AED" step={10} onChange={(value) => updateNumber("mortgageRegistrationAdminFeeAed", value)} />
                </>
              ) : null}
            </div>
          </details>
        </div>

        <div className="space-y-6" aria-live="polite">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Gross yield" value={formatPercent(result.grossYieldPct)} detail="Scheduled annual rent ÷ purchase price" />
            <MetricCard label="Effective gross yield" value={formatPercent(result.effectiveGrossYieldPct)} detail="Occupancy-adjusted rent ÷ purchase price" />
            <MetricCard label="Net yield" value={formatPercent(result.netYieldPct)} detail="Year-one NOI ÷ all-in acquisition cost" />
            <MetricCard label={inputs.useMortgage ? "Cash-on-cash" : "Net income / year"} value={inputs.useMortgage ? formatPercent(result.cashOnCashPct) : formatAed(result.netAnnualCashFlowYear1Aed, { compact: true })} detail={inputs.useMortgage ? "Year-one cash flow ÷ modelled acquisition cash" : "Year-one NOI after operating costs"} />
            <MetricCard label="Model acquisition cash" value={formatAed(result.initialCashRequiredAed, { compact: true })} detail={inputs.useMortgage ? "Down payment + modelled one-time costs" : "Full purchase + modelled one-time costs"} />
            <MetricCard label={`${inputs.holdYears}Y total ROI`} value={formatPercent(result.totalRoiPct)} detail="Modelled sell outcome vs acquisition cash" />
            <MetricCard label="Annualised return*" value={formatPercent(result.annualizedReturnPct)} detail="Equivalent annual rate from total modelled ROI; not IRR" />
            <MetricCard label="Equity multiple" value={`${result.equityMultiple.toFixed(2)}×`} detail="Modelled sell outcome ÷ acquisition cash" />
          </div>

          <div className="border border-black/10 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">True cost of ownership · acquisition</p>
                <p className="font-display mt-2 text-3xl">{formatAed(result.allInAcquisitionCostAed, { compact: true })}</p>
              </div>
              <p className="max-w-xs text-right text-xs leading-5 text-[var(--color-stone)]">Purchase price plus the one-time assumptions currently included in this model.</p>
            </div>
            <div className="mt-5 space-y-3">
              <CostRow label="Purchase price" value={result.purchasePriceAed} />
              <CostRow label="Transfer / registration" value={result.transferRegistrationFeeAed} />
              <CostRow label="Trustee / admin" value={result.trusteeAdminFeeAed} />
              <CostRow label="Agency" value={result.agencyFeeAed} />
              <CostRow label="Furnishing" value={result.furnishingEstimateAed} />
              <CostRow label="Other one-time costs" value={result.otherOneTimeCostsAed} />
              <CostRow label="Other handover costs" value={result.handoverAdditionalCostsAed} />
              {inputs.useMortgage ? <CostRow label="Mortgage registration / admin" value={result.mortgageRegistrationCostAed} /> : null}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-black/10 p-5 sm:p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Year-one rental economics</p>
              <div className="mt-5 space-y-3">
                <CostRow label="Scheduled rent" value={result.scheduledRentYear1Aed} />
                <CostRow label="Collected rent after occupancy" value={result.collectedRentYear1Aed} />
                <CostRow label="Service charge" value={-result.serviceChargeYear1Aed} signed />
                <CostRow label="Operating costs total" value={-result.operatingCostsYear1Aed} signed />
                <CostRow label="Net operating income" value={result.netOperatingIncomeYear1Aed} strong />
                {inputs.useMortgage ? <CostRow label="Debt service" value={-result.annualDebtServiceYear1Aed} signed /> : null}
                <CostRow label="Net cash flow" value={result.netAnnualCashFlowYear1Aed} signed strong />
                <CostRow label="Break-even headline rent" value={result.breakEvenAnnualRentAed} />
              </div>
              {inputs.useMortgage ? (
                <div className="mt-5 border-t border-black/10 pt-4 text-xs leading-6 text-[var(--color-stone)]">
                  Modelled mortgage: {formatAed(result.loanAmountAed, { compact: true })} loan · {formatAed(result.monthlyMortgagePaymentAed)} / month. Off-plan financing timing can differ and must be confirmed with a lender.
                </div>
              ) : null}
            </div>

            <div className="border border-black/10 p-5 sm:p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Exit after {inputs.holdYears} years</p>
              <div className="mt-5 space-y-3">
                <CostRow label="Projected property value" value={result.futurePropertyValueAed} />
                {inputs.useMortgage ? <CostRow label="Remaining loan" value={-result.remainingLoanBalanceAtExitAed} signed /> : null}
                <CostRow label="Equity if held" value={result.equityAtHorizonAed} strong />
                <CostRow label="Hold outcome + rental cash flow" value={result.holdOutcomeValueAed} signed />
                <CostRow label="Selling costs" value={-result.exitSellingCostsAed} signed />
                <CostRow label="Net sale proceeds" value={result.netSaleProceedsAed} strong />
                <CostRow label="Sell outcome + rental cash flow" value={result.sellOutcomeValueAed} signed />
                <CostRow label="Modelled profit if sold" value={result.totalProfitAed} signed strong />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-black/10 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Cash vs mortgage</p>
            <h4 className="font-display mt-2 text-2xl">Same property, different capital structure.</h4>
          </div>
          <p className="text-xs leading-6 text-[var(--color-stone)] lg:text-right">Mortgage figures use the editable rate, down payment and term above. Financing approval, timing and off-plan eligibility must be confirmed by a lender.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FinancingComparisonCard label="Cash" result={cashComparison} />
          <FinancingComparisonCard label="Mortgage" result={mortgageComparison} showMonthlyPayment />
        </div>
      </div>

      {paymentSchedule.length > 0 ? (
        <div className="border border-black/10 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Payment plan & cash requirement timeline</p>
              <h4 className="font-display mt-2 text-2xl">See the staged capital exposure.</h4>
            </div>
            <p className="text-xs leading-6 text-[var(--color-stone)] lg:text-right">Amounts are calculated from the current purchase-price input. Timing labels are copied from the project record and do not create contractual payment dates.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Initial milestone" value={formatAed(paymentSummary.initialAed, { compact: true })} detail="Milestones classified as booking/reservation/initial" />
            <MetricCard label="Before handover" value={formatAed(paymentSummary.initialAed + paymentSummary.preHandoverAed, { compact: true })} detail="Initial + construction-classified milestones" />
            <MetricCard label="Handover milestone" value={formatAed(paymentSummary.handoverAed, { compact: true })} detail="Milestones explicitly classified as handover" />
            <MetricCard label="Handover cash estimate" value={formatAed(handoverCashEstimateAed, { compact: true })} detail="Handover milestone + furnishing + editable handover extras" />
          </div>
          <div className="mt-4 text-[0.68rem] leading-5 text-[var(--color-stone)]">Milestones are classified from their project labels. Unclassified milestone amount: {formatAed(paymentSummary.unclassifiedAed)}. Do not treat this timeline as contractual dates or a statement of when DLD/registration/financing charges are payable.</div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {paymentSchedule.map((item) => (
              <div key={`${item.label}-${item.timing}`} className="border border-black/10 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <strong className="text-sm font-medium">{item.label}</strong>
                  <span className="font-display text-2xl">{item.percentage}%</span>
                </div>
                <div className="mt-3 h-1.5 bg-[var(--color-warm-grey)]" aria-hidden="true">
                  <div className="h-full bg-[var(--color-champagne)] transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }} />
                </div>
                <p className="mt-3 font-medium">{formatAed(item.amountAed, { compact: true })}</p>
                <p className="mt-1 text-xs text-[var(--color-stone)]">{item.timing}</p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">{item.bucket.replace("-", " ")}</p>
                {item.note ? <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">{item.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="border border-black/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Scenario comparison</p>
            <h4 className="font-display mt-2 text-2xl">Conservative, expected and optimistic side by side.</h4>
          </div>
          <p className="max-w-md text-xs leading-6 text-[var(--color-stone)]">These are editable analytical assumptions, not probabilities or guaranteed outcomes.</p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">
                <th className="py-3 pr-4 font-semibold">Scenario</th>
                <th className="px-4 py-3 font-semibold">Gross yield</th>
                <th className="px-4 py-3 font-semibold">Net yield</th>
                <th className="px-4 py-3 font-semibold">{inputs.holdYears}Y ROI</th>
                <th className="px-4 py-3 font-semibold">Future value</th>
                <th className="pl-4 py-3 font-semibold">Year-1 cash flow</th>
              </tr>
            </thead>
            <tbody>
              {scenarioResults.map((item) => (
                <tr key={item.key} className="border-b border-black/[0.07]">
                  <th className="py-4 pr-4 font-medium">{item.label}</th>
                  <td className="px-4 py-4">{formatPercent(item.result.grossYieldPct)}</td>
                  <td className="px-4 py-4">{formatPercent(item.result.netYieldPct)}</td>
                  <td className="px-4 py-4">{formatPercent(item.result.totalRoiPct)}</td>
                  <td className="px-4 py-4">{formatAed(item.result.futurePropertyValueAed, { compact: true })}</td>
                  <td className="pl-4 py-4">{formatAed(item.result.netAnnualCashFlowYear1Aed, { compact: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-black/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">Projection</p>
            <h4 className="font-display mt-2 text-2xl">Property value and annual cash flow.</h4>
          </div>
          <p className="text-xs text-[var(--color-stone)]">{profile.scenarios[scenarioKey].label}{edited ? " · adjusted" : ""}</p>
        </div>
        <div className="mt-6 space-y-4">
          {result.years.map((year) => {
            const width = Math.max(2, year.propertyValueAed / maxProjectionValue * 100);
            return (
              <div key={year.year} className="grid gap-2 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
                <span className="text-xs font-medium">Year {year.year}</span>
                <div className="h-2 bg-[var(--color-warm-grey)]" aria-hidden="true">
                  <div className="h-full bg-[var(--color-graphite)] transition-[width] duration-500" style={{ width: `${width}%` }} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:justify-end">
                  <span>{formatAed(year.propertyValueAed, { compact: true })} value</span>
                  <span className={year.netCashFlowAed < 0 ? "text-red-700" : "text-[var(--color-stone)]"}>{formatAed(year.netCashFlowAed, { compact: true })} cash flow</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-l-2 border-[var(--color-champagne)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
        <strong className="text-[var(--color-graphite)]">Important:</strong> this simulator is an analytical estimate only. It does not guarantee rental income, occupancy, capital appreciation, financing approval, Golden Visa eligibility or resale value. Fees and regulations can change. Confirm project-specific charges, official registrations, lender terms, tax treatment and professional advice before committing funds.{projectCategory === "Off-Plan" ? " Off-plan mortgage availability and timing can differ materially from this simplified financing model." : ""}
      </div>

      <div className="text-[0.68rem] leading-5 text-[var(--color-stone)]">
        Model: {projectTitle}. Gross yield uses scheduled headline rent ÷ purchase price. Effective gross yield applies occupancy. Net yield uses year-one net operating income ÷ modelled all-in acquisition cost. Total ROI assumes a sale at the selected horizon and includes modelled rental cash flow. Annualised return is derived from that total ROI and is not an IRR because exact transaction/payment dates are not modelled.
      </div>
    </div>
  );
}

function FinancingComparisonCard({
  label,
  result,
  showMonthlyPayment = false,
}: {
  label: string;
  result: ReturnType<typeof calculateInvestment>;
  showMonthlyPayment?: boolean;
}) {
  return (
    <div className="border border-black/10 bg-[var(--color-bone)] p-5">
      <div className="flex items-baseline justify-between gap-4">
        <strong className="font-display text-2xl">{label}</strong>
        <span className="text-xs text-[var(--color-stone)]">{formatPercent(result.totalRoiPct)} total ROI</span>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <CostRow label="Model acquisition cash" value={result.initialCashRequiredAed} />
        {showMonthlyPayment ? <CostRow label="Monthly mortgage" value={result.monthlyMortgagePaymentAed} /> : null}
        <CostRow label="Year-one cash flow" value={result.netAnnualCashFlowYear1Aed} signed />
        <CostRow label="Net yield" value={result.netYieldPct} percent />
        <CostRow label="Equity multiple" value={result.equityMultiple} multiple />
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-2 block text-xs font-medium text-[var(--color-stone)]">{label}</span>
      <span className="flex min-h-12 items-center border border-black/10 bg-[var(--color-soft-white)] focus-within:border-[var(--color-champagne)]">
        {prefix ? <span className="pl-3 text-xs text-[var(--color-stone)]">{prefix}</span> : null}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none"
        />
        {suffix ? <span className="pr-3 text-xs text-[var(--color-stone)]">{suffix}</span> : null}
      </span>
    </label>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 border border-black/10 bg-[var(--color-bone)] p-4 sm:p-5">
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-stone)]">{label}</p>
      <p className="font-display mt-2 break-words text-xl sm:text-2xl">{value}</p>
      <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">{detail}</p>
    </div>
  );
}

function CostRow({
  label,
  value,
  signed = false,
  strong = false,
  percent = false,
  multiple = false,
}: {
  label: string;
  value: number;
  signed?: boolean;
  strong?: boolean;
  percent?: boolean;
  multiple?: boolean;
}) {
  const absolute = Math.abs(value);
  const prefix = signed && value < 0 ? "− " : signed && value > 0 ? "+ " : "";
  const formatted = percent ? formatPercent(absolute) : multiple ? `${absolute.toFixed(2)}×` : formatAed(absolute);
  return (
    <div className={`flex items-baseline justify-between gap-4 border-b border-black/[0.06] pb-2 text-sm ${strong ? "font-semibold" : ""}`}>
      <span className="text-[var(--color-stone)]">{label}</span>
      <span className={value < 0 ? "text-red-700" : ""}>{prefix}{formatted}</span>
    </div>
  );
}
