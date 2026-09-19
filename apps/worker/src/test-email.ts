import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

import { Resend } from "resend";

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    // Resend's shared testing domain — works without verifying your
    // own domain, exactly for cases like this.
    from: "onboarding@resend.dev",
    // Replace with the actual email address you signed up to Resend
    // with — free tier only delivers to your own verified address.
    to: "www.alphastriker123@gmail.com",
    subject: "Test alert from JobAggregator",
    html: "<p>This is a test email confirming Resend is wired up correctly.</p>",
  });

  console.log("Send result:", JSON.stringify(result, null, 2));
  await new Promise((resolve) => setTimeout(resolve, 200));
  process.exit(0);
}

main();
