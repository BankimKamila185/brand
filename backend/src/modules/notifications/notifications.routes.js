import { Router } from "express";
import { db } from "../../config/database";
import { asyncHandler } from "../../middleware/errorHandler";
import { authenticate } from "../../middleware/auth";
import { sendSuccess } from "../../utils/response";

const router = Router();
router.use(authenticate);

// GET /api/notifications
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const notifications = await db.notification.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        data: true,
        isRead: true,
        createdAt: true,
      },
    });
    const unreadCount = await db.notification.count({
      where: { userId: req.user.sub, isRead: false },
    });
    sendSuccess(res, { notifications, unreadCount });
  }),
);

// PATCH /api/notifications/read-all
router.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    await db.notification.updateMany({
      where: { userId: req.user.sub, isRead: false },
      data: { isRead: true },
    });
    sendSuccess(res, null, "All notifications marked as read");
  }),
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    await db.notification.update({
      where: { id: req.params["id"] },
      data: { isRead: true },
    });
    sendSuccess(res, null, "Notification marked as read");
  }),
);

export default router;
