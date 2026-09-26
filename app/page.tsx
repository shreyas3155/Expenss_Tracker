import { AutomaticBankDashboard } from "@/components/bank/AutomaticBankDashboard";

export const metadata = {
  title: "Spendly — Personal Finance & Bank Expense Tracker",
  description:
    "Real-time personal finance dashboard connected with Supabase PostgreSQL and automated bank email sync.",
};

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#F6F3EB]">
      <AutomaticBankDashboard />
    </main>
  );
}

