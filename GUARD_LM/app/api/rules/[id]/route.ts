import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { updateNovaRule, deleteNovaRule } from "@/services/nova/ruleService";
import { NovaRuleSchema } from "@/lib/nova/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid payload.");

  // Validate definition against Nova schema
  const validation = NovaRuleSchema.safeParse(body.definition);
  if (!validation.success) {
    return badRequest("Invalid Nova rule definition.");
  }

  const updated = await updateNovaRule(id, {
    name: body.name,
    decision: body.decision,
    definition: validation.data
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await deleteNovaRule(id);
  return NextResponse.json({ success: true });
}
