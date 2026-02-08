// src/server/lib/emailService.ts
import nodemailer, { Transporter } from "nodemailer";

// 1. Define the global type for caching
declare global {
  var nodemailerTransporter: Transporter | undefined;
}

// ---------------------------------------------
// ENVIRONMENT VALIDATION
// ---------------------------------------------
const requiredEnv = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS"];

function validateEnv(): void {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required email environment variables: ${missing.join(", ")}`
    );
  }
}

// ---------------------------------------------
// SINGLE TRANSPORTER INSTANCE (CACHED VIA GLOBAL)
// ---------------------------------------------
function getTransporter(): Transporter {
  // 2. Check global cache first
  if (global.nodemailerTransporter) {
    return global.nodemailerTransporter;
  }

  validateEnv();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 3. Store in global
  global.nodemailerTransporter = transporter;
  
  return transporter;
}
 

// ---------------------------------------------
// MAIN SEND EMAIL FUNCTION
// ---------------------------------------------
export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: EmailPayload): Promise<void> => {
  try {
    const mailer = getTransporter();

    await mailer.sendMail({
      from: `"Bazaarfly" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ""), // fallback plain text
    });

    console.log(`📧 Email sent successfully: ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw new Error("Could not send email");
  }
};
