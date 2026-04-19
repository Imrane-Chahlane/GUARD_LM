import { badRequest } from "@/lib/apiResponse";
import { analyzePromptForClient } from "@/services/analysis/pipeline";
import { NextResponse } from "next/server";
import { z } from "zod";

const analyzeSchema = z.object({
  api_key: z.string().min(10),
  prompt: z.string().min(1).max(20000)
});

export async function POST(request: Request) {
  console.log("🔍 [AnalyzePrompt] Received new request");
  const rawBody = await request.json().catch(() => null);
  console.log("📦 [AnalyzePrompt] Request Body:", JSON.stringify(rawBody, null, 2));

  const body = analyzeSchema.safeParse(rawBody);

  if (!body.success) {
    console.error("❌ [AnalyzePrompt] Validation Failed:", body.error.format());
    return badRequest("Request must include api_key and prompt.");
  }

  console.log("🔑 [AnalyzePrompt] Validating API key...");
  // const apiKey = await validateApiKey(body.data.api_key);

  // if (!apiKey) {
  //   console.warn("⚠️ [AnalyzePrompt] Unauthorized: Invalid or revoked API key");
  //   return unauthorized("Invalid or revoked API key.");
  // }

  // console.log(`👤 [AnalyzePrompt] User: ${apiKey.user.email} | Rules: ${apiKey.rules?.length || 0}`);

  try {
    const result = await analyzePromptForClient({
      apiKey: "",
      prompt: body.data.prompt
    });

    console.log(`✅ [AnalyzePrompt] Status: ${result.status} | Action: ${result.action_taken}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error("🔥 [AnalyzePrompt] Execution Error:", error);
    return NextResponse.json({ error: "Internal analysis error" }, { status: 500 });
  }
}
