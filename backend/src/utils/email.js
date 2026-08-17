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
    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(`Brevo API Key validation failed: ${data.message || response.statusText}`);
    }
    return true;
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
      const fromMatch = env.SMTP_FROM.match(/^(.*?)\s*<([^>]+)>$/);
      const rawSenderName = fromMatch ? fromMatch[1].trim() : "The Outliers Studio";
      const rawSenderEmail = fromMatch ? fromMatch[2].trim() : env.SMTP_FROM;

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
      from: env.SMTP_FROM,
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

export const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: "Verify your Tevar account",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px;">TEVAR</h1>
        <hr style="border: 1px solid #000; margin-bottom: 32px;" />
        <h2 style="font-size: 20px; font-weight: 700;">Welcome, ${name}!</h2>
        <p style="color: #555; line-height: 1.6;">Please verify your email address to complete your account setup.</p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none;
                  font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; margin: 24px 0;">
          Verify Email
        </a>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: "Reset your Tevar password",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px;">TEVAR</h1>
        <hr style="border: 1px solid #000; margin-bottom: 32px;" />
        <h2 style="font-size: 20px; font-weight: 700;">Password Reset Request</h2>
        <p style="color: #555; line-height: 1.6;">Hi ${name}, we received a request to reset your password.</p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; text-decoration: none;
                  font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 13px; margin: 24px 0;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

export const sendOrderConfirmationEmail = async (to, name, orderId, total) => {
  await sendEmail({
    to,
    subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
        <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px;">TEVAR</h1>
        <hr style="border: 1px solid #000; margin-bottom: 32px;" />
        <h2 style="font-size: 20px; font-weight: 700;">Order Confirmed! 🎉</h2>
        <p style="color: #555; line-height: 1.6;">Hi ${name}, your order has been placed successfully.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Order ID</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 700; text-align: right;">#${orderId.slice(-8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #666;">Total Amount</td>
            <td style="padding: 12px 0; font-weight: 700; text-align: right;">₹${Number(total).toFixed(2)}</td>
          </tr>
        </table>
        <p style="color: #999; font-size: 12px;">You will receive shipping updates via email. Thank you for shopping with Tevar.</p>
      </div>
    `,
  });

  // Send Admin Notification Email
  if (env.ADMIN_EMAIL) {
    sendEmail({
      to: env.ADMIN_EMAIL,
      subject: `🚨 New Order Placed — #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px;">
          <h1 style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px;">TEVAR ADMIN</h1>
          <hr style="border: 1px solid #000; margin-bottom: 32px;" />
          <h2 style="font-size: 20px; font-weight: 700;">New Customer Order! 🛍️</h2>
          <p style="color: #555; line-height: 1.6;">A new order was just placed on your store.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Customer</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 700; text-align: right;">${name} (${to})</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Order ID</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 700; text-align: right;">#${orderId.slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #666;">Total Amount</td>
              <td style="padding: 12px 0; font-weight: 700; text-align: right;">₹${Number(total).toFixed(2)}</td>
            </tr>
          </table>
          <p style="color: #999; font-size: 12px;">Log in to admin dashboard to manage order fulfillment.</p>
        </div>
      `,
    }).catch((e) => logger.error("Admin order notification email failed:", e));
  }
};
