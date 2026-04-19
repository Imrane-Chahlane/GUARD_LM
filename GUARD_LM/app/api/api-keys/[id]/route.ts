import { NextResponse } from "next/server";
import { forbidden, unauthorized } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { revokeApiKey, updateApiKeyRules } from "@/services/apiKeys/apiKeyService";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  
  if (!body.ruleIds || !Array.isArray(body.ruleIds)) {
    return forbidden("A list of rule IDs is required.");
  }

  const updated = await updateApiKeyRules(user.id, id, body.ruleIds);
  
  if (!updated) {
    return forbidden("API key not found.");
  }

  return NextResponse.json({ ok: true, apiKey: updated });
}

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
