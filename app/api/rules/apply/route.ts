import { NextRequest, NextResponse } from "next/server";
import { applyRuleRetroactively } from "@/lib/rules";
import { USER_ID } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, payees } = body;

    if (!category || !Array.isArray(payees) || payees.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category and an array of payees are required" },
        { status: 400 }
      );
    }

    const { updatedCount } = await applyRuleRetroactively(category, payees, USER_ID);

    return NextResponse.json({
      success: true,
      category,
      updatedCount,
      message: `Updated ${updatedCount} transaction${updatedCount === 1 ? "" : "s"} to category '${category}'`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to apply category rule" },
      { status: 500 }
    );
  }
}
