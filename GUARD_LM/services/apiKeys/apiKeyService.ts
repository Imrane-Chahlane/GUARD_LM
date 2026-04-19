import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function generateRawApiKey() {
  const publicId = crypto.randomBytes(4).toString("hex");
  const secret = crypto.randomBytes(28).toString("base64url");
  return `glm_live_${publicId}_${secret}`;
}

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function getApiKeyPrefix(apiKey: string) {
  const parts = apiKey.split("_");
  return parts.length >= 3 ? parts.slice(0, 3).join("_") : apiKey.slice(0, 16);
}

export function maskApiKey(prefix: string) {
  return `${prefix}_************************`;
}

export async function createApiKey(userId: string, ruleIds: string[] = []) {
  const rawKey = generateRawApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      keyHash: hashApiKey(rawKey),
      keyPrefix: getApiKeyPrefix(rawKey),
      rules: {
        connect: ruleIds.map(id => ({ id }))
      }
    },
    include: {
      rules: true
    }
  });

  return {
    rawKey,
    apiKey: {
      id: apiKey.id,
      keyPrefix: apiKey.keyPrefix,
      maskedKey: maskApiKey(apiKey.keyPrefix),
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
      revokedAt: apiKey.revokedAt,
      rules: apiKey.rules
    }
  };
}

export async function listApiKeys(userId: string) {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    include: {
      rules: true
    },
    orderBy: { createdAt: "desc" }
  });

  return keys.map((key) => ({
    id: key.id,
    keyPrefix: key.keyPrefix,
    maskedKey: maskApiKey(key.keyPrefix),
    isActive: key.isActive,
    createdAt: key.createdAt,
    revokedAt: key.revokedAt,
    rules: key.rules
  }));
}

export async function revokeApiKey(userId: string, apiKeyId: string) {
  const existing = await prisma.apiKey.findFirst({
    where: { id: apiKeyId, userId }
  });

  if (!existing) {
    return null;
  }

  return prisma.apiKey.update({
    where: { id: apiKeyId },
    data: {
      isActive: false,
      revokedAt: new Date()
    }
  });
}

export async function updateApiKeyRules(userId: string, apiKeyId: string, ruleIds: string[]) {
  const existing = await prisma.apiKey.findFirst({
    where: { id: apiKeyId, userId }
  });

  if (!existing) {
    return null;
  }

  return prisma.apiKey.update({
    where: { id: apiKeyId },
    data: {
      rules: {
        set: ruleIds.map(id => ({ id }))
      }
    },
    include: {
      rules: true
    }
  });
}

export async function validateApiKey(rawApiKey: string) {
  const keyHash = hashApiKey(rawApiKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        include: {
          aiModels: true
        }
      },
      rules: true
    }
  });

  if (!apiKey || !apiKey.isActive || apiKey.revokedAt) {
    return null;
  }

  return apiKey;
}
