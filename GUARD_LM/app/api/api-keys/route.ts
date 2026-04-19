import { NextResponse } from "next/server";
import { unauthorized } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { createApiKey, listApiKeys } from "@/services/apiKeys/apiKeyService";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  return NextResponse.json({ apiKeys: await listApiKeys(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const { apiKey, rawKey } = await createApiKey(user.id, body.ruleIds || []);

  return NextResponse.json({
    rawKey,
    apiKey
  });
}
