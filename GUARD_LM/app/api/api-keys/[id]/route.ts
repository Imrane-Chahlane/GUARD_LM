import { NextResponse } from "next/server";
import { forbidden, unauthorized } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { revokeApiKey } from "@/services/apiKeys/apiKeyService";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const { id } = await context.params;
  const revoked = await revokeApiKey(user.id, id);

  if (!revoked) {
    return forbidden("API key not found.");
  }

  return NextResponse.json({ ok: true });
}
