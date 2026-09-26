import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("spendly_session");

  if (!sessionCookie || sessionCookie.value !== "authenticated_shreyas_3155") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      name: "Shreyas Hathiwala",
      email: "shreyas@hathiwala.com",
      role: "OWNER",
    },
  });
}
