import { AutomaticBankDashboard } from "@/components/bank/AutomaticBankDashboard";

export const metadata = {
  title: "Spendly — Automated Bank Email & Gemini AI Expense Tracker",
  description:
    "Real-time personal finance dashboard connected with Gmail, Gemini AI parser, and Google Sheets 10-column ledger.",
};

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#F6F3EB]">
      <AutomaticBankDashboard />
    </main>
  );
}

