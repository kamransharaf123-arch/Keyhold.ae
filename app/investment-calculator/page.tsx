import type { Metadata } from "next";
import { Suspense } from "react";
import { InvestmentProjectPicker } from "@/components/investment/investment-project-picker";
import { projects } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Investment Calculator",
  description: "Model acquisition costs, rental economics, financing, payment plans and exit scenarios with the KeyHold investment calculator.",
  alternates: { canonical: "/investment-calculator" },
};

export default function InvestmentCalculatorPage() {
  const eligibleProjects = projects.filter((project) => project.investment && project.priceFromAed !== null);

  return (
    <>
      <section className="site-container py-14 lg:py-20">
        <p className="eyebrow">Investment tools</p>
        <h1 className="display-title mt-4 max-w-5xl text-5xl sm:text-6xl lg:text-7xl">Understand the whole investment, not just the headline price.</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-stone)]">
          Explore acquisition costs, gross and net rental yield, financing, annual cash flow, payment-plan exposure and modelled exit outcomes. All demo assumptions remain editable and must be verified before use in a live transaction.
        </p>
      </section>

      <section className="site-container pb-20">
        <Suspense fallback={<div className="text-sm text-[var(--color-stone)]">Loading investment calculator…</div>}>
          <InvestmentProjectPicker projects={eligibleProjects} />
        </Suspense>
      </section>
    </>
  );
}
