import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const body = loginSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return badRequest("Please provide a valid email and password.");
  }

  const user = await prisma.user.findUnique({
    where: { email: body.data.email.toLowerCase() }
  });

  if (!user || !(await verifyPassword(body.data.password, user.passwordHash))) {
    return unauthorized("Invalid email or password.");
  }

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
