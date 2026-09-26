import { prisma } from "./prisma";
import { BankTransaction } from "@/types/bankTransaction";
import { initialBankTransactions } from "@/data/bankTransactionsMock";

/**
 * Fetch all transactions from PostgreSQL via Prisma
 * Falls back to initial data if database is not reachable yet
 */
export async function getTransactions(): Promise<BankTransaction[]> {
  try {
    const dbTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!dbTransactions || dbTransactions.length === 0) {
      return initialBankTransactions;
    }

    return dbTransactions.map((tx) => ({
      id: tx.id,
      date: tx.date,
      payee: tx.payee,
      amount: tx.amount,
      category: tx.category,
      referenceNo: tx.referenceNo,
      notes: tx.notes || "",
      bankNotification: tx.bankNotification || "",
      messageId: tx.messageId,
      type: tx.type as "Debit" | "Credit",
      source: tx.source,
      aiParsed: tx.aiParsed,
      aiModel: tx.aiModel || "Gemini 1.5 Flash",
    }));
  } catch (error) {
    console.warn("PostgreSQL not connected yet, using in-memory mock data:", error);
    return initialBankTransactions;
  }
}

/**
 * Save new 10-column transaction into PostgreSQL via Prisma
 */
export async function saveTransaction(tx: BankTransaction): Promise<boolean> {
  try {
    await prisma.transaction.upsert({
      where: { messageId: tx.messageId },
      update: {
        payee: tx.payee,
        amount: tx.amount,
        category: tx.category,
        referenceNo: tx.referenceNo,
        notes: tx.notes,
        bankNotification: tx.bankNotification,
        type: tx.type,
        source: tx.source,
      },
      create: {
        id: tx.id,
        date: tx.date,
        payee: tx.payee,
        amount: tx.amount,
        category: tx.category,
        referenceNo: tx.referenceNo,
        notes: tx.notes,
        bankNotification: tx.bankNotification,
        messageId: tx.messageId,
        type: tx.type,
        source: tx.source,
        aiParsed: tx.aiParsed ?? true,
        aiModel: tx.aiModel || "Gemini 1.5 Flash",
      },
    });
    return true;
  } catch (error) {
    console.warn("Could not write transaction to PostgreSQL:", error);
    return false;
  }
}

/**
 * Seed initial user Shreyas Hathiwala & default transactions into PostgreSQL
 */
export async function seedInitialUserAndData() {
  try {
    // 1. Upsert single authorized user
    await prisma.user.upsert({
      where: { email: "shreyas@hathiwala.com" },
      update: {},
      create: {
        name: "Shreyas Hathiwala",
        email: "shreyas@hathiwala.com",
        password: "Shreyas@3155",
        role: "OWNER",
      },
    });

    // 2. Upsert initial bank transactions
    for (const item of initialBankTransactions) {
      await prisma.transaction.upsert({
        where: { messageId: item.messageId },
        update: {},
        create: {
          id: item.id,
          date: item.date,
          payee: item.payee,
          amount: item.amount,
          category: item.category,
          referenceNo: item.referenceNo,
          notes: item.notes,
          bankNotification: item.bankNotification,
          messageId: item.messageId,
          type: item.type,
          source: item.source,
          aiParsed: true,
          aiModel: "Gemini 1.5 Flash",
        },
      });
    }

    console.log("PostgreSQL seeded successfully with Shreyas Hathiwala and bank data");
  } catch (err) {
    console.warn("PostgreSQL seed skipped (waiting for active DB connection):", err);
  }
}
