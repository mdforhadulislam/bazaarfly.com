// src/server/templates/EmailTemplates.ts

// ======================================================
// UNIVERSAL BASE TEMPLATE
// ======================================================

export const getBaseTemplate = (content: string, title = "Bazaarfly Notification"): string => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>

    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      .header {
        background-color: #4f46e5;
        color: #fff;
        padding: 25px 35px;
        text-align: center;
      }
      .header h1 { margin: 0; font-size: 26px; }
      .content { padding: 30px; }
      .content h2 { color: #4f46e5; margin-bottom: 15px; font-size: 22px; }
      .content p { line-height: 1.6; margin: 10px 0; }
      .button {
        display: inline-block;
        background-color: #4f46e5;
        color: white !important;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 20px;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>Bazaarfly</h1>
      </div>

      <div class="content">${content}</div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Bazaarfly. All rights reserved.</p>
        <p>This is an automated email. Do not reply.</p>
      </div>
    </div>
  </body>
  </html>
`;

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
// EMAIL TEMPLATES
// ======================================================

// 1. Welcome Email
export const welcomeEmail = ({ name }: WelcomeEmailProps) => ({
  subject: "Welcome to Bazaarfly!",
  html: getBaseTemplate(`
    <h2>Welcome, ${name}!</h2>
    <p>Your Bazaarfly account has been created successfully.</p>
    <p>Enjoy exploring thousands of products!</p>
  `, "Welcome to Bazaarfly")
});

// 2. Email Verification
export const emailVerificationEmail = ({
  name,
  verificationLink,
}: EmailVerificationProps) => ({
  subject: "Verify Your Email Address",
  html: getBaseTemplate(`
    <h2>Email Verification</h2>
    <p>Hello ${name},</p>
    <p>Please verify your email by clicking the button below.</p>
    <a href="${verificationLink}" class="button">Verify Email</a>
    <p>If this button does not work, paste the link in your browser:</p>
    <p>${verificationLink}</p>
  `, "Email Verification")
});

// 3. Password Reset
export const passwordResetEmail = ({
  name,
  resetLink,
}: PasswordResetProps) => ({
  subject: "Reset Your Password",
  html: getBaseTemplate(`
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>Click the button below to reset your password.</p>
    <a href="${resetLink}" class="button">Reset Password</a>
    <p>If you didn’t request this, ignore this email.</p>
  `, "Password Reset")
});

// 4. Affiliate Application Received

export const newAffiliateApplicationEmail = ({
  name,
  email,
  applicationId,
}: {
  name: string;
  email: string;
  applicationId: string;
}) => {
  const content = `
    <h2>New Affiliate Application</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Application ID:</strong> ${applicationId}</p>
    <p>Please review the application in your admin dashboard.</p>
  `;

  return {
    subject: `New Affiliate Application - ${name}`,
    html: getBaseTemplate(content, "New Affiliate Application"),
  };
};


export const affiliateApplicationReceived = ({
  name,
}: AffiliateReceivedProps) => ({
  subject: "Affiliate Application Received",
  html: getBaseTemplate(`
    <h2>Affiliate Application Received</h2>
    <p>Hello ${name},</p>
    <p>Your application has been received. We will review it shortly.</p>
  `)
});

// 5. Affiliate Approved
export const affiliateApplicationApproved = ({
  name,
  affiliateCode,
}: AffiliateApprovedProps) => ({
  subject: "Affiliate Approved",
  html: getBaseTemplate(`
    <h2>Congratulations, ${name}!</h2>
    <p>Your affiliate application has been approved.</p>
    <p>Your affiliate code: <strong>${affiliateCode}</strong></p>
  `)
});

// 6. Order Confirmation
export const orderConfirmationEmail = ({
  name,
  orderNumber,
  orderLink,
}: OrderConfirmationProps) => ({
  subject: `Order Confirmation - ${orderNumber}`,
  html: getBaseTemplate(`
    <h2>Order Confirmed</h2>
    <p>Thank you, ${name}!</p>
    <p>Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
    <a href="${orderLink}" class="button">Track Order</a>
  `)
});

// 7. Payment Success
export const paymentSuccessEmail = ({
  name,
  amount,
  orderNumber,
}: PaymentSuccessProps) => ({
  subject: "Payment Successful",
  html: getBaseTemplate(`
    <h2>Payment Successful</h2>
    <p>Hello ${name},</p>
    <p>Your payment of <strong>${amount} BDT</strong> for order <strong>${orderNumber}</strong> was successful.</p>
  `)
});

// 8. Payment Failed
export const paymentFailedEmail = ({
  name,
  amount,
}: PaymentFailedProps) => ({
  subject: "Payment Failed",
  html: getBaseTemplate(`
    <h2>Payment Failed</h2>
    <p>Hello ${name},</p>
    <p>Your payment of <strong>${amount} BDT</strong> failed.</p>
    <p>Please try again.</p>
  `)
});

// 9. Order Shipped
export const orderShippedEmail = ({
  name,
  trackingId,
  orderNumber,
}: OrderShippedProps) => ({
  subject: "Order Shipped",
  html: getBaseTemplate(`
    <h2>Your Order is Shipped!</h2>
    <p>Hello ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> has been shipped.</p>
    <p>Tracking ID: <strong>${trackingId}</strong></p>
  `)
});

// 10. Order Delivered
export const orderDeliveredEmail = ({
  name,
  orderNumber,
}: OrderDeliveredProps) => ({
  subject: "Order Delivered",
  html: getBaseTemplate(`
    <h2>Order Delivered</h2>
    <p>Hello ${name},</p>
    <p>Your order <strong>${orderNumber}</strong> has been delivered.</p>
  `)
});

// 11. Wallet Commission Credited
export const walletCommissionEmail = ({
  name,
  amount,
  orderId,
}: WalletCommissionProps) => ({
  subject: "Commission Added to Wallet",
  html: getBaseTemplate(`
    <h2>Commission Credited</h2>
    <p>Hello ${name},</p>
    <p>Your commission of <strong>${amount} BDT</strong> from Order #${orderId} has been added to your wallet.</p>
  `)
});

// 12. Payout Success
export const payoutSuccessEmail = ({
  name,
  amount,
  method,
}: PayoutSuccessProps) => ({
  subject: "Payout Successful",
  html: getBaseTemplate(`
    <h2>Payout Successful</h2>
    <p>Hello ${name},</p>
    <p>Your payout of <strong>${amount} BDT</strong> via <strong>${method}</strong> was successful.</p>
  `)
});

// 13. Admin Alert
export const adminAlertEmail = ({
  title,
  message,
}: AdminAlertProps) => ({
  subject: `Admin Alert: ${title}`,
  html: getBaseTemplate(`
    <h2>${title}</h2>
    <p>${message}</p>
  `)
});

// 14. Contact Auto-Reply
export const contactAutoReplyEmail = ({
  name,
}: ContactReplyProps) => ({
  subject: "We Received Your Message",
  html: getBaseTemplate(`
    <h2>Thank You</h2>
    <p>Hello ${name},</p>
    <p>We have received your message. Our team will reply soon.</p>
  `)
});

// 15. Promotional Email
export const promotionalEmail = ({
  title,
  description,
  link,
}: PromotionalProps) => ({
  subject: title,
  html: getBaseTemplate(`
    <h2>${title}</h2>
    <p>${description}</p>
    <a href="${link}" class="button">Shop Now</a>
  `)
});
