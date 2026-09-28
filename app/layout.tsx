import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spendly — Personal Finance & Bank Expense Tracker",
  description:
    "Real-time personal finance dashboard connected with Supabase PostgreSQL and automated bank email sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
      </head>
      <body className="min-h-screen w-full flex flex-col bg-[#F6F3EB] text-[#1A1A1A] overflow-x-clip selection:bg-[#F5D547] selection:text-black">
        {children}
      </body>
    </html>
  );
}
