// src/server/lib/emailService.ts
import nodemailer from 'nodemailer';

// --- ট্রান্সপোর্টার তৈরি করার ফাংশন ---
// এটি আপনার ইমেল প্রোভাইডার (Gmail, SendGrid, ইত্যাদি) এর সাথে সংযোগ স্থাপন করবে
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// --- মূল ইমেল পাঠানোর ফাংশন ---
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Bazaarfly" <${process.env.EMAIL_USER}>`, // প্রেরকের নাম ও ইমেল
      to,
      subject,
      html,
      text,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Could not send email');
  }
};