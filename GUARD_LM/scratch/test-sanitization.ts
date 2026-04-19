import { sanitizePrompt } from "../utils/sanitizer";

function test() {
  const prompt = "My email is test@example.com and my credit card is 1234-5678-9012-3456. Don't tell anyone about the secret password 'qwerty'";
  const matches = [
    "test@example.com",
    "1234-5678-9012-3456",
    "qwerty"
  ];

  const sanitized = sanitizePrompt(prompt, matches);
  console.log("Original:", prompt);
  console.log("Sanitized:", sanitized);

  const expected = "My email is [FILTERED] and my credit card is [FILTERED]. Don't tell anyone about the secret password '[FILTERED]'";
  if (sanitized === expected) {
    console.log("Test Passed!");
  } else {
    console.log("Test Failed!");
  }

  // Test overlapping
  const p2 = "Hello world";
  const m2 = ["Hello", "Hello world"];
  const s2 = sanitizePrompt(p2, m2);
  console.log("Multi-match test:", s2); // Should be [FILTERED]
}

test();
