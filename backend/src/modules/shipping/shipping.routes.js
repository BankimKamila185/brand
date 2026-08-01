import { Router } from "express";
import { asyncHandler, AppError } from "../../middleware/errorHandler.js";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import { sendSuccess } from "../../utils/response.js";
import {
  checkVelocityServiceability,
  createVelocityForwardShipment,
  trackVelocityShipments,
  cancelVelocityShipments,
  calculateVelocityRates,
  createVelocityWarehouse,
} from "../../services/velocity.service.js";

const router = Router();

// POST /api/shipping/serviceability — Check pincode serviceability (Public or authenticated)
router.post(
  "/serviceability",
  asyncHandler(async (req, res) => {
    const { fromPincode, toPincode, paymentMode = "prepaid", shipmentType = "forward" } = req.body;
    if (!toPincode) throw new AppError("toPincode (destination pincode) is required", 400);

    const result = await checkVelocityServiceability({
      from: fromPincode,
      to: toPincode,
      payment_mode: paymentMode,
      shipment_type: shipmentType,
    });

    sendSuccess(res, result, "Serviceability check completed");
  }),
);

// POST /api/shipping/rates — Calculate shipping rates
router.post(
  "/rates",
  asyncHandler(async (req, res) => {
    const { journey_type = "forward", origin_pincode, destination_pincode, dead_weight = 500, length = 20, width = 15, height = 10, payment_method = "prepaid", shipment_value = 0 } = req.body;
    if (!destination_pincode) throw new AppError("destination_pincode is required", 400);

    const rates = await calculateVelocityRates({
      journey_type,
      origin_pincode: origin_pincode || "400097",
      destination_pincode,
      dead_weight: Number(dead_weight),
      length: Number(length),
      width: Number(width),
      height: Number(height),
      payment_method,
      shipment_value: Number(shipment_value),
    });

    sendSuccess(res, rates, "Shipping rates calculated");
  }),
);

// POST /api/shipping/track — Track shipment by AWB (Public or user)
router.post(
  "/track",
  asyncHandler(async (req, res) => {
    const { awb, awbs } = req.body;
    const awbList = awbs || (awb ? [awb] : null);
    if (!awbList || awbList.length === 0) throw new AppError("awb or awbs array is required", 400);

    const trackingData = await trackVelocityShipments(awbList);
    sendSuccess(res, trackingData, "Tracking details retrieved");
  }),
);

// Admin-only endpoints below
router.use(authenticate, requireAdmin);

// POST /api/shipping/create-shipment — Manifest order & assign courier (Admin)
router.post(
  "/create-shipment",
  asyncHandler(async (req, res) => {
    const shipmentPayload = req.body;
    if (!shipmentPayload.order_id || !shipmentPayload.billing_customer_name) {
      throw new AppError("order_id and customer billing details are required", 400);
    }

    const shipment = await createVelocityForwardShipment(shipmentPayload);
    sendSuccess(res, shipment, "Shipment manifested successfully with Velocity");
  }),
);

// POST /api/shipping/cancel — Cancel shipment by AWB (Admin)
router.post(
  "/cancel",
  asyncHandler(async (req, res) => {
    const { awb, awbs } = req.body;
    const awbList = awbs || (awb ? [awb] : null);
    if (!awbList || awbList.length === 0) throw new AppError("awb or awbs array is required", 400);

    const result = await cancelVelocityShipments(awbList);
    sendSuccess(res, result, "Shipment cancellation request initiated");
  }),
);

// POST /api/shipping/warehouse — Create pickup warehouse in Velocity (Admin)
router.post(
  "/warehouse",
  asyncHandler(async (req, res) => {
    const warehouseData = req.body;
    const result = await createVelocityWarehouse(warehouseData);
    sendSuccess(res, result, "Warehouse created in Velocity Shipping");
  }),
);

export default router;
