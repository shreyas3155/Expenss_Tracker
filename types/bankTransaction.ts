export type TransactionType = "Debit" | "Credit";

export interface BankTransaction {
  id: string;
  // Column 1: Date
  date: string; // e.g. "2024-09-26 10:45 AM" or ISO string
  // Column 2: Payee / Description
  payee: string; // e.g. "Swiggy", "Uber India", "Salary HDFC"
  // Column 3: Amount
  amount: number; // e.g. 450.00
  // Column 4: Category
  category: string; // e.g. "Food & Dining", "Transport", "Shopping", "Salary"
  // Column 5: Reference No. / UTR
  referenceNo: string; // e.g. "426910482910"
  // Column 6: Notes
  notes: string; // e.g. "Auto-parsed by Gemini AI"
  // Column 7: Bank Notification / Details
  bankNotification: string; // Raw alert: "Dear Customer, ₹450.00 debited from A/C **4821 on 26-SEP-24 to Swiggy UPI Ref 426910482910."
  // Column 8: Message ID
  messageId: string; // Gmail Message ID: e.g. "18e5f2a1b9c0d3e4"
  // Column 9: Type (Credit / Debit)
  type: TransactionType;
  // Column 10: Source / Method
  source: string; // e.g. "HDFC Bank UPI", "GPay", "PhonePe", "ICICI NetBanking"

  // AI Parser metadata
  aiParsed?: boolean;
  aiModel?: string; // e.g. "Gemini 1.5 Flash"
  tags?: string[];
}

export type TimeframeFilter = "all" | "today" | "week" | "month" | "custom";

export interface FilterState {
  timeframe: TimeframeFilter;
  customStartDate?: string;
  customEndDate?: string;
  type: "all" | "debit" | "credit";
  category: string;
  source: string;
  searchQuery: string;
}

export interface ExpenseSummary {
  totalDebits: number;
  totalCredits: number;
  netCashFlow: number;
  transactionCount: number;
  debitCount: number;
  creditCount: number;
  aiParsedCount: number;
}
