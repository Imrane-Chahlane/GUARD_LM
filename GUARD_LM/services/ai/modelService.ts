import { prisma } from "@/lib/prisma";
import { AiModelType } from "@prisma/client";

export async function listAiModels(userId: string) {
  return await prisma.aiModel.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

export async function createAiModel(userId: string, data: { 
  type: AiModelType;
  provider: string; 
  apiKey: string; 
  baseUrl?: string; 
  modelName: string;
}) {
  return await prisma.aiModel.upsert({
    where: {
      userId_type: {
        userId,
        type: data.type
      }
    },
    create: {
      userId,
      type: data.type,
      provider: data.provider,
      apiKey: data.apiKey,
      baseUrl: data.baseUrl,
      modelName: data.modelName
    },
    update: {
      provider: data.provider,
      apiKey: data.apiKey,
      baseUrl: data.baseUrl,
      modelName: data.modelName
    }
  });
}

export async function deleteAiModel(id: string) {
  return await prisma.aiModel.delete({
    where: { id }
  });
}
