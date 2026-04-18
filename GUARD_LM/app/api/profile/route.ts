import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2),
  companyName: z.string().min(2),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional()
});

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = profileSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return badRequest("Profile payload is invalid.");
  }

  const data: { name: string; companyName: string; passwordHash?: string } = {
    name: body.data.name,
    companyName: body.data.companyName
  };

  if (body.data.newPassword) {
    if (!body.data.currentPassword) {
      return badRequest("Current password is required to change password.");
    }

    const account = await prisma.user.findUnique({ where: { id: user.id } });

    if (!account || !(await verifyPassword(body.data.currentPassword, account.passwordHash))) {
      return unauthorized("Current password is incorrect.");
    }

    data.passwordHash = await hashPassword(body.data.newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: {
      id: true,
      name: true,
      companyName: true,
      email: true,
      role: true
    }
  });

  return NextResponse.json({ user: updated });
}
