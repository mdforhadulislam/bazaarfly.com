// src/server/lib/notificationService.ts

import { Types } from "mongoose";
import { Notification, INotification, NotificationType } from "../models/Notification.model"; 
import { User } from "../models/User.model";
import { sendEmail } from "./emailService";

// Email templates
import {
  welcomeEmail,
  emailVerificationEmail,
  passwordResetEmail,
  affiliateApplicationReceived,
  affiliateApplicationApproved,
  orderConfirmationEmail,
  paymentSuccessEmail,
  paymentFailedEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  walletCommissionEmail,
  payoutSuccessEmail,
  adminAlertEmail,
  contactAutoReplyEmail,
  promotionalEmail,
} from "../templates/EmailTemplates";

// ------------------------------------------------------
// TYPES
// ------------------------------------------------------

export type NotificationChannel = "in_app" | "email" | "sms" | "push";

export interface SendNotificationOptions {
  recipient?: Types.ObjectId | null;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  templatePayload?: Record<string, string | number>;

  clickAction?: {
    url: string;
    external: boolean;
  };

  relatedEntity?: {
    id: Types.ObjectId;
    model:
      | "Order"
      | "Product"
      | "User"
      | "Affiliate"
      | "Category"
      | "Wallet"
      | "Payment";
  };
}

// ------------------------------------------------------
// MAIN SENDER
// ------------------------------------------------------

export const sendNotification = async (
  opts: SendNotificationOptions
): Promise<INotification> => {
  const notification = await Notification.create({
    ...opts,
    recipient: opts.recipient ?? null,
  });

  // Email
  if (opts.channels.includes("email")) {
    await sendTypedEmail(notification, opts.templatePayload ?? {});
  }

  // SMS placeholder
  if (opts.channels.includes("sms")) {
    console.log("SMS →", notification.title);
  }

  // Push placeholder
  if (opts.channels.includes("push")) {
    console.log("PUSH →", notification.title);
  }

  return notification;
};

// ------------------------------------------------------
// EMAIL TEMPLATE ROUTER
// ------------------------------------------------------

async function sendTypedEmail(
  notification: INotification,
  payload: Record<string, string | number>
) {
  if (!notification.recipient) return;

  const user = await User.findById(notification.recipient).lean();
  if (!user || !user.email) return;

  const tpl = mapNotificationToEmail(notification.type, {
    name: user.name,
    ...payload,
  });

  if (!tpl) {
    await sendEmail({
      to: user.email,
      subject: notification.title,
      html: `<p>${notification.message}</p>`,
    });
    return;
  }

  await sendEmail({
    to: user.email,
    subject: tpl.subject,
    html: tpl.html,
  });
}

// ------------------------------------------------------
// MAP ENUM → EMAIL TEMPLATE FUNCTION
// ------------------------------------------------------

function mapNotificationToEmail(
  type: NotificationType,
  data: Record<string, string | number>
) {
  switch (type) {
    // -------- USER ACCOUNT ----------
    case NotificationType.USER_REGISTERED:
      return welcomeEmail({ name: data.name as string });

    case NotificationType.USER_EMAIL_VERIFIED:
      return emailVerificationEmail({
        name: data.name as string,
        verificationLink: data.link as string,
      });

    case NotificationType.USER_PASSWORD_RESET_REQUEST:
      return passwordResetEmail({
        name: data.name as string,
        resetLink: data.resetLink as string,
      });

    // -------- ORDER ----------
    case NotificationType.ORDER_PLACED:
    case NotificationType.ORDER_CONFIRMED:
      return orderConfirmationEmail({
        name: data.name as string,
        orderNumber: data.orderNumber as string,
        orderLink: data.orderLink as string,
      });

    case NotificationType.ORDER_SHIPPED:
      return orderShippedEmail({
        name: data.name as string,
        orderNumber: data.orderNumber as string,
        trackingId: data.trackingId as string,
      });

    case NotificationType.ORDER_DELIVERED:
      return orderDeliveredEmail({
        name: data.name as string,
        orderNumber: data.orderNumber as string,
      });

    // -------- PAYMENTS ----------
    case NotificationType.PAYMENT_SUCCESS:
      return paymentSuccessEmail({
        name: data.name as string,
        amount: data.amount as number,
        orderNumber: data.orderNumber as string,
      });

    case NotificationType.PAYMENT_FAILED:
      return paymentFailedEmail({
        name: data.name as string,
        amount: data.amount as number,
      });

    // -------- AFFILIATE ----------
    case NotificationType.AFFILIATE_APPLICATION_SUBMITTED:
      return affiliateApplicationReceived({ name: data.name as string });

    case NotificationType.AFFILIATE_APPLICATION_APPROVED:
      return affiliateApplicationApproved({
        name: data.name as string,
        affiliateCode: data.affiliateCode as string,
      });

    // -------- WALLET ----------
    case NotificationType.WALLET_FUNDS_RELEASED:
    case NotificationType.AFFILIATE_COMMISSION_CONFIRMED:
      return walletCommissionEmail({
        name: data.name as string,
        amount: data.amount as number,
        orderId: data.orderId as string,
      });

    case NotificationType.AFFILIATE_PAYOUT_COMPLETED:
      return payoutSuccessEmail({
        name: data.name as string,
        amount: data.amount as number,
        method: data.method as string,
      });

    // -------- ADMIN ----------
    case NotificationType.ADMIN_MESSAGE:
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return adminAlertEmail({
        title: data.title as string,
        message: data.message as string,
      });

    // -------- CONTACT ----------
    case NotificationType.BROADCAST_MESSAGE:
      return contactAutoReplyEmail({
        name: data.name as string,
      });

    // -------- MARKETING ----------
    case NotificationType.PROMOTIONAL_OFFER:
      return promotionalEmail({
        title: data.title as string,
        description: data.description as string,
        link: data.link as string,
      });

    default:
      return null;
  }
}
