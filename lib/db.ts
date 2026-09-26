import { supabase, USER_ID } from "./supabase";
import { BankTransaction } from "@/types/bankTransaction";

export { USER_ID };

/**
 * Fetch all transactions from Supabase filtered by user_id = '3f7ae45f-527a-4179-9077-b6009df92b7e'
 * Returns all rows mapped to BankTransaction format.
 */
export async function getTransactions(): Promise<BankTransaction[]> {
  try {
    const { data: dbTransactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", USER_ID)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transactions from Supabase:", error);
      return [];
    }

    if (!dbTransactions || dbTransactions.length === 0) {
      return [];
    }

    return dbTransactions.map((tx: any) => ({
      id: tx.id,
      date: tx.date || "",
      payee: tx.merchant || tx.payee || "Unknown Payee",
      amount: Number(tx.amount) || 0,
      category: tx.category || "Other",
      referenceNo: tx.upi_ref || tx.referenceNo || "N/A",
      notes: tx.note || tx.notes || "",
      bankNotification: tx.raw_message || tx.bankNotification || "",
      messageId: tx.email_id || tx.messageId || tx.id,
      type: (tx.type === "Credit" ? "Credit" : "Debit") as "Credit" | "Debit",
      source: tx.parsed_by || tx.source || "Supabase",
      aiParsed: Boolean(tx.parsed_by?.toLowerCase().includes("ai")),
      aiModel: tx.parsed_by || "Gemini 1.5 Flash",
    }));
  } catch (error) {
    console.error("Error fetching transactions from Supabase:", error);
    return [];
  }
}

/**
 * Save new transaction into Supabase PostgreSQL
 */
export async function saveTransaction(tx: BankTransaction): Promise<boolean> {
  try {
    const { error } = await supabase.from("transactions").upsert({
      id: tx.id,
      user_id: USER_ID,
      date: tx.date,
      merchant: tx.payee,
      amount: tx.amount,
      category: tx.category,
      upi_ref: tx.referenceNo,
      note: tx.notes || "",
      raw_message: tx.bankNotification || "",
      email_id: tx.messageId,
      type: tx.type,
      parsed_by: tx.source || tx.aiModel || "Manual Entry",
    });

    if (error) {
      console.warn("Could not write transaction to Supabase:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Could not write transaction to Supabase:", error);
    return false;
  }
}

/**
 * Update an existing transaction in Supabase (e.g. change category, payee, amount, etc.)
 */
export async function updateTransaction(
  id: string,
  updates: Partial<BankTransaction>
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {};

    if (updates.payee !== undefined) updatePayload.merchant = updates.payee;
    if (updates.amount !== undefined) updatePayload.amount = Number(updates.amount);
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.referenceNo !== undefined) updatePayload.upi_ref = updates.referenceNo;
    if (updates.notes !== undefined) updatePayload.note = updates.notes;
    if (updates.bankNotification !== undefined) updatePayload.raw_message = updates.bankNotification;
    if (updates.type !== undefined) updatePayload.type = updates.type;
    if (updates.date !== undefined) updatePayload.date = updates.date;
    if (updates.source !== undefined) updatePayload.parsed_by = updates.source;

    const { error } = await supabase
      .from("transactions")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", USER_ID);

    if (error) {
      console.warn("Could not update transaction in Supabase:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Could not update transaction in Supabase:", error);
    return false;
  }
}

/**
 * Delete a transaction from Supabase
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", USER_ID);

    if (error) {
      console.warn("Could not delete transaction from Supabase:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Could not delete transaction from Supabase:", error);
    return false;
  }
}

/**
 * Seed initial user Shreyas Hathiwala & default transactions check
 */
export async function seedInitialUserAndData() {
  console.log("Supabase transactions initialized with USER_ID:", USER_ID);
}
