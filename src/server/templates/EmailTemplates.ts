// src/server/templates/EmailTemplates.ts

// ======================================================
// EMAIL CLIENT FRIENDLY (TABLE + INLINE STYLE) TEMPLATE
// Inspired by your "waitlist" design (gradient header + card)
// ======================================================

type CTA = { label: string; href: string };

type BaseTemplateOptions = {
  title?: string; // <title> + internal usage
  preheader?: string; // hidden preview text
  brandName?: string; // header brand
  accent?: string; // primary button color
  gradientFrom?: string;
  gradientTo?: string;

  headerKicker?: string; // small uppercase line
  headerTitle?: string; // big header title
  headerSubtitle?: string; // short subtitle

  badgeLabel?: string; // right side label
  badgeValue?: string; // right side value

  bodyHtml: string; // the main content inside body
  cta?: CTA; // optional CTA button

  footerNote?: string; // footer small note
};

const fontStack =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,'Noto Sans','Liberation Sans',sans-serif;";

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// NOTE: Many email clients don't support <style> reliably.
// So we keep everything inline and table-based.
export const getBaseTemplate = (opts: BaseTemplateOptions): string => {
  const {
    title = "Bazaarfly Notification",
    preheader = "",
    brandName = "Bazaarfly",
    accent = "#f97316",
    gradientFrom = "#fb923c",
    gradientTo = "#f97316",

    headerKicker = "BAZAARFLY",
    headerTitle = "Notification",
    headerSubtitle = "Here’s an update from Bazaarfly.",

    badgeLabel = "",
    badgeValue = "",

    bodyHtml,
    cta,

    footerNote = `You received this email from ${brandName}.`,
  } = opts;

  const safePreheader = escapeHtml(preheader);

  const headerRightHtml =
    badgeLabel && badgeValue
      ? `
        <td style="padding:22px 22px 18px;${fontStack}color:#ffffff;text-align:right;" valign="top">
          <div style="${fontStack}font-size:11px;font-weight:800;letter-spacing:.10em;opacity:.92;">
            ${escapeHtml(badgeLabel)}
          </div>
          <div style="margin-top:8px;display:inline-block;background:rgba(255,255,255,.18);padding:8px 10px;border-radius:12px;">
            <span style="${fontStack}font-size:14px;font-weight:900;color:#ffffff;">
              ${escapeHtml(badgeValue)}
            </span>
          </div>
        </td>
      `
      : `
        <td style="padding:22px 22px 18px;${fontStack}color:#ffffff;text-align:right;" valign="top">
          &nbsp;
        </td>
      `;

  const ctaHtml = cta
    ? `
      <div style="margin:18px 0 6px;text-align:center;">
        <a href="${cta.href}"
          style="${fontStack}display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-size:14px;font-weight:900;padding:12px 18px;border-radius:14px;">
          ${escapeHtml(cta.label)}
        </a>
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>

  <body style="margin:0;padding:0;background:#fff7ed;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#fff7ed;padding:24px 12px;">
      <tr>
        <td align="center">

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #fde2c7;box-shadow:0 10px 30px rgba(17,24,39,.08);">

            <!-- Preheader (hidden) -->
            <tr>
              <td style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
                ${safePreheader}
              </td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding:0;background:linear-gradient(135deg,${gradientFrom},${gradientTo});">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding:22px 22px 18px;${fontStack}color:#ffffff;" valign="top">
                      <div style="${fontStack}font-size:12px;letter-spacing:.12em;font-weight:900;opacity:.95;">
                        ${escapeHtml(headerKicker)}
                      </div>
                      <div style="${fontStack}font-size:22px;font-weight:900;line-height:1.25;margin-top:6px;">
                        ${escapeHtml(headerTitle)}
                      </div>
                      <div style="${fontStack}font-size:13px;opacity:.92;margin-top:8px;line-height:1.55;">
                        ${escapeHtml(headerSubtitle)}
                      </div>
                    </td>

                    ${headerRightHtml}
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:22px 22px 10px;${fontStack}color:#111827;">
                ${bodyHtml}
                ${ctaHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:14px 22px 20px;${fontStack}color:#6b7280;text-align:center;font-size:12px;line-height:1.6;">
                <div style="border-top:1px solid #f3f4f6;padding-top:12px;">
                  ${escapeHtml(footerNote)}
                  <br/>
                  © ${new Date().getFullYear()} ${escapeHtml(brandName)}. All rights reserved.
                  <br/>
                  <span style="color:#9ca3af;">This is an automated email. Do not reply.</span>
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
};

// ======================================================
// TYPES FOR ALL EMAIL TEMPLATES
// ======================================================

export interface WelcomeEmailProps {
  name: string;
}

export interface EmailVerificationProps {
  name: string;
  verificationLink: string;
}

export interface PasswordResetProps {
  name: string;
  resetLink: string;
}

export interface AffiliateReceivedProps {
  name: string;
}

export interface AffiliateApprovedProps {
  name: string;
  affiliateCode: string;
}

export interface OrderConfirmationProps {
  name: string;
  orderNumber: string;
  orderLink: string;
}

export interface PaymentSuccessProps {
  name: string;
  amount: number;
  orderNumber: string;
}

export interface PaymentFailedProps {
  name: string;
  amount: number;
}

export interface OrderShippedProps {
  name: string;
  orderNumber: string;
  trackingId: string;
}

export interface OrderDeliveredProps {
  name: string;
  orderNumber: string;
}

export interface WalletCommissionProps {
  name: string;
  amount: number;
  orderId: string;
}

export interface PayoutSuccessProps {
  name: string;
  amount: number;
  method: string;
}

export interface AdminAlertProps {
  title: string;
  message: string;
}

export interface ContactReplyProps {
  name: string;
}

export interface PromotionalProps {
  title: string;
  description: string;
  link: string;
}

// ======================================================
// SMALL UI HELPERS (INLINE HTML BLOCKS)
// ======================================================

const paragraph = (html: string) =>
  `<div style="${fontStack}font-size:15px;line-height:1.75;">${html}</div>`;

const cardBox = (icon: string, title: string, descHtml: string) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
  style="margin-top:16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;">
  <tr>
    <td style="padding:14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="44" valign="top">
            <table role="presentation" width="42" cellpadding="0" cellspacing="0" border="0"
              style="background:#ffffff;border:1px solid #fde2c7;border-radius:12px;">
              <tr>
                <td align="center" style="padding:10px 0;">
                  <span style="${fontStack}font-size:20px;">${icon}</span>
                </td>
              </tr>
            </table>
          </td>

          <td style="padding-left:12px;" valign="top">
            <div style="${fontStack}font-size:14px;font-weight:900;margin-bottom:4px;color:#111827;">
              ${escapeHtml(title)}
            </div>
            <div style="${fontStack}font-size:13px;color:#6b7280;line-height:1.6;">
              ${descHtml}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

const smallLink = (href: string, label: string) => `
<a href="${href}" style="${fontStack}color:#f97316;text-decoration:none;font-weight:800;">${escapeHtml(
  label
)}</a>
`;

// ======================================================
// EMAIL TEMPLATES (USING NEW DESIGN)
// ======================================================

// 1. Welcome Email
export const welcomeEmail = ({ name }: WelcomeEmailProps) => {
  const safeName = escapeHtml(name);

  return {
    subject: "Welcome to Bazaarfly!",
    html: getBaseTemplate({
      title: "Welcome to Bazaarfly",
      preheader: "Your Bazaarfly account is ready. Start exploring now.",
      headerTitle: "Welcome to Bazaarfly 🎉",
      headerSubtitle: "Your account has been created successfully.",
      badgeLabel: "STATUS",
      badgeValue: "ACTIVE",
      bodyHtml: `
        ${paragraph(`Hi <b>${safeName}</b> 👋<br/><br/>
        Thanks for joining <b>Bazaarfly</b>. Explore products, save favorites, and enjoy a smooth shopping experience.`)}
        ${cardBox("✨", "Quick start", `Visit the homepage and discover trending items and deals.`)}
      `,
      cta: { label: "Start Shopping", href: "https://bazaarfly.com" },
      footerNote: "You received this email because you created a Bazaarfly account.",
    }),
  };
};

// 2. Email Verification
export const emailVerificationEmail = ({
  name,
  verificationLink,
}: EmailVerificationProps) => {
  const safeName = escapeHtml(name);

  return {
    subject: "Verify Your Email Address",
    html: getBaseTemplate({
      title: "Email Verification",
      preheader: "Verify your email to secure your Bazaarfly account.",
      headerTitle: "Verify your email ✅",
      headerSubtitle: "Confirming your email helps keep your account secure.",
      badgeLabel: "ACTION",
      badgeValue: "REQUIRED",
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        Please verify your email address to finish setting up your account.`)}
        ${cardBox(
          "🔐",
          "Verification",
          `Click the button below to verify. If it doesn’t work, use this link: <br/>${smallLink(
            verificationLink,
            "Verify Email"
          )}<br/><span style="color:#9ca3af;">(or paste the URL in your browser)</span>`
        )}
      `,
      cta: { label: "Verify Email", href: verificationLink },
      footerNote: "You received this email because you signed up for Bazaarfly.",
    }),
  };
};

// 3. Password Reset
export const passwordResetEmail = ({ name, resetLink }: PasswordResetProps) => {
  const safeName = escapeHtml(name);

  return {
    subject: "Reset Your Password",
    html: getBaseTemplate({
      title: "Password Reset",
      preheader: "Reset your Bazaarfly password using the secure link.",
      headerTitle: "Reset your password 🔁",
      headerSubtitle: "Use the secure link below to set a new password.",
      badgeLabel: "LINK",
      badgeValue: "TEMPORARY",
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        We received a request to reset your password. If you didn’t request this, you can safely ignore this email.`)}
        ${cardBox("🧩", "Reset link", `Use the button below, or open: ${smallLink(resetLink, "Reset Password")}`)}
      `,
      cta: { label: "Reset Password", href: resetLink },
      footerNote: "If you didn’t request a password reset, no action is required.",
    }),
  };
};

// 4. Affiliate Application Received (ADMIN)
export const newAffiliateApplicationEmail = ({
  name,
  email,
  applicationId,
}: {
  name: string;
  email: string;
  applicationId: string;
}) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeAppId = escapeHtml(applicationId);

  return {
    subject: `New Affiliate Application - ${name}`,
    html: getBaseTemplate({
      title: "New Affiliate Application",
      preheader: `New affiliate application received from ${name}.`,
      headerTitle: "New affiliate application 📩",
      headerSubtitle: "Review the details and take action from the admin dashboard.",
      badgeLabel: "APP ID",
      badgeValue: applicationId,
      bodyHtml: `
        ${paragraph(`
          <b>Applicant details</b><br/><br/>
          <span style="color:#6b7280;">Name:</span> <b>${safeName}</b><br/>
          <span style="color:#6b7280;">Email:</span> <b>${safeEmail}</b><br/>
          <span style="color:#6b7280;">Application ID:</span> <b>${safeAppId}</b>
        `)}
        ${cardBox("✅", "Next step", "Open the admin dashboard to approve or reject this application.")}
      `,
      cta: { label: "Open Admin Dashboard", href: "https://bazaarfly.com/admin" },
      footerNote: "Admin notification from Bazaarfly.",
    }),
  };
};

// 4b. Affiliate Application Received (USER)
export const affiliateApplicationReceived = ({ name }: AffiliateReceivedProps) => {
  const safeName = escapeHtml(name);

  return {
    subject: "Affiliate Application Received",
    html: getBaseTemplate({
      title: "Affiliate Application Received",
      preheader: "We received your affiliate application. We’ll review it shortly.",
      headerTitle: "Application received 🕒",
      headerSubtitle: "We’ll review your affiliate application shortly.",
      badgeLabel: "STATUS",
      badgeValue: "PENDING",
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        Your affiliate application has been received. We’ll notify you once it’s reviewed.`)}
        ${cardBox("📌", "What’s next?", "Our team will verify your details and update you by email.")}
      `,
      cta: { label: "Visit Bazaarfly", href: "https://bazaarfly.com" },
      footerNote: "You received this email because you applied to the Bazaarfly affiliate program.",
    }),
  };
};

// 5. Affiliate Approved
export const affiliateApplicationApproved = ({
  name,
  affiliateCode,
}: AffiliateApprovedProps) => {
  const safeName = escapeHtml(name);
  const safeCode = escapeHtml(affiliateCode);

  return {
    subject: "Affiliate Approved",
    html: getBaseTemplate({
      title: "Affiliate Approved",
      preheader: "Your affiliate application is approved. Your code is inside.",
      headerTitle: "You’re approved 🎉",
      headerSubtitle: "Welcome to the Bazaarfly affiliate program!",
      badgeLabel: "STATUS",
      badgeValue: "APPROVED",
      bodyHtml: `
        ${paragraph(`Hi <b>${safeName}</b>,<br/><br/>
        Congratulations! Your affiliate application has been approved.`)}
        ${cardBox(
          "🏷️",
          "Your affiliate code",
          `<span style="display:inline-block;background:#ffffff;border:1px solid #fde2c7;border-radius:12px;padding:10px 12px;">
            <span style="${fontStack}font-size:14px;font-weight:900;color:#111827;letter-spacing:.06em;">${safeCode}</span>
          </span><br/>
          <span style="color:#9ca3af;">Share this code to earn commissions.</span>`
        )}
      `,
      cta: { label: "Go to Affiliate Dashboard", href: "https://bazaarfly.com/affiliate" },
      footerNote: "You received this email because your affiliate application was approved.",
    }),
  };
};

// 6. Order Confirmation
export const orderConfirmationEmail = ({
  name,
  orderNumber,
  orderLink,
}: OrderConfirmationProps) => {
  const safeName = escapeHtml(name);
  const safeOrder = escapeHtml(orderNumber);

  return {
    subject: `Order Confirmation - ${orderNumber}`,
    html: getBaseTemplate({
      title: "Order Confirmation",
      preheader: `Your order ${orderNumber} has been placed successfully.`,
      headerTitle: "Order confirmed ✅",
      headerSubtitle: "We’ve received your order and started processing it.",
      badgeLabel: "ORDER",
      badgeValue: orderNumber,
      bodyHtml: `
        ${paragraph(`Thank you, <b>${safeName}</b>!<br/><br/>
        Your order <b>${safeOrder}</b> has been placed successfully.`)}
        ${cardBox("📦", "Track your order", `Use the tracking page for updates: ${smallLink(orderLink, "Track Order")}`)}
      `,
      cta: { label: "Track Order", href: orderLink },
      footerNote: "You received this email because you placed an order on Bazaarfly.",
    }),
  };
};

// 7. Payment Success
export const paymentSuccessEmail = ({
  name,
  amount,
  orderNumber,
}: PaymentSuccessProps) => {
  const safeName = escapeHtml(name);
  const safeOrder = escapeHtml(orderNumber);

  return {
    subject: "Payment Successful",
    html: getBaseTemplate({
      title: "Payment Successful",
      preheader: `Payment received for order ${orderNumber}.`,
      headerTitle: "Payment successful 💳",
      headerSubtitle: "Thanks! Your payment has been confirmed.",
      badgeLabel: "ORDER",
      badgeValue: orderNumber,
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        We received your payment of <b>${amount} BDT</b> for order <b>${safeOrder}</b>.`)}
        ${cardBox("🧾", "Receipt", "Your order will move forward for processing and shipment updates.")}
      `,
      cta: { label: "Visit Bazaarfly", href: "https://bazaarfly.com" },
      footerNote: "You received this email because a payment was completed on Bazaarfly.",
    }),
  };
};

// 8. Payment Failed
export const paymentFailedEmail = ({ name, amount }: PaymentFailedProps) => {
  const safeName = escapeHtml(name);

  return {
    subject: "Payment Failed",
    html: getBaseTemplate({
      title: "Payment Failed",
      preheader: "Your payment failed. Please try again.",
      headerTitle: "Payment failed ⚠️",
      headerSubtitle: "We couldn’t complete your payment.",
      badgeLabel: "STATUS",
      badgeValue: "FAILED",
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        Your payment of <b>${amount} BDT</b> failed. Please try again or use a different method.`)}
        ${cardBox("🛠️", "Tip", "If the issue continues, contact support with your order details.")}
      `,
      cta: { label: "Try Again", href: "https://bazaarfly.com" },
      footerNote: "You received this email because a payment attempt failed on Bazaarfly.",
    }),
  };
};

// 9. Order Shipped
export const orderShippedEmail = ({
  name,
  trackingId,
  orderNumber,
}: OrderShippedProps) => {
  const safeName = escapeHtml(name);
  const safeOrder = escapeHtml(orderNumber);
  const safeTrack = escapeHtml(trackingId);

  return {
    subject: "Order Shipped",
    html: getBaseTemplate({
      title: "Order Shipped",
      preheader: `Your order ${orderNumber} has been shipped. Tracking ID: ${trackingId}`,
      headerTitle: "Your order is shipped 🚚",
      headerSubtitle: "Good news — it’s on the way!",
      badgeLabel: "ORDER",
      badgeValue: orderNumber,
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        Your order <b>${safeOrder}</b> has been shipped.`)}
        ${cardBox(
          "🔎",
          "Tracking ID",
          `<b style="color:#111827;">${safeTrack}</b><br/>
           <span style="color:#9ca3af;">Use this tracking ID with the carrier, if applicable.</span>`
        )}
      `,
      cta: { label: "Visit Bazaarfly", href: "https://bazaarfly.com" },
      footerNote: "You received this email because your order status changed to shipped.",
    }),
  };
};

// 10. Order Delivered
export const orderDeliveredEmail = ({ name, orderNumber }: OrderDeliveredProps) => {
  const safeName = escapeHtml(name);
  const safeOrder = escapeHtml(orderNumber);

  return {
    subject: "Order Delivered",
    html: getBaseTemplate({
      title: "Order Delivered",
      preheader: `Your order ${orderNumber} has been delivered.`,
      headerTitle: "Delivered 🎉",
      headerSubtitle: "Your package has arrived.",
      badgeLabel: "ORDER",
      badgeValue: orderNumber,
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        Your order <b>${safeOrder}</b> has been delivered.`)}
        ${cardBox("⭐", "Enjoy!", "If anything looks wrong, please contact support as soon as possible.")}
      `,
      cta: { label: "Shop Again", href: "https://bazaarfly.com" },
      footerNote: "You received this email because your order was marked delivered.",
    }),
  };
};

// 11. Wallet Commission Credited
export const walletCommissionEmail = ({
  name,
  amount,
  orderId,
}: WalletCommissionProps) => {
  const safeName = escapeHtml(name);
  const safeOrderId = escapeHtml(orderId);

  return {
    subject: "Commission Added to Wallet",
    html: getBaseTemplate({
      title: "Commission Credited",
      preheader: `Commission added to your wallet from order ${orderId}.`,
      headerTitle: "Commission credited 💰",
      headerSubtitle: "Your wallet has been updated.",
      badgeLabel: "AMOUNT",
      badgeValue: `${amount} BDT`,
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        Your commission of <b>${amount} BDT</b> from Order <b>#${safeOrderId}</b> has been added to your wallet.`)}
        ${cardBox("📈", "Keep earning", "Share more links and earn more commissions with every successful order.")}
      `,
      cta: { label: "Open Wallet", href: "https://bazaarfly.com/wallet" },
      footerNote: "You received this email because a commission was credited to your wallet.",
    }),
  };
};

// 12. Payout Success
export const payoutSuccessEmail = ({ name, amount, method }: PayoutSuccessProps) => {
  const safeName = escapeHtml(name);
  const safeMethod = escapeHtml(method);

  return {
    subject: "Payout Successful",
    html: getBaseTemplate({
      title: "Payout Successful",
      preheader: `Your payout of ${amount} BDT was successful.`,
      headerTitle: "Payout successful ✅",
      headerSubtitle: "Your funds are on the way (or already received).",
      badgeLabel: "AMOUNT",
      badgeValue: `${amount} BDT`,
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        Your payout of <b>${amount} BDT</b> via <b>${safeMethod}</b> was successful.`)}
        ${cardBox("🧾", "Reference", "You can view payout details in your affiliate/wallet dashboard.")}
      `,
      cta: { label: "View Payouts", href: "https://bazaarfly.com/affiliate/payouts" },
      footerNote: "You received this email because a payout was processed on Bazaarfly.",
    }),
  };
};

// 13. Admin Alert
export const adminAlertEmail = ({ title, message }: AdminAlertProps) => {
  const safeTitle = escapeHtml(title);
  const safeMsg = escapeHtml(message);

  return {
    subject: `Admin Alert: ${title}`,
    html: getBaseTemplate({
      title: `Admin Alert - ${title}`,
      preheader: title,
      headerTitle: `Admin alert: ${safeTitle}`,
      headerSubtitle: "Please review the message below.",
      badgeLabel: "PRIORITY",
      badgeValue: "HIGH",
      bodyHtml: `
        ${paragraph(`<b>${safeTitle}</b><br/><br/>
        ${safeMsg}`)}
        ${cardBox("🛡️", "Action", "Review the admin panel logs and take necessary action.")}
      `,
      cta: { label: "Open Admin", href: "https://bazaarfly.com/admin" },
      footerNote: "Admin notification from Bazaarfly.",
    }),
  };
};

// 14. Contact Auto-Reply
export const contactAutoReplyEmail = ({ name }: ContactReplyProps) => {
  const safeName = escapeHtml(name);

  return {
    subject: "We Received Your Message",
    html: getBaseTemplate({
      title: "We Received Your Message",
      preheader: "Thanks for contacting Bazaarfly. Our team will reply soon.",
      headerTitle: "Thanks for reaching out 🙌",
      headerSubtitle: "We’ve received your message and will reply soon.",
      badgeLabel: "STATUS",
      badgeValue: "RECEIVED",
      bodyHtml: `
        ${paragraph(`Hello <b>${safeName}</b>,<br/><br/>
        We have received your message. Our support team will respond as soon as possible.`)}
        ${cardBox("⏱️", "Response time", "Most requests are replied to within 24–48 hours.")}
      `,
      cta: { label: "Visit Bazaarfly", href: "https://bazaarfly.com" },
      footerNote: "You received this email because you contacted Bazaarfly support.",
    }),
  };
};

// 15. Promotional Email
export const promotionalEmail = ({ title, description, link }: PromotionalProps) => {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  return {
    subject: title,
    html: getBaseTemplate({
      title: safeTitle,
      preheader: description,
      headerTitle: safeTitle,
      headerSubtitle: "Limited-time updates and offers from Bazaarfly.",
      badgeLabel: "OFFER",
      badgeValue: "LIVE",
      bodyHtml: `
        ${paragraph(`${safeDesc}`)}
        ${cardBox("🔥", "Don’t miss out", "Tap the button below to explore the offer now.")}
      `,
      cta: { label: "Shop Now", href: link },
      footerNote: "You received this email because you subscribed to Bazaarfly updates.",
    }),
  };
};
