import { Role, MaliciousAction, SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  defaultBlacklistPhrases,
  defaultRegexRules,
  defaultSemanticExamples
} from "@/lib/defaultSecurity";
import { createSessionToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { badRequest } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = registerSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return badRequest("Please provide name, company name, valid email, and a password with at least 8 characters.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: body.data.email.toLowerCase() }
  });

  if (existing) {
    return badRequest("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(body.data.password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: body.data.name,
        companyName: body.data.companyName,
        email: body.data.email.toLowerCase(),
        passwordHash,
        role: Role.CLIENT
      }
    });

    await tx.clientConfig.create({
      data: {
        userId: created.id,
        maliciousAction: MaliciousAction.REJECT
      }
    });

    await tx.blacklistRule.createMany({
      data: defaultBlacklistPhrases.map((phrase) => ({
        userId: created.id,
        phrase
      }))
    });

    await tx.regexRule.createMany({
      data: defaultRegexRules.map((rule) => ({
        userId: created.id,
        pattern: rule.pattern,
        description: rule.description
      }))
    });

    await tx.semanticExample.createMany({
      data: defaultSemanticExamples.map((text) => ({
        userId: created.id,
        text,
        label: "malicious"
      }))
    });

    await tx.subscription.create({
      data: {
        userId: created.id,
        planName: "Free",
        status: SubscriptionStatus.ACTIVE
      }
    });

    return created;
  });

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    companyName: user.companyName,
    role: user.role
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      companyName: user.companyName,
      email: user.email,
      role: user.role
    }
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
