import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryRules,
  saveCategoryRule,
  addPayeeToCategory,
  removePayeeFromCategory,
  deleteCategoryRule,
  applyRuleRetroactively,
} from "@/lib/rules";
import { USER_ID } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rules = await getCategoryRules(USER_ID);
    return NextResponse.json({
      success: true,
      rules,
      count: rules.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch category rules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, category, payee, payees, color, icon, description, applyToPast } = body;

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    let savedRule;
    let updatedCount = 0;

    if (action === "add_payee" && payee) {
      // Add a single person to category
      savedRule = await addPayeeToCategory(category, payee, { color, icon }, USER_ID);
      if (applyToPast) {
        const res = await applyRuleRetroactively(category, [payee], USER_ID);
        updatedCount = res.updatedCount;
      }
    } else {
      // Full save or create
      const payeesList = Array.isArray(payees)
        ? payees
        : payee
        ? [payee]
        : [];
      savedRule = await saveCategoryRule(
        {
          category,
          payees: payeesList,
          color,
          icon,
          description,
        },
        USER_ID
      );

      if (applyToPast && payeesList.length > 0) {
        const res = await applyRuleRetroactively(category, payeesList, USER_ID);
        updatedCount = res.updatedCount;
      }
    }

    return NextResponse.json({
      success: true,
      rule: savedRule,
      updatedPastTransactionsCount: updatedCount,
      message: `Category rule saved successfully${
        updatedCount > 0 ? ` and applied to ${updatedCount} past transactions` : ""
      }`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save category rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");
    const payeeToRemove = searchParams.get("payee");

    if (payeeToRemove && category) {
      // Remove specific payee from category
      const updated = await removePayeeFromCategory(category, payeeToRemove, USER_ID);
      return NextResponse.json({
        success: true,
        message: `Removed ${payeeToRemove} from ${category}`,
        rule: updated,
      });
    }

    const target = id || category;
    if (!target) {
      return NextResponse.json(
        { success: false, error: "Category rule ID or name is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteCategoryRule(target, USER_ID);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Rule not found or could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category rule deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category rule" },
      { status: 500 }
    );
  }
}
