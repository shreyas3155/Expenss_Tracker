import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const normalizedUser = (username || "").trim().toLowerCase();
    const authorizedUser = (process.env.AUTHORIZED_USER || "shreyas hathiwala").toLowerCase();
    const authorizedPassword = process.env.AUTHORIZED_PASSWORD || "Shreyas@3155";
    const authorizedEmail = (process.env.AUTHORIZED_EMAIL || "shreyas@hathiwala.com").toLowerCase();

    // Check if username matches "shreyas hathiwala" or "shreyas" or "shreyas@hathiwala.com"
    const isUserValid =
      normalizedUser === authorizedUser ||
      normalizedUser === "shreyas" ||
      normalizedUser === authorizedEmail;

    const isPasswordValid = password === authorizedPassword;

    if (!isUserValid || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials. Access is restricted to Shreyas Hathiwala.",
        },
        { status: 401 }
      );
    }

    // Set secure cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          name: "Shreyas Hathiwala",
          email: "shreyas@hathiwala.com",
          role: "OWNER",
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "spendly_session",
      value: "authenticated_shreyas_3155",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication error", details: err.message },
      { status: 500 }
    );
  }
}
