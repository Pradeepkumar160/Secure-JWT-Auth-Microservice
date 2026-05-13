import nodemailer from "nodemailer";
import { ENV } from "../_core/env";

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter() {
  if (!transporter && ENV.emailUser && ENV.emailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.emailUser,
        pass: ENV.emailPass,
      },
    });
  }
  return transporter;
}

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; message: string }> {
  try {
    const emailTransporter = getTransporter();

    if (!emailTransporter) {
      console.warn("[Email] Email service not configured");
      return { success: false, message: "Email service not available" };
    }

    await emailTransporter.sendMail({
      from: ENV.emailUser,
      to,
      subject,
      html,
    });

    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return { success: false, message: "Failed to send email" };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const verificationLink = `${ENV.clientUrl}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
      <p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

  const result = await sendEmail(email, "Verify Your Email Address", html);
  return result.success;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetLink = `${ENV.clientUrl}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  `;

  const result = await sendEmail(email, "Reset Your Password", html);
  return result.success;
}
