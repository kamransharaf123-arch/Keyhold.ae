"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PaymentMilestone, ProjectCategory, ProjectUnit } from "@/types/real-estate";
import type { InvestmentInputs, InvestmentProfile, InvestmentScenarioKey } from "@/types/investment";
import type { KeyHoldLocale } from "@/types/localization";
import { applyMechanicalStressTest, buildPaymentSchedule, calculateInvestment, getScenarioInputs, summarizePaymentSchedule } from "@/lib/investment";
import { formatAed } from "@/lib/format";

const scenarioKeys: InvestmentScenarioKey[] = ["conservative", "expected", "optimistic"];

const COPY = {
  en: {
    heading: "KeyHold Investment Simulator",
    title: "Model the deal before you commit.",
    intro: "Start with the project assumptions, then change any input. Every result recalculates immediately. Figures are illustrative estimates, not guaranteed returns.",
    selectedUnit: "Selected unit",
    unitLabel: (unitNumber: string, bedrooms: number, sizeSqft: string) => `Unit ${unitNumber} · ${bedrooms} BR · ${sizeSqft} sqft`,
    demoLabel: "Demo assumptions:",
    demoText: (status: string) => `this Module 4 dataset is intentionally marked ${status}. Verify official transaction fees, project service charges, rental evidence, financing terms and legal/tax implications before public launch or client reliance.`,
    scenario: "Scenario",
    stressActive: "Mechanical downside stress is active.",
    scenarioAdjusted: "Scenario inputs adjusted manually.",
    runStressTest: "Run mechanical stress test",
    stressRule: "Stress rule: rent −10%, occupancy −10 points, appreciation capped at 0%, rent growth capped at 0%, expense growth +2 points. This is a mechanical downside test, not a forecast.",
    purchasePrice: "Purchase price",
    expectedRent: "Expected annual rent",
    occupancy: "Occupancy",
    holdingPeriod: "Holding period",
    years: "years",
    financing: "Financing",
    financingCompare: "Compare cash purchase with an illustrative mortgage.",
    cash: "Cash",
    mortgage: "Mortgage",
    advanced: "Advanced assumptions",
    unitSize: "Unit size",
    serviceCharge: "Service charge / sqft",
    managementFee: "Management fee",
    maintenanceReserve: "Maintenance reserve",
    otherAnnual: "Other annual costs",
    furnishing: "Furnishing estimate",
    transferFee: "Transfer / registration fee",
    trusteeFee: "Trustee / admin fee",
    agencyFee: "Agency fee",
    otherOneOff: "Other one-time costs",
    handoverExtras: "Other handover costs",
    appreciation: "Annual appreciation",
    rentGrowth: "Annual rent growth",
    expenseGrowth: "Annual expense growth",
    sellingCost: "Exit selling costs",
    downPayment: "Down payment",
    interestRate: "Annual interest rate",
    mortgageTerm: "Mortgage term",
    mortgageReg: "Mortgage registration fee",
    mortgageAdmin: "Mortgage admin fee",
    grossYield: "Gross yield",
    grossYieldDetail: "Scheduled annual rent ÷ purchase price",
    effectiveGrossYield: "Effective gross yield",
    effectiveGrossYieldDetail: "Occupancy-adjusted rent ÷ purchase price",
    netYield: "Net yield",
    netYieldDetail: "Year-one NOI ÷ all-in acquisition cost",
    cashOnCash: "Cash-on-cash",
    netIncomePerYear: "Net income / year",
    cashOnCashDetail: "Year-one cash flow ÷ modelled acquisition cash",
    netIncomeDetail: "Year-one NOI after operating costs",
    modelAcquisitionCash: "Model acquisition cash",
    modelAcquisitionCashDetailMortgage: "Down payment + modelled one-time costs",
    modelAcquisitionCashDetailCash: "Full purchase + modelled one-time costs",
    totalRoi: (years: number) => `${years}Y total ROI`,
    totalRoiDetail: "Modelled sell outcome vs acquisition cash",
    annualisedReturn: "Annualised return*",
    annualisedReturnDetail: "Equivalent annual rate from total modelled ROI; not IRR",
    equityMultiple: "Equity multiple",
    equityMultipleDetail: "Modelled sell outcome ÷ acquisition cash",
    trueCost: "True cost of ownership · acquisition",
    trueCostDetail: "Purchase price plus the one-time assumptions currently included in this model.",
    costPurchasePrice: "Purchase price",
    costTransferReg: "Transfer / registration",
    costTrusteeAdmin: "Trustee / admin",
    costAgency: "Agency",
    costFurnishing: "Furnishing",
    costOtherOneOff: "Other one-time costs",
    costHandoverExtras: "Other handover costs",
    costMortgageRegAdmin: "Mortgage registration / admin",
    yearOneRental: "Year-one rental economics",
    scheduledRent: "Scheduled rent",
    collectedRent: "Collected rent after occupancy",
    serviceChargeRow: "Service charge",
    operatingCostsTotal: "Operating costs total",
    netOperatingIncome: "Net operating income",
    debtService: "Debt service",
    netCashFlow: "Net cash flow",
    breakEvenRent: "Break-even headline rent",
    modelledMortgage: (loan: string, monthly: string) => `Modelled mortgage: ${loan} loan · ${monthly} / month. Off-plan financing timing can differ and must be confirmed with a lender.`,
    exitAfter: (years: number) => `Exit after ${years} years`,
    projectedValue: "Projected property value",
    remainingLoan: "Remaining loan",
    equityIfHeld: "Equity if held",
    holdOutcome: "Hold outcome + rental cash flow",
    sellingCosts: "Selling costs",
    netSaleProceeds: "Net sale proceeds",
    sellOutcome: "Sell outcome + rental cash flow",
    modelledProfit: "Modelled profit if sold",
    cashVsMortgage: "Cash vs mortgage",
    cashVsMortgageTitle: "Same property, different capital structure.",
    cashVsMortgageNote: "Mortgage figures use the editable rate, down payment and term above. Financing approval, timing and off-plan eligibility must be confirmed by a lender.",
    totalRoiSuffix: "total ROI",
    monthlyMortgage: "Monthly mortgage",
    yearOneCashFlow: "Year-one cash flow",
    paymentPlanTimeline: "Payment plan & cash requirement timeline",
    paymentPlanTitle: "See the staged capital exposure.",
    paymentPlanNote: "Amounts are calculated from the current purchase-price input. Timing labels are copied from the project record and do not create contractual payment dates.",
    initialMilestone: "Initial milestone",
    initialMilestoneDetail: "Milestones classified as booking/reservation/initial",
    beforeHandover: "Before handover",
    beforeHandoverDetail: "Initial + construction-classified milestones",
    handoverMilestone: "Handover milestone",
    handoverMilestoneDetail: "Milestones explicitly classified as handover",
    handoverCashEstimate: "Handover cash estimate",
    handoverCashEstimateDetail: "Handover milestone + furnishing + editable handover extras",
    unclassified: (amount: string) => `Milestones are classified from their project labels. Unclassified milestone amount: ${amount}. Do not treat this timeline as contractual dates or a statement of when DLD/registration/financing charges are payable.`,
    scenarioComparison: "Scenario comparison",
    scenarioComparisonTitle: "Conservative, expected and optimistic side by side.",
    scenarioComparisonNote: "These are editable analytical assumptions, not probabilities or guaranteed outcomes.",
    tableScenario: "Scenario",
    tableGrossYield: "Gross yield",
    tableNetYield: "Net yield",
    tableRoi: (years: number) => `${years}Y ROI`,
    tableFutureValue: "Future value",
    tableCashFlow: "Year-1 cash flow",
    projection: "Projection",
    projectionTitle: "Property value and annual cash flow.",
    adjusted: " · adjusted",
    year: "Year",
    valueLabel: "value",
    cashFlowLabel: "cash flow",
    important: "Important:",
    importantText: "this simulator is an analytical estimate only. It does not guarantee rental income, occupancy, capital appreciation, financing approval, Golden Visa eligibility or resale value. Fees and regulations can change. Confirm project-specific charges, official registrations, lender terms, tax treatment and professional advice before committing funds.",
    offPlanNote: " Off-plan mortgage availability and timing can differ materially from this simplified financing model.",
    modelFootnote: (title: string) => `Model: ${title}. Gross yield uses scheduled headline rent ÷ purchase price. Effective gross yield applies occupancy. Net yield uses year-one net operating income ÷ modelled all-in acquisition cost. Total ROI assumes a sale at the selected horizon and includes modelled rental cash flow. Annualised return is derived from that total ROI and is not an IRR because exact transaction/payment dates are not modelled.`,
  },
  fr: {
    heading: "Simulateur d’investissement KeyHold",
    title: "Modélisez l’opération avant de vous engager.",
    intro: "Partez des hypothèses du projet, puis modifiez n’importe quelle valeur. Chaque résultat se recalcule immédiatement. Les chiffres sont des estimations illustratives, non des rendements garantis.",
    selectedUnit: "Unité sélectionnée",
    unitLabel: (unitNumber: string, bedrooms: number, sizeSqft: string) => `Unité ${unitNumber} · ${bedrooms} ch. · ${sizeSqft} pi²`,
    demoLabel: "Hypothèses de démonstration :",
    demoText: (status: string) => `ce jeu de données du Module 4 est volontairement marqué ${status}. Vérifiez les frais de transaction officiels, les charges de service du projet, les preuves locatives, les conditions de financement et les implications juridiques/fiscales avant le lancement public ou toute utilisation client.`,
    scenario: "Scénario",
    stressActive: "Le test de résistance mécanique à la baisse est actif.",
    scenarioAdjusted: "Hypothèses de scénario ajustées manuellement.",
    runStressTest: "Lancer le test de résistance mécanique",
    stressRule: "Règle du test : loyer −10 %, occupation −10 points, appréciation plafonnée à 0 %, croissance du loyer plafonnée à 0 %, croissance des charges +2 points. Il s’agit d’un test mécanique à la baisse, non d’une prévision.",
    purchasePrice: "Prix d’achat",
    expectedRent: "Loyer annuel attendu",
    occupancy: "Occupation",
    holdingPeriod: "Durée de détention",
    years: "ans",
    financing: "Financement",
    financingCompare: "Comparez un achat comptant à un prêt hypothécaire illustratif.",
    cash: "Comptant",
    mortgage: "Prêt hypothécaire",
    advanced: "Hypothèses avancées",
    unitSize: "Surface de l’unité",
    serviceCharge: "Charges de service / pi²",
    managementFee: "Frais de gestion",
    maintenanceReserve: "Réserve d’entretien",
    otherAnnual: "Autres coûts annuels",
    furnishing: "Estimation d’ameublement",
    transferFee: "Frais de transfert / enregistrement",
    trusteeFee: "Frais de fiduciaire / administration",
    agencyFee: "Frais d’agence",
    otherOneOff: "Autres coûts ponctuels",
    handoverExtras: "Autres frais de livraison",
    appreciation: "Appréciation annuelle",
    rentGrowth: "Croissance annuelle du loyer",
    expenseGrowth: "Croissance annuelle des charges",
    sellingCost: "Frais de vente à la sortie",
    downPayment: "Apport initial",
    interestRate: "Taux d’intérêt annuel",
    mortgageTerm: "Durée du prêt",
    mortgageReg: "Frais d’enregistrement du prêt",
    mortgageAdmin: "Frais administratifs du prêt",
    grossYield: "Rendement brut",
    grossYieldDetail: "Loyer annuel prévu ÷ prix d’achat",
    effectiveGrossYield: "Rendement brut effectif",
    effectiveGrossYieldDetail: "Loyer ajusté à l’occupation ÷ prix d’achat",
    netYield: "Rendement net",
    netYieldDetail: "RNE année 1 ÷ coût d’acquisition tout compris",
    cashOnCash: "Rendement sur capital investi",
    netIncomePerYear: "Revenu net / an",
    cashOnCashDetail: "Flux de trésorerie année 1 ÷ trésorerie d’acquisition modélisée",
    netIncomeDetail: "RNE année 1 après charges d’exploitation",
    modelAcquisitionCash: "Trésorerie d’acquisition modélisée",
    modelAcquisitionCashDetailMortgage: "Apport initial + coûts ponctuels modélisés",
    modelAcquisitionCashDetailCash: "Prix d’achat complet + coûts ponctuels modélisés",
    totalRoi: (years: number) => `ROI total sur ${years} ans`,
    totalRoiDetail: "Résultat de vente modélisé vs trésorerie d’acquisition",
    annualisedReturn: "Rendement annualisé*",
    annualisedReturnDetail: "Taux annuel équivalent au ROI total modélisé ; ce n’est pas un TRI",
    equityMultiple: "Multiple de capital",
    equityMultipleDetail: "Résultat de vente modélisé ÷ trésorerie d’acquisition",
    trueCost: "Coût réel de possession · acquisition",
    trueCostDetail: "Prix d’achat plus les hypothèses ponctuelles actuellement incluses dans ce modèle.",
    costPurchasePrice: "Prix d’achat",
    costTransferReg: "Transfert / enregistrement",
    costTrusteeAdmin: "Fiduciaire / administration",
    costAgency: "Agence",
    costFurnishing: "Ameublement",
    costOtherOneOff: "Autres coûts ponctuels",
    costHandoverExtras: "Autres frais de livraison",
    costMortgageRegAdmin: "Enregistrement / administration du prêt",
    yearOneRental: "Économie locative de l’année 1",
    scheduledRent: "Loyer prévu",
    collectedRent: "Loyer perçu après occupation",
    serviceChargeRow: "Charges de service",
    operatingCostsTotal: "Total des charges d’exploitation",
    netOperatingIncome: "Revenu net d’exploitation",
    debtService: "Service de la dette",
    netCashFlow: "Flux de trésorerie net",
    breakEvenRent: "Loyer d’équilibre affiché",
    modelledMortgage: (loan: string, monthly: string) => `Prêt modélisé : ${loan} · ${monthly} / mois. Le calendrier de financement sur plan peut différer et doit être confirmé auprès d’un prêteur.`,
    exitAfter: (years: number) => `Sortie après ${years} ans`,
    projectedValue: "Valeur du bien projetée",
    remainingLoan: "Solde du prêt restant",
    equityIfHeld: "Capital si conservé",
    holdOutcome: "Résultat de détention + flux locatif",
    sellingCosts: "Frais de vente",
    netSaleProceeds: "Produit net de la vente",
    sellOutcome: "Résultat de vente + flux locatif",
    modelledProfit: "Profit modélisé en cas de vente",
    cashVsMortgage: "Comptant vs prêt hypothécaire",
    cashVsMortgageTitle: "Même bien, structure de capital différente.",
    cashVsMortgageNote: "Les chiffres du prêt utilisent le taux, l’apport et la durée modifiables ci-dessus. L’approbation, le calendrier et l’éligibilité sur plan doivent être confirmés par un prêteur.",
    totalRoiSuffix: "ROI total",
    monthlyMortgage: "Mensualité du prêt",
    yearOneCashFlow: "Flux de trésorerie année 1",
    paymentPlanTimeline: "Plan de paiement et calendrier de trésorerie requise",
    paymentPlanTitle: "Visualisez l’exposition en capital échelonnée.",
    paymentPlanNote: "Les montants sont calculés à partir du prix d’achat actuel. Les mentions de calendrier proviennent de la fiche projet et ne créent pas de dates de paiement contractuelles.",
    initialMilestone: "Étape initiale",
    initialMilestoneDetail: "Étapes classées comme réservation/initiale",
    beforeHandover: "Avant livraison",
    beforeHandoverDetail: "Étapes initiales + classées construction",
    handoverMilestone: "Étape de livraison",
    handoverMilestoneDetail: "Étapes explicitement classées comme livraison",
    handoverCashEstimate: "Estimation de trésorerie à la livraison",
    handoverCashEstimateDetail: "Étape de livraison + ameublement + frais de livraison modifiables",
    unclassified: (amount: string) => `Les étapes sont classées à partir des libellés du projet. Montant non classé : ${amount}. Ne traitez pas ce calendrier comme des dates contractuelles ni comme une indication du moment où les frais DLD/enregistrement/financement sont exigibles.`,
    scenarioComparison: "Comparaison des scénarios",
    scenarioComparisonTitle: "Conservateur, attendu et optimiste, côte à côte.",
    scenarioComparisonNote: "Il s’agit d’hypothèses analytiques modifiables, non de probabilités ou de résultats garantis.",
    tableScenario: "Scénario",
    tableGrossYield: "Rendement brut",
    tableNetYield: "Rendement net",
    tableRoi: (years: number) => `ROI sur ${years} ans`,
    tableFutureValue: "Valeur future",
    tableCashFlow: "Flux année 1",
    projection: "Projection",
    projectionTitle: "Valeur du bien et flux de trésorerie annuel.",
    adjusted: " · ajusté",
    year: "Année",
    valueLabel: "valeur",
    cashFlowLabel: "flux de trésorerie",
    important: "Important :",
    importantText: "ce simulateur est une estimation analytique uniquement. Il ne garantit ni revenu locatif, ni occupation, ni appréciation du capital, ni approbation de financement, ni éligibilité au Golden Visa, ni valeur de revente. Les frais et réglementations peuvent changer. Confirmez les frais spécifiques au projet, les enregistrements officiels, les conditions du prêteur, le traitement fiscal et l’avis d’un professionnel avant tout engagement financier.",
    offPlanNote: " La disponibilité et le calendrier du financement sur plan peuvent différer sensiblement de ce modèle de financement simplifié.",
    modelFootnote: (title: string) => `Modèle : ${title}. Le rendement brut utilise le loyer affiché prévu ÷ prix d’achat. Le rendement brut effectif applique l’occupation. Le rendement net utilise le revenu net d’exploitation de l’année 1 ÷ coût d’acquisition tout compris modélisé. Le ROI total suppose une vente à l’horizon sélectionné et inclut le flux locatif modélisé. Le rendement annualisé est dérivé de ce ROI total et n’est pas un TRI car les dates exactes de transaction/paiement ne sont pas modélisées.`,
  },
} as const;

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
  locale?: KeyHoldLocale;
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
  locale = "en",
}: InvestmentSimulatorProps) {
  const copy = COPY[locale];
  const searchParams = useSearchParams();
  const investmentUnitId = units ? searchParams.get("investmentUnit") : null;
  const selectedUnit = investmentUnitId
    ? units?.find((unit) => unit.id === investmentUnitId && unit.priceAed !== null)
    : undefined;
  const resolvedPurchasePriceAed = selectedUnit?.priceAed ?? defaultPurchasePriceAed;
  const resolvedUnitSizeSqft = selectedUnit?.sizeSqft ?? defaultUnitSizeSqft;
  const resolvedUnitLabel = selectedUnit
    ? copy.unitLabel(selectedUnit.unitNumber, selectedUnit.bedrooms, selectedUnit.sizeSqft.toLocaleString("en-US"))
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
            <p className="eyebrow">{copy.heading}</p>
            <h3 className="font-display mt-3 text-3xl sm:text-4xl">{copy.title}</h3>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-stone)]">
              {copy.intro}
            </p>
          </div>
          {resolvedUnitLabel ? (
            <div className="border border-black/10 bg-[var(--color-bone)] px-4 py-3 text-sm">
              <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.selectedUnit}</span>
              <strong className="mt-1 block font-medium">{resolvedUnitLabel}</strong>
            </div>
          ) : null}
        </div>
      ) : resolvedUnitLabel ? (
        <div className="inline-block border border-black/10 bg-[var(--color-bone)] px-4 py-3 text-sm">
          <span className="block text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-stone)]">{copy.selectedUnit}</span>
          <strong className="mt-1 block font-medium">{resolvedUnitLabel}</strong>
        </div>
      ) : null}

      <div className="border border-[var(--color-champagne)]/45 bg-[var(--color-champagne-soft)] p-4 text-xs leading-6 text-[var(--color-stone)]">
        <strong className="text-[var(--color-graphite)]">{copy.demoLabel}</strong> {copy.demoText(profile.status)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6 border border-black/10 p-5 sm:p-6">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.scenario}</p>
            <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Investment scenario">
              {scenarioKeys.map((key) => {
                const active = scenarioKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyScenario(key)}
                    aria-pressed={active}
                    className={`min-h-11 border px-2 text-xs font-medium transition-colors sm:px-4 ${active ? "border-[var(--color-teal)] bg-[var(--color-teal)] text-white" : "border-black/10 hover:bg-[var(--color-bone)]"}`}
                  >
                    {profile.scenarios[key].label}
                  </button>
                );
              })}
            </div>
            {edited ? <p className="mt-2 text-xs text-[var(--color-stone)]">{stressActive ? copy.stressActive : copy.scenarioAdjusted}</p> : null}
            <button
              type="button"
              onClick={runStressTest}
              className="mt-3 min-h-11 w-full border border-black/10 px-4 text-xs font-semibold transition-colors hover:border-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-soft)]"
            >
              {copy.runStressTest}
            </button>
            <p className="mt-2 text-[0.68rem] leading-5 text-[var(--color-stone)]">{copy.stressRule}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id={fieldId(projectSlug, "price")}
              label={copy.purchasePrice}
              value={inputs.purchasePriceAed}
              prefix="AED"
              step={10_000}
              onChange={(value) => updateNumber("purchasePriceAed", value, { min: 1 })}
            />
            <NumberField
              id={fieldId(projectSlug, "rent")}
              label={copy.expectedRent}
              value={inputs.annualRentAed}
              prefix="AED"
              step={5_000}
              onChange={(value) => updateNumber("annualRentAed", value)}
            />
            <NumberField
              id={fieldId(projectSlug, "occupancy")}
              label={copy.occupancy}
              value={inputs.occupancyPct}
              suffix="%"
              step={1}
              onChange={(value) => updateNumber("occupancyPct", value, { max: 100 })}
            />
            <NumberField
              id={fieldId(projectSlug, "hold")}
              label={copy.holdingPeriod}
              value={inputs.holdYears}
              suffix={copy.years}
              step={1}
              onChange={(value) => updateNumber("holdYears", value, { min: 1, max: 30 })}
            />
          </div>

          <div className="border-t border-black/10 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{copy.financing}</p>
                <p className="mt-1 text-xs text-[var(--color-stone)]">{copy.financingCompare}</p>
              </div>
              <div className="inline-flex border border-black/10 p-1">
                <button type="button" onClick={() => update("useMortgage", false)} aria-pressed={!inputs.useMortgage} className={`min-h-10 px-4 text-xs font-medium ${!inputs.useMortgage ? "bg-[var(--color-teal)] text-white" : "hover:bg-[var(--color-bone)]"}`}>{copy.cash}</button>
                <button type="button" onClick={() => update("useMortgage", true)} aria-pressed={inputs.useMortgage} className={`min-h-10 px-4 text-xs font-medium ${inputs.useMortgage ? "bg-[var(--color-teal)] text-white" : "hover:bg-[var(--color-bone)]"}`}>{copy.mortgage}</button>
              </div>
            </div>
          </div>

          <details className="group border-t border-black/10 pt-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium">
              {copy.advanced}
              <span aria-hidden="true" className="text-[var(--color-champagne-ink)] transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField id={fieldId(projectSlug, "size")} label={copy.unitSize} value={inputs.unitSizeSqft} suffix="sqft" step={10} onChange={(value) => updateNumber("unitSizeSqft", value)} />
              <NumberField id={fieldId(projectSlug, "service")} label={copy.serviceCharge} value={inputs.serviceChargePerSqftAed} prefix="AED" step={1} onChange={(value) => updateNumber("serviceChargePerSqftAed", value)} />
              <NumberField id={fieldId(projectSlug, "management")} label={copy.managementFee} value={inputs.managementFeePct} suffix="%" step={0.25} onChange={(value) => updateNumber("managementFeePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "maintenance")} label={copy.maintenanceReserve} value={inputs.maintenanceReservePct} suffix="%" step={0.25} onChange={(value) => updateNumber("maintenanceReservePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "otherannual")} label={copy.otherAnnual} value={inputs.otherAnnualCostsAed} prefix="AED" step={500} onChange={(value) => updateNumber("otherAnnualCostsAed", value)} />
              <NumberField id={fieldId(projectSlug, "furnishing")} label={copy.furnishing} value={inputs.furnishingEstimateAed} prefix="AED" step={5_000} onChange={(value) => updateNumber("furnishingEstimateAed", value)} />
              <NumberField id={fieldId(projectSlug, "transferfee")} label={copy.transferFee} value={inputs.transferRegistrationFeePct} suffix="%" step={0.1} onChange={(value) => updateNumber("transferRegistrationFeePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "trustee")} label={copy.trusteeFee} value={inputs.trusteeAdminFeeAed} prefix="AED" step={100} onChange={(value) => updateNumber("trusteeAdminFeeAed", value)} />
              <NumberField id={fieldId(projectSlug, "agency")} label={copy.agencyFee} value={inputs.agencyFeePct} suffix="%" step={0.1} onChange={(value) => updateNumber("agencyFeePct", value, { max: 100 })} />
              <NumberField id={fieldId(projectSlug, "otheroneoff")} label={copy.otherOneOff} value={inputs.otherOneTimeCostsAed} prefix="AED" step={500} onChange={(value) => updateNumber("otherOneTimeCostsAed", value)} />
              <NumberField id={fieldId(projectSlug, "handoverextras")} label={copy.handoverExtras} value={inputs.handoverAdditionalCostsAed} prefix="AED" step={500} onChange={(value) => updateNumber("handoverAdditionalCostsAed", value)} />
              <NumberField id={fieldId(projectSlug, "appreciation")} label={copy.appreciation} value={inputs.annualAppreciationPct} suffix="%" step={0.25} onChange={(value) => updateNumber("annualAppreciationPct", value, { min: -20, max: 30 })} />
              <NumberField id={fieldId(projectSlug, "rentgrowth")} label={copy.rentGrowth} value={inputs.annualRentGrowthPct} suffix="%" step={0.25} onChange={(value) => updateNumber("annualRentGrowthPct", value, { min: -20, max: 30 })} />
              <NumberField id={fieldId(projectSlug, "expensegrowth")} label={copy.expenseGrowth} value={inputs.annualExpenseGrowthPct} suffix="%" step={0.25} onChange={(value) => updateNumber("annualExpenseGrowthPct", value, { min: -20, max: 30 })} />
              <NumberField id={fieldId(projectSlug, "sellingcost")} label={copy.sellingCost} value={inputs.sellingCostPct} suffix="%" step={0.1} onChange={(value) => updateNumber("sellingCostPct", value, { max: 100 })} />
              {inputs.useMortgage ? (
                <>
                  <NumberField id={fieldId(projectSlug, "downpayment")} label={copy.downPayment} value={inputs.downPaymentPct} suffix="%" step={1} onChange={(value) => updateNumber("downPaymentPct", value, { max: 100 })} />
                  <NumberField id={fieldId(projectSlug, "interest")} label={copy.interestRate} value={inputs.annualInterestRatePct} suffix="%" step={0.05} onChange={(value) => updateNumber("annualInterestRatePct", value, { max: 30 })} />
                  <NumberField id={fieldId(projectSlug, "term")} label={copy.mortgageTerm} value={inputs.mortgageTermYears} suffix={copy.years} step={1} onChange={(value) => updateNumber("mortgageTermYears", value, { min: 1, max: 35 })} />
                  <NumberField id={fieldId(projectSlug, "mortgagereg")} label={copy.mortgageReg} value={inputs.mortgageRegistrationFeePct} suffix="%" step={0.05} onChange={(value) => updateNumber("mortgageRegistrationFeePct", value, { max: 100 })} />
                  <NumberField id={fieldId(projectSlug, "mortgageadmin")} label={copy.mortgageAdmin} value={inputs.mortgageRegistrationAdminFeeAed} prefix="AED" step={10} onChange={(value) => updateNumber("mortgageRegistrationAdminFeeAed", value)} />
                </>
              ) : null}
            </div>
          </details>
        </div>

        <div className="space-y-6" aria-live="polite">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label={copy.grossYield} value={formatPercent(result.grossYieldPct)} detail={copy.grossYieldDetail} />
            <MetricCard label={copy.effectiveGrossYield} value={formatPercent(result.effectiveGrossYieldPct)} detail={copy.effectiveGrossYieldDetail} />
            <MetricCard label={copy.netYield} value={formatPercent(result.netYieldPct)} detail={copy.netYieldDetail} />
            <MetricCard label={inputs.useMortgage ? copy.cashOnCash : copy.netIncomePerYear} value={inputs.useMortgage ? formatPercent(result.cashOnCashPct) : formatAed(result.netAnnualCashFlowYear1Aed, { compact: true })} detail={inputs.useMortgage ? copy.cashOnCashDetail : copy.netIncomeDetail} />
            <MetricCard label={copy.modelAcquisitionCash} value={formatAed(result.initialCashRequiredAed, { compact: true })} detail={inputs.useMortgage ? copy.modelAcquisitionCashDetailMortgage : copy.modelAcquisitionCashDetailCash} />
            <MetricCard label={copy.totalRoi(inputs.holdYears)} value={formatPercent(result.totalRoiPct)} detail={copy.totalRoiDetail} />
            <MetricCard label={copy.annualisedReturn} value={formatPercent(result.annualizedReturnPct)} detail={copy.annualisedReturnDetail} />
            <MetricCard label={copy.equityMultiple} value={`${result.equityMultiple.toFixed(2)}×`} detail={copy.equityMultipleDetail} />
          </div>

          <div className="border border-black/10 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.trueCost}</p>
                <p className="font-display mt-2 text-3xl">{formatAed(result.allInAcquisitionCostAed, { compact: true })}</p>
              </div>
              <p className="max-w-xs text-right text-xs leading-5 text-[var(--color-stone)]">{copy.trueCostDetail}</p>
            </div>
            <div className="mt-5 space-y-3">
              <CostRow label={copy.costPurchasePrice} value={result.purchasePriceAed} />
              <CostRow label={copy.costTransferReg} value={result.transferRegistrationFeeAed} />
              <CostRow label={copy.costTrusteeAdmin} value={result.trusteeAdminFeeAed} />
              <CostRow label={copy.costAgency} value={result.agencyFeeAed} />
              <CostRow label={copy.costFurnishing} value={result.furnishingEstimateAed} />
              <CostRow label={copy.costOtherOneOff} value={result.otherOneTimeCostsAed} />
              <CostRow label={copy.costHandoverExtras} value={result.handoverAdditionalCostsAed} />
              {inputs.useMortgage ? <CostRow label={copy.costMortgageRegAdmin} value={result.mortgageRegistrationCostAed} /> : null}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-black/10 p-5 sm:p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.yearOneRental}</p>
              <div className="mt-5 space-y-3">
                <CostRow label={copy.scheduledRent} value={result.scheduledRentYear1Aed} />
                <CostRow label={copy.collectedRent} value={result.collectedRentYear1Aed} />
                <CostRow label={copy.serviceChargeRow} value={-result.serviceChargeYear1Aed} signed />
                <CostRow label={copy.operatingCostsTotal} value={-result.operatingCostsYear1Aed} signed />
                <CostRow label={copy.netOperatingIncome} value={result.netOperatingIncomeYear1Aed} strong />
                {inputs.useMortgage ? <CostRow label={copy.debtService} value={-result.annualDebtServiceYear1Aed} signed /> : null}
                <CostRow label={copy.netCashFlow} value={result.netAnnualCashFlowYear1Aed} signed strong />
                <CostRow label={copy.breakEvenRent} value={result.breakEvenAnnualRentAed} />
              </div>
              {inputs.useMortgage ? (
                <div className="mt-5 border-t border-black/10 pt-4 text-xs leading-6 text-[var(--color-stone)]">
                  {copy.modelledMortgage(formatAed(result.loanAmountAed, { compact: true }), formatAed(result.monthlyMortgagePaymentAed))}
                </div>
              ) : null}
            </div>

            <div className="border border-black/10 p-5 sm:p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.exitAfter(inputs.holdYears)}</p>
              <div className="mt-5 space-y-3">
                <CostRow label={copy.projectedValue} value={result.futurePropertyValueAed} />
                {inputs.useMortgage ? <CostRow label={copy.remainingLoan} value={-result.remainingLoanBalanceAtExitAed} signed /> : null}
                <CostRow label={copy.equityIfHeld} value={result.equityAtHorizonAed} strong />
                <CostRow label={copy.holdOutcome} value={result.holdOutcomeValueAed} signed />
                <CostRow label={copy.sellingCosts} value={-result.exitSellingCostsAed} signed />
                <CostRow label={copy.netSaleProceeds} value={result.netSaleProceedsAed} strong />
                <CostRow label={copy.sellOutcome} value={result.sellOutcomeValueAed} signed />
                <CostRow label={copy.modelledProfit} value={result.totalProfitAed} signed strong />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-black/10 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.cashVsMortgage}</p>
            <h4 className="font-display mt-2 text-2xl">{copy.cashVsMortgageTitle}</h4>
          </div>
          <p className="text-xs leading-6 text-[var(--color-stone)] lg:text-right">{copy.cashVsMortgageNote}</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FinancingComparisonCard label={copy.cash} result={cashComparison} roiSuffix={copy.totalRoiSuffix} modelAcquisitionCashLabel={copy.modelAcquisitionCash} monthlyLabel={copy.monthlyMortgage} yearOneLabel={copy.yearOneCashFlow} netYieldLabel={copy.netYield} equityMultipleLabel={copy.equityMultiple} />
          <FinancingComparisonCard label={copy.mortgage} result={mortgageComparison} roiSuffix={copy.totalRoiSuffix} modelAcquisitionCashLabel={copy.modelAcquisitionCash} monthlyLabel={copy.monthlyMortgage} yearOneLabel={copy.yearOneCashFlow} netYieldLabel={copy.netYield} equityMultipleLabel={copy.equityMultiple} showMonthlyPayment />
        </div>
      </div>

      {paymentSchedule.length > 0 ? (
        <div className="border border-black/10 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.paymentPlanTimeline}</p>
              <h4 className="font-display mt-2 text-2xl">{copy.paymentPlanTitle}</h4>
            </div>
            <p className="text-xs leading-6 text-[var(--color-stone)] lg:text-right">{copy.paymentPlanNote}</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={copy.initialMilestone} value={formatAed(paymentSummary.initialAed, { compact: true })} detail={copy.initialMilestoneDetail} />
            <MetricCard label={copy.beforeHandover} value={formatAed(paymentSummary.initialAed + paymentSummary.preHandoverAed, { compact: true })} detail={copy.beforeHandoverDetail} />
            <MetricCard label={copy.handoverMilestone} value={formatAed(paymentSummary.handoverAed, { compact: true })} detail={copy.handoverMilestoneDetail} />
            <MetricCard label={copy.handoverCashEstimate} value={formatAed(handoverCashEstimateAed, { compact: true })} detail={copy.handoverCashEstimateDetail} />
          </div>
          <div className="mt-4 text-[0.68rem] leading-5 text-[var(--color-stone)]">{copy.unclassified(formatAed(paymentSummary.unclassifiedAed))}</div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {paymentSchedule.map((item) => (
              <div key={`${item.label}-${item.timing}`} className="border border-black/10 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <strong className="text-sm font-medium">{item.label}</strong>
                  <span className="font-display text-2xl">{item.percentage}%</span>
                </div>
                <div className="mt-3 h-1.5 bg-[var(--color-warm-grey)]" aria-hidden="true">
                  <div className="h-full bg-[var(--color-teal)] transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }} />
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.scenarioComparison}</p>
            <h4 className="font-display mt-2 text-2xl">{copy.scenarioComparisonTitle}</h4>
          </div>
          <p className="max-w-md text-xs leading-6 text-[var(--color-stone)]">{copy.scenarioComparisonNote}</p>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-stone)]">
                <th className="py-3 pr-4 font-semibold">{copy.tableScenario}</th>
                <th className="px-4 py-3 font-semibold">{copy.tableGrossYield}</th>
                <th className="px-4 py-3 font-semibold">{copy.tableNetYield}</th>
                <th className="px-4 py-3 font-semibold">{copy.tableRoi(inputs.holdYears)}</th>
                <th className="px-4 py-3 font-semibold">{copy.tableFutureValue}</th>
                <th className="pl-4 py-3 font-semibold">{copy.tableCashFlow}</th>
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]">{copy.projection}</p>
            <h4 className="font-display mt-2 text-2xl">{copy.projectionTitle}</h4>
          </div>
          <p className="text-xs text-[var(--color-stone)]">{profile.scenarios[scenarioKey].label}{edited ? copy.adjusted : ""}</p>
        </div>
        <div className="mt-6 space-y-4">
          {result.years.map((year) => {
            const width = Math.max(2, year.propertyValueAed / maxProjectionValue * 100);
            return (
              <div key={year.year} className="grid gap-2 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
                <span className="text-xs font-medium">{copy.year} {year.year}</span>
                <div className="h-2 bg-[var(--color-warm-grey)]" aria-hidden="true">
                  <div className="h-full bg-[var(--color-sage)] transition-[width] duration-500" style={{ width: `${width}%` }} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:justify-end">
                  <span>{formatAed(year.propertyValueAed, { compact: true })} {copy.valueLabel}</span>
                  <span className={year.netCashFlowAed < 0 ? "text-[var(--color-terracotta-deep)]" : "text-[var(--color-sage-deep)]"}>{formatAed(year.netCashFlowAed, { compact: true })} {copy.cashFlowLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-l-2 border-[var(--color-teal)] pl-4 text-xs leading-6 text-[var(--color-stone)]">
        <strong className="text-[var(--color-graphite)]">{copy.important}</strong> {copy.importantText}{projectCategory === "Off-Plan" ? copy.offPlanNote : ""}
      </div>

      <div className="text-[0.68rem] leading-5 text-[var(--color-stone)]">
        {copy.modelFootnote(projectTitle)}
      </div>
    </div>
  );
}

function FinancingComparisonCard({
  label,
  result,
  showMonthlyPayment = false,
  roiSuffix,
  modelAcquisitionCashLabel,
  monthlyLabel,
  yearOneLabel,
  netYieldLabel,
  equityMultipleLabel,
}: {
  label: string;
  result: ReturnType<typeof calculateInvestment>;
  showMonthlyPayment?: boolean;
  roiSuffix: string;
  modelAcquisitionCashLabel: string;
  monthlyLabel: string;
  yearOneLabel: string;
  netYieldLabel: string;
  equityMultipleLabel: string;
}) {
  return (
    <div className="border border-black/10 bg-[var(--color-teal-soft)] p-5">
      <div className="flex items-baseline justify-between gap-4">
        <strong className="font-display text-2xl">{label}</strong>
        <span className="text-xs text-[var(--color-stone)]">{formatPercent(result.totalRoiPct)} {roiSuffix}</span>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <CostRow label={modelAcquisitionCashLabel} value={result.initialCashRequiredAed} />
        {showMonthlyPayment ? <CostRow label={monthlyLabel} value={result.monthlyMortgagePaymentAed} /> : null}
        <CostRow label={yearOneLabel} value={result.netAnnualCashFlowYear1Aed} signed />
        <CostRow label={netYieldLabel} value={result.netYieldPct} percent />
        <CostRow label={equityMultipleLabel} value={result.equityMultiple} multiple />
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
      <span className="flex min-h-12 items-center border border-black/10 bg-[var(--color-soft-white)] focus-within:border-[var(--color-teal)]">
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
      <span className={value < 0 ? "text-[var(--color-terracotta-deep)]" : signed && value > 0 ? "text-[var(--color-sage-deep)]" : ""}>{prefix}{formatted}</span>
    </div>
  );
}
