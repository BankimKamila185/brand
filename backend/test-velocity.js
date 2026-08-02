import "dotenv/config";
import {
  getVelocityToken,
  checkVelocityServiceability,
  calculateVelocityRates,
} from "./src/services/velocity.service.js";

async function testVelocity() {
  console.log("--------------------------------------------------");
  console.log("       Velocity Shipping API Integration Test     ");
  console.log("--------------------------------------------------");
  console.log(`Base URL:  ${process.env.VELOCITY_BASE_URL || "https://shazam.velocity.in"}`);
  console.log(`Username:  ${process.env.VELOCITY_USERNAME || "+917304406772"}`);
  console.log("--------------------------------------------------");

  if (!process.env.VELOCITY_PASSWORD) {
    console.warn("⚠️ Warning: VELOCITY_PASSWORD is not set in backend/.env");
    console.log("\nPlease add your Velocity account password to backend/.env:");
    console.log("  VELOCITY_PASSWORD=your_actual_password\n");
    process.exit(1);
  }

  try {
    console.log("\n🔍 1. Testing Authentication with Velocity...");
    const token = await getVelocityToken();
    console.log(`✅ Auth Successful! Bearer Token acquired: ${token.slice(0, 15)}...`);

    console.log("\n🔍 2. Testing Pincode Serviceability (400097 -> 110001)...");
    const serviceability = await checkVelocityServiceability({
      from: "400097",
      to: "110001",
      payment_mode: "prepaid",
    });
    console.log("✅ Serviceability Response:", JSON.stringify(serviceability, null, 2));

    console.log("\n🔍 3. Testing Shipping Rate Calculation...");
    const rates = await calculateVelocityRates({
      journey_type: "forward",
      origin_pincode: "400097",
      destination_pincode: "110001",
      dead_weight: 500,
      length: 20,
      width: 15,
      height: 10,
      payment_method: "prepaid",
    });
    console.log("✅ Rates Response:", JSON.stringify(rates, null, 2));

    console.log("\n🎉 All Velocity Shipping API tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Velocity Shipping API Test Failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

testVelocity();
