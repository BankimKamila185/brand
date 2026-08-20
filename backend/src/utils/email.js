import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { db } from "../config/database.js";
import { logger } from "./logger.js";

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const getBrevoApiKey = () => {
  if (env.BREVO_API_KEY) return env.BREVO_API_KEY;
  return null;
};

export const verifyEmailConnection = async () => {
  const apiKey = getBrevoApiKey();
  if (apiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/account", {
        headers: {
          accept: "application/json",
          "api-key": apiKey,
        },
      });
      if (response.ok) return true;
      const data = await response.json().catch(() => ({}));
      logger.warn(`Brevo API validation notice (${data.message}). Checking SMTP relay...`);
    } catch (err) {
      logger.warn(`Brevo API check failed (${err.message}). Checking SMTP relay...`);
    }
  }
  const mailer = getTransporter();
  return mailer.verify();
};

let cachedVerifiedSender = null;
const getVerifiedSender = async (apiKey, preferredSender) => {
  if (cachedVerifiedSender) return cachedVerifiedSender;
  try {
    const res = await fetch("https://api.brevo.com/v3/senders", {
      headers: { accept: "application/json", "api-key": apiKey },
    });
    if (res.ok) {
      const data = await res.json();
      const senders = data.senders || [];
      const activeSenders = senders.filter((s) => s.active);
      const preferred = activeSenders.find(
        (s) => s.email.toLowerCase() === preferredSender.email.toLowerCase()
      );
      if (preferred) {
        cachedVerifiedSender = { name: "The Outliers Studio", email: preferred.email };
        return cachedVerifiedSender;
      }
      if (activeSenders.length > 0) {
        cachedVerifiedSender = { name: "The Outliers Studio", email: activeSenders[0].email };
        return cachedVerifiedSender;
      }
    }
  } catch (err) {
    logger.warn("Could not fetch Brevo senders list:", err.message);
  }
  return { name: "The Outliers Studio", email: preferredSender.email };
};

export const sendEmail = async (options) => {
  const apiKey = getBrevoApiKey();
  let lastError = null;

  // Option 1: Brevo REST API v3 (if Brevo API key is available)
  if (apiKey) {
    try {
      const fromMatch = (env.SMTP_FROM || "").match(/^(.*?)\s*<([^>]+)>$/);
      const rawSenderName = fromMatch ? fromMatch[1].trim() : "The Outliers Studio";
      const rawSenderEmail = fromMatch ? fromMatch[2].trim() : (env.SMTP_FROM || "hello@theoutliersstudio.com");

      const verifiedSender = await getVerifiedSender(apiKey, {
        name: rawSenderName,
        email: rawSenderEmail,
      });

      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: verifiedSender.name, email: verifiedSender.email },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        logger.error(`Brevo API error (${response.status}):`, data);
        throw new Error(data.message || `Brevo API error ${response.status}`);
      }

      logger.info(`Email sent via Brevo API to ${options.to}: ${options.subject} (From: ${verifiedSender.email}, ID: ${data.messageId || "ok"})`);
      return { messageId: data.messageId };
    } catch (error) {
      lastError = error;
      logger.warn(`Brevo API send failed (${error.message}). Attempting SMTP fallback...`);
    }
  }

  // Option 2: SMTP Relay via Nodemailer
  try {
    const mailer = getTransporter();
    const info = await mailer.sendMail({
      from: env.SMTP_FROM || "The Outliers Studio <hello@theoutliersstudio.com>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent via SMTP to ${options.to}: ${options.subject} (ID: ${info.messageId || "ok"})`);
    return info;
  } catch (error) {
    logger.error("Failed to send email via Brevo SMTP:", error);
    throw new Error(`Email delivery failed: ${lastError ? `${lastError.message} | SMTP: ${error.message}` : error.message}`);
  }
};

/**
 * Shared Email Template Shell
 */
const renderEmailLayout = ({ title, preheader, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0c0b09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <div style="display: none; font-size: 1px; color: #0c0b09; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0b09; padding: 36px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141310; border: 1px solid #23211c; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.75);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 36px 28px 24px; background: linear-gradient(180deg, #1b1915 0%, #141310 100%); border-bottom: 1px solid #24221b;">
              <!-- Brand Title -->
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.28em; color: #ffffff; text-transform: uppercase; line-height: 1.2;">
                THE OUTLIERS
              </h1>
              <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.4em; color: #c5a968; text-transform: uppercase; margin-top: 4px;">
                S T U D I O
              </div>
              <div style="display: inline-block; margin-top: 14px; padding: 4px 14px; border-radius: 20px; background-color: rgba(197, 169, 104, 0.08); border: 1px solid rgba(197, 169, 104, 0.22); font-size: 8.5px; font-weight: 800; letter-spacing: 0.22em; color: #e5d2a4; text-transform: uppercase;">
                BUILT DIFFERENT · WORN BY FEW
              </div>
            </td>
          </tr>

          <!-- Main Content Slot -->
          <tr>
            <td style="padding: 32px 28px 28px; color: #d6d3cd; font-size: 14px; line-height: 1.65;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 28px 32px; background-color: #0d0c0a; border-top: 1px solid #1f1d17; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #8c887f; letter-spacing: 0.04em;">
                Need assistance? Contact our concierge at <a href="mailto:hello@theoutliersstudio.com" style="color: #c5a968; text-decoration: none; font-weight: 700;">hello@theoutliersstudio.com</a>
              </p>
              <p style="margin: 0 0 10px; font-size: 10px; color: #524f48; letter-spacing: 0.08em; text-transform: uppercase;">
                100% Encrypted & Authentic · Mumbai, India
              </p>
              <p style="margin: 0; font-size: 10px; color: #43403a; letter-spacing: 0.04em;">
                © 2026 The Outliers Studio. All rights reserved. · <a href="${env.FRONTEND_URL || "https://theoutliersstudio.com"}" style="color: #736f65; text-decoration: underline;">theoutliersstudio.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  const displayName = name || to.split("@")[0] || "Member";

  const content = `
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 56px; height: 56px; border-radius: 50%; background: rgba(197, 169, 104, 0.12); border: 1px solid #c5a968; line-height: 54px; font-size: 24px; color: #c5a968; margin-bottom: 16px;">
        ✉️
      </div>
      <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
        Verify Your Account
      </h2>
      <p style="margin: 0; color: #9c978e; font-size: 14px;">
        Welcome to The Outliers Studio family, <strong style="color: #ffffff;">${displayName}</strong>.
      </p>
    </div>

    <div style="background-color: #181612; border: 1px solid #28241c; border-radius: 14px; padding: 24px; margin-bottom: 28px; text-align: center;">
      <p style="margin: 0 0 16px; color: #bfbab0; font-size: 13.5px; line-height: 1.6;">
        Please confirm your email address to unlock your exclusive access, save your size preferences, and track your limited-edition orders.
      </p>
      
      <a href="${verifyUrl}"
         style="display: inline-block; background: linear-gradient(135deg, #c5a968 0%, #a88947 100%); color: #000000; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; box-shadow: 0 6px 20px rgba(197, 169, 104, 0.35);">
        Verify Email Address
      </a>
    </div>

    <p style="margin: 0; text-align: center; color: #6b665d; font-size: 11.5px; line-height: 1.5;">
      This verification link is active for 24 hours.<br />If you didn't create an account with The Outliers Studio, you can safely ignore this email.
    </p>
  `;

  await sendEmail({
    to,
    subject: "Verify Your Account — The Outliers Studio",
    html: renderEmailLayout({
      title: "Verify Your Account — The Outliers Studio",
      preheader: `Welcome ${displayName}! Please verify your email to unlock your account.`,
      content,
    }),
  });
};

export const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  const displayName = name || to.split("@")[0] || "Member";

  const content = `
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); line-height: 54px; font-size: 24px; color: #ef4444; margin-bottom: 16px;">
        🔒
      </div>
      <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
        Password Reset Request
      </h2>
      <p style="margin: 0; color: #9c978e; font-size: 14px;">
        Hi <strong style="color: #ffffff;">${displayName}</strong>, we received a request to securely reset your password.
      </p>
    </div>

    <div style="background-color: #181612; border: 1px solid #28241c; border-radius: 14px; padding: 24px; margin-bottom: 28px; text-align: center;">
      <p style="margin: 0 0 18px; color: #bfbab0; font-size: 13.5px; line-height: 1.6;">
        Click the button below to choose a new password for your Outliers Studio account:
      </p>
      
      <a href="${resetUrl}"
         style="display: inline-block; background: #ffffff; color: #000000; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);">
        Reset Password
      </a>
    </div>

    <p style="margin: 0; text-align: center; color: #6b665d; font-size: 11.5px; line-height: 1.5;">
      This password reset link expires in <strong>1 hour</strong>.<br />If you didn't request this change, please ignore this email; your account remains secure.
    </p>
  `;

  await sendEmail({
    to,
    subject: "Reset Your Password — The Outliers Studio",
    html: renderEmailLayout({
      title: "Reset Your Password — The Outliers Studio",
      preheader: `Hi ${displayName}, request to reset your Outliers Studio password.`,
      content,
    }),
  });
};

export const sendOrderConfirmationEmail = async (to, name, orderId, total) => {
  const shortOrderId = orderId ? orderId.slice(-8).toUpperCase() : "N/A";
  let displayName = name || to.split("@")[0] || "Customer";
  const orderUrl = `${env.FRONTEND_URL}/profile?tab=orders&orderId=${orderId}`;

  // Fetch complete order details if available in database
  let orderData = null;
  if (orderId) {
    try {
      orderData = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          address: true,
          payment: true,
          coupon: true,
          user: { select: { name: true, email: true } },
        },
      });
      if (orderData?.user?.name) displayName = orderData.user.name;
    } catch (e) {
      logger.warn("Could not query extended order details for email:", e.message);
    }
  }

  const items = orderData?.items || [];
  const address = orderData?.address;
  const payment = orderData?.payment;
  const isCod = payment?.method === "COD";
  const subtotal = orderData ? Number(orderData.subtotal || 0) : Number(total || 0);
  const discount = orderData ? Number(orderData.discount || 0) : 0;
  const shipping = orderData ? Number(orderData.shippingCharge || 0) : 0;
  const finalTotal = orderData ? Number(orderData.total || 0) : Number(total || 0);

  // Render Purchased Items Rows
  const itemsHtml = items.length > 0
    ? items.map((item) => {
        const itemImage = item.imageSnapshot || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160&q=80";
        const itemPrice = Number(item.priceSnapshot || 0) * (item.quantity || 1);
        return `
          <tr>
            <td style="padding: 14px 0; border-bottom: 1px solid #23201a; vertical-align: middle;" width="64">
              <img src="${itemImage}" alt="${item.titleSnapshot}" width="56" height="70" style="border-radius: 8px; object-fit: cover; display: block; border: 1px solid #2d2922;" />
            </td>
            <td style="padding: 14px 12px; border-bottom: 1px solid #23201a; vertical-align: middle;">
              <p style="margin: 0 0 4px; font-weight: 700; color: #ffffff; font-size: 13.5px; line-height: 1.3;">
                ${item.titleSnapshot}
              </p>
              <p style="margin: 0; color: #9c978e; font-size: 11.5px;">
                ${item.variantSnapshot ? `${item.variantSnapshot} · ` : ""}Qty: ${item.quantity}
              </p>
            </td>
            <td align="right" style="padding: 14px 0; border-bottom: 1px solid #23201a; vertical-align: middle; font-weight: 800; color: #ffffff; font-size: 14px;">
              ₹${itemPrice.toFixed(2)}
            </td>
          </tr>
        `;
      }).join("")
    : `
      <tr>
        <td colspan="3" style="padding: 12px 0; color: #9c978e; font-size: 13px;">
          Order #${shortOrderId} — Status: Being Prepared for Dispatch
        </td>
      </tr>
    `;

  const customerContent = `
    <!-- Top Status Banner -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 54px; height: 54px; border-radius: 50%; background: rgba(34, 197, 94, 0.12); border: 1px solid #22c55e; line-height: 52px; font-size: 22px; color: #22c55e; margin-bottom: 14px;">
        ✓
      </div>
      <h2 style="margin: 0 0 6px; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">
        Order Confirmed! 🎉
      </h2>
      <p style="margin: 0; color: #a39e94; font-size: 14px;">
        Thank you for ordering with us, <strong style="color: #ffffff;">${displayName}</strong>.
      </p>
    </div>

    <!-- Order Header Pill Box -->
    <div style="background-color: #181612; border: 1px solid #28241c; border-radius: 14px; padding: 18px 20px; margin-bottom: 20px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td>
            <span style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.14em; color: #7d786f; text-transform: uppercase;">Order Number</span>
            <div style="font-size: 17px; font-weight: 900; color: #c5a968; font-family: monospace; margin-top: 3px;">#${shortOrderId}</div>
          </td>
          <td align="right">
            <span style="display: inline-block; padding: 5px 12px; border-radius: 20px; background-color: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); color: #4ade80; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">
              CONFIRMED
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Section -->
    <div style="background-color: #181612; border: 1px solid #28241c; border-radius: 16px; padding: 20px 22px; margin-bottom: 20px;">
      <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.15em; color: #7d786f; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #24211b; padding-bottom: 8px;">
        Items in Your Order
      </div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        ${itemsHtml}
      </table>

      <!-- Totals Breakdown -->
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #8c877e; font-size: 13px;">Subtotal</td>
          <td align="right" style="padding: 6px 0; color: #d6d3cd; font-weight: 600; font-size: 13px;">₹${subtotal.toFixed(2)}</td>
        </tr>
        ${discount > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: #4ade80; font-size: 13px;">Discount ${orderData?.coupon?.code ? `(${orderData.coupon.code})` : ""}</td>
            <td align="right" style="padding: 6px 0; color: #4ade80; font-weight: 700; font-size: 13px;">-₹${discount.toFixed(2)}</td>
          </tr>
        ` : ""}
        <tr>
          <td style="padding: 6px 0; color: #8c877e; font-size: 13px;">Shipping</td>
          <td align="right" style="padding: 6px 0; color: #4ade80; font-weight: 600; font-size: 13px;">${shipping > 0 ? `₹${shipping.toFixed(2)}` : "Free"}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0 4px; color: #ffffff; font-size: 15px; font-weight: 800; border-top: 1px solid #28241c;">Total Paid</td>
          <td align="right" style="padding: 12px 0 4px; color: #c5a968; font-weight: 900; font-size: 20px; border-top: 1px solid #28241c;">₹${finalTotal.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping & Payment Information -->
    <div style="background-color: #181612; border: 1px solid #28241c; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="vertical-align: top; padding-bottom: 12px;">
            <span style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.14em; color: #7d786f; text-transform: uppercase;">Shipping Address</span>
            ${address ? `
              <p style="margin: 6px 0 2px; font-weight: 700; color: #ffffff; font-size: 13px;">${address.name}</p>
              <p style="margin: 0; color: #a39e94; font-size: 12.5px; line-height: 1.5;">
                ${address.line1}${address.line2 ? `, ${address.line2}` : ""}<br />
                ${address.city}, ${address.state} — ${address.pincode}<br />
                ${address.phone ? `Phone: ${address.phone}` : ""}
              </p>
            ` : `
              <p style="margin: 6px 0 0; color: #a39e94; font-size: 12.5px;">Registered delivery address on file</p>
            `}
          </td>
        </tr>
        <tr>
          <td style="padding-top: 12px; border-top: 1px solid #24211b;">
            <span style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.14em; color: #7d786f; text-transform: uppercase;">Payment Method</span>
            <p style="margin: 4px 0 0; font-weight: 700; color: #ffffff; font-size: 13px;">
              ${isCod ? "🚚 Cash on Delivery (COD)" : "⚡ Paid Online via Razorpay"}
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="${orderUrl}"
         style="display: inline-block; background: linear-gradient(135deg, #c5a968 0%, #a88947 100%); color: #000000; padding: 15px 36px; border-radius: 12px; text-decoration: none; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; box-shadow: 0 6px 20px rgba(197, 169, 104, 0.35);">
        Track Shipment in Profile →
      </a>
    </div>

    <p style="margin: 0; text-align: center; color: #6b665d; font-size: 11.5px; line-height: 1.6;">
      You will receive real-time tracking updates as soon as your parcel is dispatched from our Mumbai studio.
    </p>
  `;

  await sendEmail({
    to,
    toName: displayName,
    subject: `Order Confirmed #${shortOrderId} — The Outliers Studio`,
    html: renderEmailLayout({
      title: `Order Confirmed #${shortOrderId} — The Outliers Studio`,
      preheader: `Thank you for your order #${shortOrderId}! Total: ₹${finalTotal.toFixed(2)}.`,
      content: customerContent,
    }),
  });

  // Admin Notification Email
  if (env.ADMIN_EMAIL) {
    const adminContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 52px; height: 52px; border-radius: 50%; background: rgba(59, 130, 246, 0.15); border: 1px solid #3b82f6; line-height: 50px; font-size: 22px; color: #3b82f6; margin-bottom: 14px;">
          📦
        </div>
        <h2 style="margin: 0 0 6px; font-size: 20px; font-weight: 800; color: #ffffff;">
          New Order Alert
        </h2>
        <p style="margin: 0; color: #9c978e; font-size: 13px;">
          A new customer order was just placed on The Outliers Studio.
        </p>
      </div>

      <div style="background-color: #181612; border: 1px solid #28241c; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 8px 0; color: #8a857b; font-size: 12.5px; border-bottom: 1px solid #221e17;">Customer</td>
            <td style="padding: 8px 0; color: #ffffff; font-weight: 700; text-align: right; font-size: 12.5px; border-bottom: 1px solid #221e17;">${displayName} (${to})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8a857b; font-size: 12.5px; border-bottom: 1px solid #221e17;">Order ID</td>
            <td style="padding: 8px 0; color: #c5a968; font-weight: 800; font-family: monospace; text-align: right; font-size: 13px; border-bottom: 1px solid #221e17;">#${shortOrderId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #ffffff; font-size: 14px; font-weight: 700;">Total Amount</td>
            <td style="padding: 10px 0; color: #4ade80; font-weight: 900; text-align: right; font-size: 16px;">₹${finalTotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8a857b; font-size: 12.5px;">Payment</td>
            <td style="padding: 8px 0; color: #ffffff; font-weight: 700; text-align: right; font-size: 12.5px;">${isCod ? "COD" : "Online (Razorpay)"}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 18px;">
          <a href="${env.FRONTEND_URL}/dashboard/orders"
             style="display: inline-block; background: #ffffff; color: #000000; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px;">
            Open Orders Dashboard
          </a>
        </div>
      </div>
    `;

    sendEmail({
      to: env.ADMIN_EMAIL,
      subject: `🚨 [Outliers Studio] New Order #${shortOrderId} (₹${finalTotal.toFixed(2)})`,
      html: renderEmailLayout({
        title: `New Order #${shortOrderId} — The Outliers Studio Admin`,
        preheader: `New order #${shortOrderId} placed by ${displayName} for ₹${finalTotal.toFixed(2)}.`,
        content: adminContent,
      }),
    }).catch((e) => logger.error("Admin order notification email failed:", e));
  }
};
