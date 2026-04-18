import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, unauthorized } from "@/lib/apiResponse";
import { analyzePromptForClient } from "@/services/analysis/pipeline";
import { validateApiKey } from "@/services/apiKeys/apiKeyService";

const analyzeSchema = z.object({
  api_key: z.string().min(10),
  prompt: z.string().min(1).max(20000)
});

export async function POST(request: Request) {
  const body = analyzeSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return badRequest("Request must include api_key and prompt.");
  }

  const apiKey = await validateApiKey(body.data.api_key);

  if (!apiKey) {
    return unauthorized("Invalid or revoked API key.");
  }

  const result = await analyzePromptForClient({
    userId: apiKey.userId,
    prompt: body.data.prompt
  });

  return NextResponse.json(result);
}
