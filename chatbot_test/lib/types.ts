export type GuardLmResult = {
  status: "safe" | "sanitized" | "malicious" | "rejected" | string;
  original_prompt: string;
  forward_prompt: string | null;
  triggered_layers: string[];
  action_taken: string;
  reason?: string;
};

export type FakeChatbotResponse = {
  reply: string;
  received_prompt: string;
};

export type TestSendResponse = {
  original_prompt: string;
  guard_lm_status: string;
  triggered_layers: string[];
  guard_lm_action: string | null;
  action_taken: string;
  sanitized_prompt: string | null;
  prompt_sent_to_chatbot: string | null;
  chatbot_called: boolean;
  chatbot_reply: string | null;
  guard_lm: GuardLmResult | unknown;
  fake_chatbot: FakeChatbotResponse | null;
  error?: string;
};
