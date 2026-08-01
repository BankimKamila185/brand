import "dotenv/config";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  verifyEmailConnection,
} from "./src/utils/email.js";

const targetEmail = process.argv[2];
const type = (process.argv[3] || "verify").toLowerCase();

async function runTest() {
  console.log("--------------------------------------------------");
  console.log("       Tevar — Real User Email Test Runner        ");
  console.log("--------------------------------------------------");

  if (!targetEmail) {
    console.error("❌ Please provide a real target email address.");
    console.log("\nUsage:");
    console.log("  npm run test:email <your-email@example.com> [verify|reset|order]");
    console.log("\nExamples:");
    console.log("  npm run test:email john@gmail.com verify");
    console.log("  npm run test:email john@gmail.com reset");
    console.log("  npm run test:email john@gmail.com order\n");
    process.exit(1);
  }

  try {
    console.log("🔍 Verifying Brevo API connection...");
    await verifyEmailConnection();
    console.log("✅ Brevo API connection verified!");

    console.log(`\n📧 Sending '${type}' email to: ${targetEmail}...`);

    if (type === "reset") {
      await sendPasswordResetEmail(targetEmail, "Valued Customer", "sample-reset-token-123456");
      console.log(`🎉 Password Reset email delivered to ${targetEmail}! Check inbox/spam.`);
    } else if (type === "order") {
      await sendOrderConfirmationEmail(targetEmail, "Valued Customer", "ord_demo987654321", 4999.00);
      console.log(`🎉 Order Confirmation email delivered to ${targetEmail}! Check inbox/spam.`);
    } else {
      await sendVerificationEmail(targetEmail, "Valued Customer", "sample-verify-token-123456");
      console.log(`🎉 Account Verification email delivered to ${targetEmail}! Check inbox/spam.`);
    }
  } catch (error) {
    console.error("\n❌ Email delivery failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

runTest();
