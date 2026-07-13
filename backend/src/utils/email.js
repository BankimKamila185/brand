import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "./logger";

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

export const sendEmail = async (options) => {
  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error("Failed to send email:", error);
    throw new Error("Email delivery failed");
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
            <td style="padding: 12px 0; font-weight: 700; text-align: right;">₹${total.toFixed(2)}</td>
          </tr>
        </table>
        <p style="color: #999; font-size: 12px;">You will receive shipping updates via email. Thank you for shopping with Tevar.</p>
      </div>
    `,
  });
};
