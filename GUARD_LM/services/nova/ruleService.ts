import { prisma } from "@/lib/prisma";
import { RuleDecision } from "@prisma/client";

export async function listNovaRules(userId: string) {
  return await prisma.novaRule.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

export async function getNovaRule(id: string) {
  return await prisma.novaRule.findUnique({
    where: { id },
    include: { apiKeys: true }
  });
}

export async function createNovaRule(userId: string, data: { name: string; definition: any; decision: string }) {
  return await prisma.novaRule.create({
    data: {
      userId,
      name: data.name,
      definition: data.definition,
      decision: data.decision.toUpperCase() as RuleDecision
    }
  });
}

export async function updateNovaRule(id: string, data: { name?: string; definition?: any; decision?: string }) {
  return await prisma.novaRule.update({
    where: { id },
    data: {
      ...data,
      decision: data.decision ? (data.decision.toUpperCase() as RuleDecision) : undefined
    }
  });
}

export async function deleteNovaRule(id: string) {
  return await prisma.novaRule.delete({
    where: { id }
  });
}
