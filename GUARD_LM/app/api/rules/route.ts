import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { listNovaRules, createNovaRule } from "@/services/nova/ruleService";
import { NovaRuleSchema } from "@/lib/nova/schema";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const rules = await listNovaRules(user.id);
  return NextResponse.json(rules);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body) return badRequest("Invalid payload.");

  // Validation is handled partially by Zod here and partially in definition
  const rule = await createNovaRule(user.id, {
    name: body.name || "New Rule",
    decision: (body.decision || "REJECT").toUpperCase(),
    definition: body.definition || { meta: { description: "New Rule" }, condition: "" }
  });

  return NextResponse.json(rule);
}
