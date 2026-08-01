import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Get or refresh Velocity API auth token (valid for 24 hours).
 */
export const getVelocityToken = async () => {
  if (cachedToken && tokenExpiresAt && new Date() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!env.VELOCITY_USERNAME || !env.VELOCITY_PASSWORD) {
    throw new Error("Velocity credentials (VELOCITY_USERNAME / VELOCITY_PASSWORD) are not configured in environment.");
  }

  try {
    const response = await fetch(`${env.VELOCITY_BASE_URL}/custom/api/v1/auth-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: env.VELOCITY_USERNAME,
        password: env.VELOCITY_PASSWORD,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.token) {
      logger.error("Velocity authentication failed:", data);
      throw new Error(data.message || `Velocity auth failed with status ${response.status}`);
    }

    cachedToken = data.token;
    // Expire 1 hour before actual expiration for safety
    tokenExpiresAt = data.expires_at ? new Date(new Date(data.expires_at).getTime() - 3600 * 1000) : new Date(Date.now() + 23 * 3600 * 1000);
    logger.info("Velocity Shipping API token acquired successfully.");
    return cachedToken;
  } catch (error) {
    logger.error("Failed to authenticate with Velocity Shipping API:", error);
    throw error;
  }
};

/**
 * Make an authenticated HTTP request to Velocity Shipping API.
 */
const velocityRequest = async (endpoint, options = {}) => {
  const token = await getVelocityToken();
  const response = await fetch(`${env.VELOCITY_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    logger.error(`Velocity API Error [${options.method || "GET"} ${endpoint}]:`, data);
    throw new Error(data.message || `Velocity request failed (${response.status})`);
  }
  return data;
};

/**
 * 1. Check Serviceability between pincodes.
 */
export const checkVelocityServiceability = async ({ from, to, payment_mode = "prepaid", shipment_type = "forward" }) => {
  return velocityRequest("/custom/api/v1/serviceability", {
    method: "POST",
    body: JSON.stringify({
      from: from || env.VELOCITY_PICKUP_PINCODE,
      to,
      payment_mode: payment_mode.toLowerCase(),
      shipment_type,
    }),
  });
};

/**
 * 2. Create a pickup warehouse in Velocity Shipping.
 */
export const createVelocityWarehouse = async (warehouseData) => {
  return velocityRequest("/custom/api/v1/warehouse", {
    method: "POST",
    body: JSON.stringify(warehouseData),
  });
};

/**
 * 3. Create & Manifest Forward Shipment (Assign courier, generate AWB & Label).
 */
export const createVelocityForwardShipment = async (shipmentData) => {
  const payload = {
    pickup_location: env.VELOCITY_PICKUP_LOCATION,
    warehouse_id: env.VELOCITY_WAREHOUSE_ID || undefined,
    ...shipmentData,
  };
  return velocityRequest("/custom/api/v1/forward-order-orchestration", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * 4. Track shipments by AWB codes.
 */
export const trackVelocityShipments = async (awbs) => {
  const awbList = Array.isArray(awbs) ? awbs : [awbs];
  return velocityRequest("/custom/api/v1/order-tracking", {
    method: "POST",
    body: JSON.stringify({ awbs: awbList }),
  });
};

/**
 * 5. Cancel active shipments by AWB.
 */
export const cancelVelocityShipments = async (awbs) => {
  const awbList = Array.isArray(awbs) ? awbs : [awbs];
  return velocityRequest("/custom/api/v1/cancel-order", {
    method: "POST",
    body: JSON.stringify({ awbs: awbList }),
  });
};

/**
 * 6. Create & Manifest Reverse Pickup Shipment (Returns).
 */
export const createVelocityReverseShipment = async (returnShipmentData) => {
  return velocityRequest("/custom/api/v1/reverse-order-orchestration", {
    method: "POST",
    body: JSON.stringify(returnShipmentData),
  });
};

/**
 * 7. Calculate Shipping Rates.
 */
export const calculateVelocityRates = async (rateData) => {
  return velocityRequest("/custom/api/v1/rates", {
    method: "POST",
    body: JSON.stringify(rateData),
  });
};
