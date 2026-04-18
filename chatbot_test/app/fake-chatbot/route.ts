import { NextResponse } from "next/server";
import { z } from "zod";

const fakeChatbotSchema = z.object({
  prompt: z.string().min(1).max(20000)
});

export async function POST(request: Request) {
  const body = fakeChatbotSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return NextResponse.json(
      { error: "Request must include a prompt." },
      { status: 400 }
    );
  }

  // This route intentionally does no AI work. It only proves which prompt
  // would reach a chatbot after Guard_LM finishes its decision.
  return NextResponse.json({
    reply: `Fake bot response to: ${body.data.prompt}`,
    received_prompt: body.data.prompt
  });
}
