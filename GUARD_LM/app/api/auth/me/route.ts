import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { unauthorized } from "@/lib/apiResponse";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  return NextResponse.json({ user });
}
