import { NextRequest, NextResponse } from "next/server";
import { getTransactions, saveTransaction } from "@/lib/db";
import { BankTransaction } from "@/types/bankTransaction";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transactions", transactions: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      date,
      payee,
      amount,
      category,
      referenceNo,
      notes,
      bankNotification,
      messageId,
      type,
      source,
      aiParsed,
      aiModel,
    } = body;

    if (!payee || amount === undefined || amount === null) {
      return NextResponse.json(
        { success: false, error: "Payee and amount are required" },
        { status: 400 }
      );
    }

    const tx: BankTransaction = {
      id: id || `tx-${Date.now()}`,
      date: date || new Date().toISOString(),
      payee: String(payee),
      amount: Number(amount),
      category: category || "Other",
      referenceNo: referenceNo || `REF-${Date.now()}`,
      notes: notes || "",
      bankNotification: bankNotification || "",
      messageId: messageId || `manual_${Date.now()}`,
      type: type === "Credit" ? "Credit" : "Debit",
      source: source || "Manual Entry",
      aiParsed: aiParsed ?? true,
      aiModel: aiModel || "Gemini 1.5 Flash",
    };

    const saved = await saveTransaction(tx);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Failed to persist transaction to Supabase" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, transaction: tx }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save transaction" },
      { status: 500 }
    );
  }
}
