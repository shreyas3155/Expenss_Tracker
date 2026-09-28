import { AnalyticsView } from "@/components/bank/AnalyticsView";

export const metadata = {
  title: "Category Spending Analytics & Charts — Spendly",
  description:
    "Visual breakdown of your expenses with interactive circular donut and bar charts, categorized by real data with custom date range selection.",
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen w-full bg-[#F6F3EB]">
      <AnalyticsView />
    </main>
  );
}
