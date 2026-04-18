import { NextResponse } from "next/server";
import { z } from "zod";
import type { FakeChatbotResponse, GuardLmResult, TestSendResponse } from "@/lib/types";

const testSendSchema = z.object({
  prompt: z.string().min(1).max(20000)
});

const GUARD_LM_ANALYZE_URL =
  process.env.GUARD_LM_ANALYZE_URL ?? "http://localhost:3000/api/analyze-prompt";

const GUARD_LM_API_KEY =
  process.env.GUARD_LM_API_KEY ??
  process.env.DEMO_CLIENT_API_KEY ??
  "glm_demo_local_development_key";

async function readJsonOrText(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return {
    message: await response.text().catch(() => "")
  };
}

function blockedResponse(
  prompt: string,
  guardLm: GuardLmResult,
  actionTaken = "blocked_by_guard_lm"
): TestSendResponse {
  return {
    original_prompt: prompt,
    guard_lm_status: guardLm.status,
    triggered_layers: guardLm.triggered_layers ?? [],
    guard_lm_action: guardLm.action_taken ?? null,
    action_taken: actionTaken,
    sanitized_prompt: null,
    prompt_sent_to_chatbot: null,
    chatbot_called: false,
    chatbot_reply: null,
    guard_lm: guardLm,
    fake_chatbot: null
  };
}

export async function POST(request: Request) {
  const body = testSendSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return NextResponse.json(
      { error: "Request must include a prompt." },
      { status: 400 }
    );
  }

  const { prompt } = body.data;

  // Step 1: the backend always asks Guard_LM to analyze the original prompt first.
  const guardLmResponse = await fetch(GUARD_LM_ANALYZE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: GUARD_LM_API_KEY,
      prompt
    }),
    cache: "no-store"
  });

  const guardLmPayload = await readJsonOrText(guardLmResponse);

  if (!guardLmResponse.ok) {
    return NextResponse.json(
      {
        original_prompt: prompt,
        guard_lm_status: "error",
        triggered_layers: [],
        guard_lm_action: null,
        action_taken: "guard_lm_request_failed",
        sanitized_prompt: null,
        prompt_sent_to_chatbot: null,
        chatbot_called: false,
        chatbot_reply: null,
        guard_lm: guardLmPayload,
        fake_chatbot: null,
        error: "Guard_LM analyze endpoint returned an error."
      } satisfies TestSendResponse,
      { status: 502 }
    );
  }

  const guardLm = guardLmPayload as GuardLmResult;
  const guardStatus = guardLm.status;
  const safePrompt = guardStatus === "safe";
  const sanitizedPrompt = guardStatus === "sanitized";
  const rejectedPrompt =
    guardStatus === "malicious" ||
    guardStatus === "rejected" ||
    guardLm.action_taken?.startsWith("reject");

  // Step 2: rejected or malicious prompts stop here; the fake chatbot is not called.
  if (rejectedPrompt || (!safePrompt && !sanitizedPrompt)) {
    return NextResponse.json(blockedResponse(prompt, guardLm));
  }

  // Step 3: safe prompts keep the original text; sanitized prompts use Guard_LM's forward_prompt.
  const promptForChatbot = sanitizedPrompt ? guardLm.forward_prompt : prompt;

  if (!promptForChatbot) {
    return NextResponse.json(
      {
        ...blockedResponse(prompt, guardLm, "guard_lm_missing_forward_prompt"),
        error: "Guard_LM returned sanitized without a forward_prompt."
      },
      { status: 502 }
    );
  }

  // Step 4: call the local fake chatbot only after Guard_LM allows a prompt through.
  const fakeChatbotResponse = await fetch(new URL("/fake-chatbot", request.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: promptForChatbot
    }),
    cache: "no-store"
  });

  const fakeChatbotPayload = (await readJsonOrText(fakeChatbotResponse)) as
    | FakeChatbotResponse
    | { error?: string };

  if (!fakeChatbotResponse.ok || !("reply" in fakeChatbotPayload)) {
    return NextResponse.json(
      {
        original_prompt: prompt,
        guard_lm_status: guardLm.status,
        triggered_layers: guardLm.triggered_layers ?? [],
        guard_lm_action: guardLm.action_taken ?? null,
        action_taken: "fake_chatbot_request_failed",
        sanitized_prompt: sanitizedPrompt ? promptForChatbot : null,
        prompt_sent_to_chatbot: promptForChatbot,
        chatbot_called: true,
        chatbot_reply: null,
        guard_lm: guardLm,
        fake_chatbot: null,
        error: "Fake chatbot route returned an error."
      } satisfies TestSendResponse,
      { status: 502 }
    );
  }

  return NextResponse.json({
    original_prompt: prompt,
    guard_lm_status: guardLm.status,
    triggered_layers: guardLm.triggered_layers ?? [],
    guard_lm_action: guardLm.action_taken ?? null,
    action_taken: sanitizedPrompt
      ? "forwarded_sanitized_prompt_to_fake_chatbot"
      : "forwarded_original_prompt_to_fake_chatbot",
    sanitized_prompt: sanitizedPrompt ? promptForChatbot : null,
    prompt_sent_to_chatbot: promptForChatbot,
    chatbot_called: true,
    chatbot_reply: fakeChatbotPayload.reply,
    guard_lm: guardLm,
    fake_chatbot: fakeChatbotPayload
  } satisfies TestSendResponse);
}
