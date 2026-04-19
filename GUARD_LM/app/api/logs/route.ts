import { NextResponse } from "next/server";
import { unauthorized } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth/session";
import { listPromptLogs } from "@/services/logs/logService";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorized();
  }

  const url = new URL(request.url);
  const logs = await listPromptLogs({
    user,
    status: url.searchParams.get("status"),
    client: url.searchParams.get("client"),
    search: url.searchParams.get("search"),
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
    ruleId: url.searchParams.get("ruleId"),
    apiKeyId: url.searchParams.get("apiKeyId")
  });

  return NextResponse.json({ logs });
}
