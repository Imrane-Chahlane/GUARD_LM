import { SubscriptionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const subscriptionSchema = z.object({
  planName: z.enum(["Free", "Pro", "Enterprise"])
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ subscriptions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const body = subscriptionSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return badRequest("Unknown plan.");
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      planName: body.data.planName,
      status: SubscriptionStatus.ACTIVE
    }
  });

  return NextResponse.json({ subscription });
}
