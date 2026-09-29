import { prisma } from "./prisma";
import { USER_ID } from "./supabase";

export interface CategoryRuleItem {
  id: string;
  userId?: string | null;
  category: string;
  payees: string[];
  color?: string | null;
  icon?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch all category rules for a user
 */
export async function getCategoryRules(userId: string = USER_ID): Promise<CategoryRuleItem[]> {
  try {
    const rules = await prisma.categoryRule.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { updatedAt: "desc" },
    });

    return rules.map((r) => ({
      id: r.id,
      userId: r.userId,
      category: r.category,
      payees: r.payees || [],
      color: r.color || null,
      icon: r.icon || null,
      description: r.description || null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching category rules:", error);
    return [];
  }
}

/**
 * Save or update a category rule with a list of payees
 */
export async function saveCategoryRule(
  data: {
    id?: string;
    category: string;
    payees: string[];
    color?: string;
    icon?: string;
    description?: string;
  },
  userId: string = USER_ID
): Promise<CategoryRuleItem> {
  const categoryClean = data.category.trim();
  if (!categoryClean) {
    throw new Error("Category name cannot be empty");
  }

  // Clean, trim, and deduplicate payees (case-preserving, unique lowercase)
  const seen = new Set<string>();
  const cleanedPayees: string[] = [];
  for (const p of data.payees || []) {
    const trimmed = p.trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      cleanedPayees.push(trimmed);
    }
  }

  // Upsert rule based on unique compound key [userId, category]
  const existing = await prisma.categoryRule.findFirst({
    where: {
      userId,
      category: { equals: categoryClean, mode: "insensitive" },
    },
  });

  let saved;
  if (existing) {
    saved = await prisma.categoryRule.update({
      where: { id: existing.id },
      data: {
        category: categoryClean,
        payees: cleanedPayees,
        color: data.color ?? existing.color,
        icon: data.icon ?? existing.icon,
        description: data.description ?? existing.description,
      },
    });
  } else {
    saved = await prisma.categoryRule.create({
      data: {
        userId,
        category: categoryClean,
        payees: cleanedPayees,
        color: data.color || "#8B5CF6",
        icon: data.icon || "Tag",
        description: data.description || "",
      },
    });
  }

  return {
    id: saved.id,
    userId: saved.userId,
    category: saved.category,
    payees: saved.payees || [],
    color: saved.color,
    icon: saved.icon,
    description: saved.description,
    createdAt: saved.createdAt.toISOString(),
    updatedAt: saved.updatedAt.toISOString(),
  };
}

/**
 * Add a single payee to a category (creating category rule if not exists)
 */
export async function addPayeeToCategory(
  category: string,
  payee: string,
  options?: { color?: string; icon?: string },
  userId: string = USER_ID
): Promise<CategoryRuleItem> {
  const catClean = category.trim();
  const payeeClean = payee.trim();
  if (!catClean || !payeeClean) {
    throw new Error("Both category and payee are required");
  }

  const existing = await prisma.categoryRule.findFirst({
    where: {
      userId,
      category: { equals: catClean, mode: "insensitive" },
    },
  });

  const currentPayees = existing?.payees || [];
  const payeeExists = currentPayees.some(
    (p) => p.toLowerCase() === payeeClean.toLowerCase()
  );

  const updatedPayees = payeeExists ? currentPayees : [...currentPayees, payeeClean];

  return saveCategoryRule(
    {
      category: catClean,
      payees: updatedPayees,
      color: options?.color || existing?.color || undefined,
      icon: options?.icon || existing?.icon || undefined,
    },
    userId
  );
}

/**
 * Remove a payee from a category rule
 */
export async function removePayeeFromCategory(
  category: string,
  payee: string,
  userId: string = USER_ID
): Promise<CategoryRuleItem | null> {
  const catClean = category.trim();
  const payeeClean = payee.trim();

  const existing = await prisma.categoryRule.findFirst({
    where: {
      userId,
      category: { equals: catClean, mode: "insensitive" },
    },
  });

  if (!existing) return null;

  const filtered = (existing.payees || []).filter(
    (p) => p.toLowerCase() !== payeeClean.toLowerCase()
  );

  const updated = await prisma.categoryRule.update({
    where: { id: existing.id },
    data: { payees: filtered },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    category: updated.category,
    payees: updated.payees,
    color: updated.color,
    icon: updated.icon,
    description: updated.description,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/**
 * Delete a category rule completely
 */
export async function deleteCategoryRule(
  idOrCategory: string,
  userId: string = USER_ID
): Promise<boolean> {
  try {
    const existing = await prisma.categoryRule.findFirst({
      where: {
        userId,
        OR: [
          { id: idOrCategory },
          { category: { equals: idOrCategory, mode: "insensitive" } },
        ],
      },
    });

    if (!existing) return false;

    await prisma.categoryRule.delete({
      where: { id: existing.id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting category rule:", error);
    return false;
  }
}

/**
 * Match a payee string against active category rules.
 * Uses smart case-insensitive matching:
 * - Direct substring match: "Dhaval Patel" inside "UPI/DHAVAL PATEL/..." or vice-versa
 * - Token overlap: if both have multi-word tokens that match closely
 */
export function findCategoryForPayee(
  payee: string,
  rules: CategoryRuleItem[]
): CategoryRuleItem | null {
  if (!payee || !rules || rules.length === 0) return null;

  const target = payee.trim().toLowerCase();
  if (!target) return null;

  // 1. Exact match first
  for (const rule of rules) {
    for (const p of rule.payees) {
      if (p.trim().toLowerCase() === target) {
        return rule;
      }
    }
  }

  // 2. Substring containment match (e.g. "Dhaval Patel" contained in "UPI-DHAVAL PATEL-OKAXIS")
  for (const rule of rules) {
    for (const p of rule.payees) {
      const candidate = p.trim().toLowerCase();
      if (!candidate) continue;
      if (target.includes(candidate) || candidate.includes(target)) {
        return rule;
      }
    }
  }

  return null;
}

/**
 * Retroactively apply a category rule to existing transactions in DB
 */
export async function applyRuleRetroactively(
  category: string,
  payees: string[],
  userId: string = USER_ID
): Promise<{ updatedCount: number }> {
  if (!category || !payees || payees.length === 0) {
    return { updatedCount: 0 };
  }

  let totalUpdated = 0;

  for (const payee of payees) {
    const pattern = payee.trim();
    if (!pattern) continue;

    // Use Prisma updateMany where merchant contains payee pattern
    const res = await prisma.transaction.updateMany({
      where: {
        userId,
        payee: {
          contains: pattern,
          mode: "insensitive",
        },
      },
      data: {
        category,
      },
    });

    totalUpdated += res.count;
  }

  return { updatedCount: totalUpdated };
}
