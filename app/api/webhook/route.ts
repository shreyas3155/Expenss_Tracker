import { NextRequest, NextResponse } from "next/server";
import { BankTransaction } from "@/types/bankTransaction";
import { saveTransaction } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the 10 columns
    const {
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
    } = body;

    if (!payee || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: "Missing required fields: payee and amount are required" },
        { status: 400 }
      );
    }

    const newTx: BankTransaction = {
      id: messageId || `tx-${Date.now()}`,
      date: date || new Date().toISOString(),
      payee: String(payee),
      amount: Number(amount),
      category: category || "Uncategorized",
      referenceNo: referenceNo || `REF-${Date.now()}`,
      notes: notes || "Auto-parsed by Gemini AI via Google Apps Script",
      bankNotification: bankNotification || "",
      messageId: messageId || `msg_${Date.now()}`,
      type: (type === "Credit" || type === "credit") ? "Credit" : "Debit",
      source: source || "Bank Alert",
      aiParsed: true,
      aiModel: "Gemini AI",
    };

    await saveTransaction(newTx);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction recorded in Supabase PostgreSQL successfully from Google Apps Script",
        transaction: newTx,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process webhook payload", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    message: "Google Apps Script Webhook is live and ready to receive bank alert emails",
    samplePayload: {
      date: "2024-09-26 11:20 AM",
      payee: "Swiggy",
      amount: 450.0,
      category: "Food & Dining",
      referenceNo: "UPI/427019284102",
      notes: "Lunch order",
      bankNotification: "Alert: ₹450.00 debited from HDFC Bank A/c **4821 via UPI to Swiggy",
      messageId: "msg_18e9a1f4b2c1d999",
      type: "Debit",
      source: "HDFC Bank UPI",
    },
  });
}
