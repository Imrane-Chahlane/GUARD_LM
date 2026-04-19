import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { listAiModels, createAiModel, deleteAiModel } from "@/services/ai/modelService";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const models = await listAiModels(user.id);
  return NextResponse.json(models);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body || !body.provider || !body.apiKey || !body.modelName || !body.type) {
    return badRequest("Type, Provider, API Key, and Model Name are required.");
  }

  const model = await createAiModel(user.id, {
    type: body.type,
    provider: body.provider,
    apiKey: body.apiKey,
    baseUrl: body.baseUrl,
    modelName: body.modelName
  });

  return NextResponse.json(model);
}
