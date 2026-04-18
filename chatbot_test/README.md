# Guard_LM Chatbot Tester

A minimal local app for checking how Guard_LM handles prompts before they reach a chatbot.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Next.js route handlers

## Routes

- `GET /` renders the test chat page.
- `POST /test/send` sends the prompt to Guard_LM first, then conditionally calls the fake bot.
- `POST /fake-chatbot` returns `Fake bot response to: <prompt>`.

## Local Run

1. Start the main Guard_LM app on port `3000`.

```bash
cd C:\Users\pcyas\Desktop\GUARD_LM
npm install
npm run db:setup
npm run dev
```

2. Start this tester on port `3001`.

```bash
cd C:\Users\pcyas\Desktop\chatbot_test
npm install
npm run dev
```

3. Open `http://localhost:3001`.

## Configuration

The tester defaults to:

```bash
GUARD_LM_ANALYZE_URL="http://localhost:3000/api/analyze-prompt"
GUARD_LM_API_KEY="glm_demo_local_development_key"
```

Create `.env.local` if your Guard_LM app uses a different URL or API key.

## Decision Flow

1. `/test/send` receives the original prompt.
2. It posts `{ api_key, prompt }` to Guard_LM.
3. If Guard_LM returns `safe`, the original prompt is sent to `/fake-chatbot`.
4. If Guard_LM returns `sanitized`, `forward_prompt` is sent to `/fake-chatbot`.
5. If Guard_LM returns `malicious` or a reject action, `/fake-chatbot` is not called.
6. The frontend receives a combined JSON response with the Guard_LM decision and chatbot reply when present.
