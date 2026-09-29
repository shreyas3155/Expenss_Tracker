import { NextRequest, NextResponse } from "next/server";
import { getTransactions, saveTransaction, updateTransaction, deleteTransaction } from "@/lib/db";
import { getCategoryRules, findCategoryForPayee } from "@/lib/rules";
import { BankTransaction } from "@/types/bankTransaction";

export const dynamic = "force-dynamic";

export const USER_ID = "3f7ae45f-527a-4179-9077-b6009df92b7e";

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

    // Resolve category using smart Payee Category Rules if default or unset
    let resolvedCategory = category;
    if (!resolvedCategory || resolvedCategory === "Other" || resolvedCategory === "Uncategorized") {
      try {
        const rules = await getCategoryRules(USER_ID);
        const match = findCategoryForPayee(String(payee), rules);
        if (match) {
          resolvedCategory = match.category;
        }
      } catch (err) {
        console.warn("Rule matching check failed:", err);
      }
    }

    const tx: BankTransaction = {
      id: id || `tx-${Date.now()}`,
      date: date || new Date().toISOString(),
      payee: String(payee),
      amount: Number(amount),
      category: resolvedCategory || "Other",
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required to update" },
        { status: 400 }
      );
    }

    const updated = await updateTransaction(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update transaction in Supabase" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required to delete" },
        { status: 400 }
      );
    }

    const deleted = await deleteTransaction(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete transaction from Supabase" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
