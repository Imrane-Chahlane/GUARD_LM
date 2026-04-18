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

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const created = await createApiKey(user.id);
  return NextResponse.json({
    apiKey: created.apiKey,
    rawKey: created.rawKey
  });
}
