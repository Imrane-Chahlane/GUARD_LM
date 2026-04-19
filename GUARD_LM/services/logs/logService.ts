import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  actionTakenToApi,
  actionTakenToPrisma,
  promptStatusToApi,
  promptStatusToPrisma
} from "@/utils/enums";
import type { ActionTakenName, LayerName, PromptFinalStatus } from "@/types/analysis";

export async function savePromptLog(params: {
  userId: string;
  apiKeyId?: string | null;
  ruleId?: string | null;
  originalPrompt: string;
  sanitizedPrompt?: string | null;
  finalStatus: PromptFinalStatus;
  triggeredLayers: string[];
  actionTaken: ActionTakenName;
  violationReason?: string | null;
}) {
  return prisma.promptLog.create({
    data: {
      userId: params.userId,
      apiKeyId: params.apiKeyId || null,
      ruleId: params.ruleId || null,
      originalPrompt: params.originalPrompt,
      sanitizedPrompt: params.sanitizedPrompt || null,
      finalStatus: promptStatusToPrisma(params.finalStatus),
      triggeredLayers: params.triggeredLayers,
      actionTaken: actionTakenToPrisma(params.actionTaken),
      violationReason: params.violationReason || null
    }
  });
}

export async function listPromptLogs(params: {
  user: { id: string; role: Role };
  status?: string | null;
  client?: string | null;
  search?: string | null;
  from?: string | null;
  to?: string | null;
  apiKeyId?: string | null;
  ruleId?: string | null;
}) {
  const where: Prisma.PromptLogWhereInput = {};

  if (params.user.role !== Role.ADMIN) {
    where.userId = params.user.id;
  }

  if (params.apiKeyId) {
    where.apiKeyId = params.apiKeyId;
  }

  if (params.ruleId) {
    where.ruleId = params.ruleId;
  }

  if (params.status && ["safe", "malicious", "sanitized"].includes(params.status)) {
    where.finalStatus = promptStatusToPrisma(params.status as PromptFinalStatus);
  }

  if (params.search) {
    where.OR = [
      { originalPrompt: { contains: params.search, mode: "insensitive" } },
      { sanitizedPrompt: { contains: params.search, mode: "insensitive" } },
      { violationReason: { contains: params.search, mode: "insensitive" } }
    ];
  }

  if (params.from || params.to) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (params.from) {
      createdAt.gte = new Date(params.from);
    }
    if (params.to) {
      createdAt.lte = new Date(params.to);
    }
    where.createdAt = createdAt;
  }

  if (params.user.role === Role.ADMIN && params.client) {
    where.user = {
      OR: [
        { email: { contains: params.client, mode: "insensitive" } },
        { companyName: { contains: params.client, mode: "insensitive" } },
        { name: { contains: params.client, mode: "insensitive" } }
      ]
    };
  }

  const logs = await prisma.promptLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          companyName: true,
          email: true
        }
      },
      rule: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return logs.map((log) => ({
    id: log.id,
    date: log.createdAt,
    client: log.user.companyName,
    clientEmail: log.user.email,
    apiKeyId: log.apiKeyId,
    ruleId: log.ruleId,
    ruleName: log.rule?.name,
    originalPrompt: log.originalPrompt,
    sanitizedPrompt: log.sanitizedPrompt,
    status: promptStatusToApi(log.finalStatus),
    triggeredLayers: Array.isArray(log.triggeredLayers)
      ? (log.triggeredLayers as string[])
      : [],
    actionTaken: actionTakenToApi(log.actionTaken),
    violationReason: log.violationReason
  }));
}
