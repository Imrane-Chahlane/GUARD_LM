import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getClientSecurityBundle } from "@/services/analysis/pipeline";
import { maliciousActionToPrisma } from "@/utils/enums";

const configSchema = z.object({
  enableStaticAnalysis: z.boolean(),
  enableSemanticAnalysis: z.boolean(),
  enableLlmClassification: z.boolean(),
  maliciousAction: z.enum(["reject", "sanitize", "reject_with_reason"]),
  semanticThreshold: z.number().min(0).max(1),
  blacklistRules: z.array(z.string().min(1)).max(150),
  regexRules: z
    .array(
      z.object({
        pattern: z.string().min(1),
        description: z.string().optional().nullable()
      })
    )
    .max(150),
  semanticExamples: z.array(z.string().min(1)).max(200)
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const config = await getClientSecurityBundle(user.id);
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = configSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return badRequest("Configuration payload is invalid.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.clientConfig.upsert({
      where: { userId: user.id },
      update: {
        enableStaticAnalysis: body.data.enableStaticAnalysis,
        enableSemanticAnalysis: body.data.enableSemanticAnalysis,
        enableLlmClassification: body.data.enableLlmClassification,
        maliciousAction: maliciousActionToPrisma(body.data.maliciousAction),
        semanticThreshold: body.data.semanticThreshold
      },
      create: {
        userId: user.id,
        enableStaticAnalysis: body.data.enableStaticAnalysis,
        enableSemanticAnalysis: body.data.enableSemanticAnalysis,
        enableLlmClassification: body.data.enableLlmClassification,
        maliciousAction: maliciousActionToPrisma(body.data.maliciousAction),
        semanticThreshold: body.data.semanticThreshold
      }
    });

    await tx.blacklistRule.deleteMany({ where: { userId: user.id } });
    if (body.data.blacklistRules.length > 0) {
      await tx.blacklistRule.createMany({
        data: body.data.blacklistRules.map((phrase) => ({
          userId: user.id,
          phrase,
          isActive: true
        }))
      });
    }

    await tx.regexRule.deleteMany({ where: { userId: user.id } });
    if (body.data.regexRules.length > 0) {
      await tx.regexRule.createMany({
        data: body.data.regexRules.map((rule) => ({
          userId: user.id,
          pattern: rule.pattern,
          description: rule.description || null,
          isActive: true
        }))
      });
    }

    await tx.semanticExample.deleteMany({ where: { userId: user.id } });
    if (body.data.semanticExamples.length > 0) {
      await tx.semanticExample.createMany({
        data: body.data.semanticExamples.map((text) => ({
          userId: user.id,
          text,
          label: "malicious"
        }))
      });
    }
  });

  const updated = await getClientSecurityBundle(user.id);
  return NextResponse.json({ config: updated });
}
