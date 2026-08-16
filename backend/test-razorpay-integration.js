import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:4000";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "qJNk3pITvok3MjIFqIr9gYRm";
const KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_TQZvzQsU4iZMFt";

console.log("=== Testing Razorpay Integration Endpoint logic ===");
console.log("Key ID:", KEY_ID);
console.log("Key Secret:", KEY_SECRET ? "LOADED" : "MISSING");

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Order Creation with amount < 100 paise
  try {
    const res = await fetch(`${BASE_URL}/api/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 50, currency: "INR" }),
    });
    const data = await res.json();
    if (res.status === 400) {
      console.log("✅ Test 1 Passed: Amount < 100 correctly rejected with status 400:", data.message);
      passed++;
    } else {
      console.error("❌ Test 1 Failed: Expected 400, got", res.status, data);
      failed++;
    }
  } catch (err) {
    console.error("❌ Test 1 Failed with exception:", err.message);
    failed++;
  }

  // Test 2: Order Creation with valid amount (50000 paise = 500 INR)
  let createdOrderId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 50000, currency: "INR", receipt: "test_receipt_1" }),
    });
    const data = await res.json();
    if (res.status === 200 && (data.order_id || data.razorpayOrderId)) {
      createdOrderId = data.order_id || data.razorpayOrderId;
      console.log("✅ Test 2 Passed: Created Razorpay Order ID:", createdOrderId, "Amount:", data.amount, "Currency:", data.currency);
      passed++;
    } else {
      console.error("❌ Test 2 Failed: Expected 200 with order_id, got", res.status, data);
      failed++;
    }
  } catch (err) {
    console.error("❌ Test 2 Failed with exception:", err.message);
    failed++;
  }

  // Test 3: Verify Payment with missing fields
  try {
    const res = await fetch(`${BASE_URL}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: "order_123" }),
    });
    const data = await res.json();
    if (res.status === 400) {
      console.log("✅ Test 3 Passed: Missing fields correctly rejected with 400:", data.message);
      passed++;
    } else {
      console.error("❌ Test 3 Failed: Expected 400 for missing fields, got", res.status, data);
      failed++;
    }
  } catch (err) {
    console.error("❌ Test 3 Failed with exception:", err.message);
    failed++;
  }

  // Test 4: Verify Payment with invalid signature
  try {
    const res = await fetch(`${BASE_URL}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: createdOrderId || "order_fake123",
        payment_id: "pay_fake123",
        razorpay_signature: "invalid_signature_hex",
      }),
    });
    const data = await res.json();
    if (res.status === 400) {
      console.log("✅ Test 4 Passed: Signature mismatch correctly rejected with 400:", data.message);
      passed++;
    } else {
      console.error("❌ Test 4 Failed: Expected 400 for signature mismatch, got", res.status, data);
      failed++;
    }
  } catch (err) {
    console.error("❌ Test 4 Failed with exception:", err.message);
    failed++;
  }

  // Test 5: Verify Payment with VALID signature
  if (createdOrderId) {
    try {
      const mockPaymentId = "pay_test_" + Date.now();
      const validSignature = crypto
        .createHmac("sha256", KEY_SECRET)
        .update(`${createdOrderId}|${mockPaymentId}`)
        .digest("hex");

      const res = await fetch(`${BASE_URL}/api/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: createdOrderId,
          payment_id: mockPaymentId,
          razorpay_signature: validSignature,
        }),
      });
      const data = await res.json();
      if (res.status === 200 && (data.success || data.status === "success")) {
        console.log("✅ Test 5 Passed: Valid payment signature verified successfully!");
        passed++;
      } else {
        console.error("❌ Test 5 Failed: Expected 200 success, got", res.status, data);
        failed++;
      }
    } catch (err) {
      console.error("❌ Test 5 Failed with exception:", err.message);
      failed++;
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();
