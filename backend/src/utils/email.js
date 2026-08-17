import nodemailer from "nodemailer";
import { env } from "../config/env.js";
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
        cachedVerifiedSender = { name: preferredSender.name || preferred.name, email: preferred.email };
        return cachedVerifiedSender;
      }
      if (activeSenders.length > 0) {
        cachedVerifiedSender = { name: preferredSender.name || "The Outliers Studio", email: activeSenders[0].email };
        return cachedVerifiedSender;
      }
    }
  } catch (err) {
    logger.warn("Could not fetch Brevo senders list:", err.message);
  }
  return preferredSender;
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
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0b0a08; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <div style="display: none; font-size: 1px; color: #0b0a08; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0a08; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #12110e; border: 1px solid #28251e; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 40px 32px 28px; background: linear-gradient(180deg, #1a1814 0%, #12110e 100%); border-bottom: 1px solid #23201a;">
              <!-- Brand Title -->
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.28em; color: #ffffff; text-transform: uppercase; line-height: 1.2;">
                THE OUTLIERS
              </h1>
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.35em; color: #c5a968; text-transform: uppercase; margin-top: 5px;">
                S T U D I O
              </div>
              <div style="display: inline-block; margin-top: 14px; padding: 4px 14px; border-radius: 20px; background-color: rgba(197, 169, 104, 0.1); border: 1px solid rgba(197, 169, 104, 0.25); font-size: 9px; font-weight: 700; letter-spacing: 0.2em; color: #e5d2a4; text-transform: uppercase;">
                BUILT DIFFERENT · WORN BY FEW
              </div>
            </td>
          </tr>

          <!-- Main Content Slot -->
          <tr>
            <td style="padding: 36px 32px 32px; color: #d6d3cd; font-size: 14px; line-height: 1.65;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 36px; background-color: #0d0c0a; border-top: 1px solid #1f1d17; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 11px; color: #78746b; letter-spacing: 0.05em;">
                Need assistance? Contact our concierge at <a href="mailto:hello@theoutliersstudio.com" style="color: #c5a968; text-decoration: none; font-weight: 600;">hello@theoutliersstudio.com</a>
              </p>
              <p style="margin: 0 0 14px; font-size: 10px; color: #524f48; letter-spacing: 0.08em; text-transform: uppercase;">
                100% Encrypted & Authentic · Crafted for Excellence
              </p>
              <p style="margin: 0; font-size: 10px; color: #43403a; letter-spacing: 0.04em;">
                © 2026 The Outliers Studio. All rights reserved. · <a href="${env.FRONTEND_URL || "https://theoutliersstudio.com"}" style="color: #666258; text-decoration: underline;">theoutliersstudio.com</a>
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

    <div style="background-color: #171511; border: 1px solid #28241c; border-radius: 14px; padding: 24px; margin-bottom: 28px; text-align: center;">
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

    <div style="background-color: #171511; border: 1px solid #28241c; border-radius: 14px; padding: 24px; margin-bottom: 28px; text-align: center;">
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
  const shortOrderId = orderId.slice(-8).toUpperCase();
  const displayName = name || to.split("@")[0] || "Customer";
  const orderUrl = `${env.FRONTEND_URL}/profile`;

  const customerContent = `
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 56px; height: 56px; border-radius: 50%; background: rgba(34, 197, 94, 0.12); border: 1px solid #22c55e; line-height: 54px; font-size: 24px; color: #22c55e; margin-bottom: 16px;">
        ✓
      </div>
      <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
        Order Confirmed! 🎉
      </h2>
      <p style="margin: 0; color: #9c978e; font-size: 14px;">
        Thank you for ordering with us, <strong style="color: #ffffff;">${displayName}</strong>.
      </p>
    </div>

    <!-- Order Receipt Card -->
    <div style="background-color: #171511; border: 1px solid #28241c; border-radius: 16px; padding: 24px; margin-bottom: 28px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #26221a; padding-bottom: 16px; margin-bottom: 16px;">
        <div>
          <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #8a857b; text-transform: uppercase;">Order Number</span>
          <div style="font-size: 16px; font-weight: 800; color: #c5a968; font-family: monospace; margin-top: 2px;">#${shortOrderId}</div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
            CONFIRMED
          </span>
        </div>
      </div>

      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 12px 0;">
        <tr>
          <td style="padding: 10px 0; color: #9e998e; font-size: 13px; border-bottom: 1px solid #1f1c16;">Status</td>
          <td style="padding: 10px 0; color: #ffffff; font-weight: 700; text-align: right; font-size: 13px; border-bottom: 1px solid #1f1c16;">Being Prepared for Dispatch</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #ffffff; font-size: 15px; font-weight: 700;">Total Amount</td>
          <td style="padding: 12px 0; color: #c5a968; font-weight: 900; text-align: right; font-size: 18px;">₹${Number(total).toFixed(2)}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 20px;">
        <a href="${orderUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #c5a968 0%, #a88947 100%); color: #000000; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; font-size: 12px; box-shadow: 0 4px 16px rgba(197, 169, 104, 0.3);">
          View Order in Profile
        </a>
      </div>
    </div>

    <p style="margin: 0; text-align: center; color: #6b665d; font-size: 12px; line-height: 1.6;">
      You will receive live tracking notifications as soon as your package ships from our studio warehouse.
    </p>
  `;

  await sendEmail({
    to,
    subject: `Order Confirmed #${shortOrderId} — The Outliers Studio`,
    html: renderEmailLayout({
      title: `Order Confirmed #${shortOrderId} — The Outliers Studio`,
      preheader: `Thank you for your order #${shortOrderId}! Total: ₹${Number(total).toFixed(2)}.`,
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

      <div style="background-color: #171511; border: 1px solid #28241c; border-radius: 16px; padding: 22px; margin-bottom: 24px;">
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
            <td style="padding: 10px 0; color: #4ade80; font-weight: 900; text-align: right; font-size: 16px;">₹${Number(total).toFixed(2)}</td>
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
      subject: `🚨 [Outliers Studio] New Order #${shortOrderId} (₹${Number(total).toFixed(2)})`,
      html: renderEmailLayout({
        title: `New Order #${shortOrderId} — The Outliers Studio Admin`,
        preheader: `New order #${shortOrderId} placed by ${displayName} for ₹${Number(total).toFixed(2)}.`,
        content: adminContent,
      }),
    }).catch((e) => logger.error("Admin order notification email failed:", e));
  }
};
