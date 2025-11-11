// src/server/templates/EmailTemplates.ts

// --- হেলপার ফাংশন: কমন HTML স্ট্রাকচার ---
const getBaseTemplate = (content: string) => `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bazaarfly Notification</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
      .header { background-color: #4f46e5; color: white; padding: 20px 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 24px; }
      .content { padding: 30px; }
      .content h2 { color: #4f46e5; }
      .content p { line-height: 1.6; }
      .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
      .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Bazaarfly</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Bazaarfly. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>
`;

// --- ১. ওয়েলকাম ইমেল ---
export const welcomeEmail = ({ name }: { name: string }) => {
  const content = `
    <h2>স্বাগতম, ${name}!</h2>
    <p>Bazaarfly-এ যোগ দেওয়ার জন্য আপনাকে অসংখ্য ধন্যবাদ। আমরা আপনাকে আমাদের প্ল্যাটফর্মে পেয়ে খুবই আনন্দিত।</p>
    <p>আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে। এখন আপনি আমাদের হাজারো প্রোডাক্ট ঘুরে দেখতে এবং কেনাকাটা করতে পারেন।</p>
  `;
  return {
    subject: 'Bazaarfly-এ স্বাগতম!',
    html: getBaseTemplate(content),
  };
};

// --- ২. ইমেল ভেরিফিকেশন ইমেল ---
export const emailVerificationEmail = ({ name, verificationLink }: { name: string; verificationLink: string }) => {
  const content = `
    <h2>আপনার ইমেল ঠিকানা যাচাই করুন, ${name}</h2>
    <p>আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে, অনুগ্রহ করে নিচের বোতামে ক্লিক করে আপনার ইমেল ঠিকানাটি যাচাই করুন।</p>
    <a href="${verificationLink}" class="button">ইমেল যাচাই করুন</a>
    <p>যদি বোতামটি কাজ না করে, তবে এই লিঙ্কটি কপি করে আপনার ব্রাউজারে পেস্ট করুন:</p>
    <p>${verificationLink}</p>
    <p>এই লিঙ্কটি ২৪ ঘণ্টার জন্য বৈধ থাকবে।</p>
  `;
  return {
    subject: 'আপনার ইমেল ঠিকানা যাচাই করুন',
    html: getBaseTemplate(content),
  };
};

// --- ৩. পাসওয়ার্ড রিসেট ইমেল ---
export const passwordResetEmail = ({ name, resetLink }: { name: string; resetLink: string }) => {
  const content = `
    <h2>আপনার পাসওয়ার্ড রিসেট করুন, ${name}</h2>
    <p>আপনার পাসওয়ার্ড রিসেট করার জন্য একটি অনুরোধ পাওয়া গেছে। নিচের বোতামে ক্লিক করে একটি নতুন পাসওয়ার্ড সেট করুন।</p>
    <a href="${resetLink}" class="button">পাসওয়ার্ড রিসেট করুন</a>
    <p>যদি আপনি পাসওয়ার্ড রিসেটের জন্য অনুরোধ করেননি, তবে অনুগ্রহ করে এই ইমেলটি উপেক্ষা করুন।</p>
    <p>এই লিঙ্কটি ১ ঘণ্টার জন্য বৈধ থাকবে।</p>
  `;
  return {
    subject: 'আপনার পাসওয়ার্ড রিসেট করুন',
    html: getBaseTemplate(content),
  };
};

// --- ৪. অ্যাফিলিয়েট আবেদন গ্রহণ (ইউজারকে) ---
export const affiliateApplicationReceived = ({ name }: { name: string }) => {
  const content = `
    <h2>আপনার অ্যাফিলিয়েট আবেদন গ্রহণ করা হয়েছে!</h2>
    <p>স্বাগতম, ${name}!</p>
    <p>আপনার অ্যাফিলিয়েট প্রোগ্রামে যোগ দেওয়ার জন্য আবেদনটি আমরা সফলভাবে গ্রহণ করেছি। আমাদের টিম এখন আপনার আবেদনটি পর্যালোচনা করছে এবং খুব শীঘ্রই আপনাকে ফলাফল জানানো হবে।</p>
    <p>আপনার আবেদন অনুমোদিত হলে, আপনি আমাদের প্রোডাক্টগুলো প্রমোট করে আয় করার সুযোগ পাবেন।</p>
  `;
  return {
    subject: 'আপনার অ্যাফিলিয়েট আবেদন গ্রহণ করা হয়েছে',
    html: getBaseTemplate(content),
  };
};

// --- ৫. অ্যাফিলিয়েট আবেদন অনুমোদন (ইউজারকে) ---
export const affiliateApplicationApproved = ({ name, affiliateCode }: { name: string; affiliateCode: string }) => {
  const content = `
    <h2>অভিনন্দন! আপনি এখন একজন Bazaarfly অ্যাফিলিয়েট!</h2>
    <p>সুখবর, ${name}!</p>
    <p>আপনার অ্যাফিলিয়েট আবেদন অনুমোদিত হয়েছে। আপনি এখন আমাদের প্ল্যাটফর্মে প্রোডাক্ট প্রমোট করে আয় করতে পারেন।</p>
    <p>আপনার ইউনিক অ্যাফিলিয়েট কোড: <strong>${affiliateCode}</strong></p>
    <p>আপনার ড্যাশবোর্ডে লগইন করে আপনার লিঙ্ক তৈরি করুন এবং আয় করা শুরু করুন!</p>
  `;
  return {
    subject: 'অভিনন্দন! আপনি এখন একজন Bazaarfly অ্যাফিলিয়েট!',
    html: getBaseTemplate(content),
  };
};

// --- ৬. নতুন অর্ডার (ইউজারকে) ---
export const orderConfirmationEmail = ({ name, orderNumber, orderLink }: { name: string; orderNumber: string; orderLink: string }) => {
  const content = `
    <h2>আপনার অর্ডার নিশ্চিত হয়েছে!</h2>
    <p>ধন্যবাদ, ${name}!</p>
    <p>আপনার অর্ডার সফলভাবে প্রাপ্ত হয়েছে এবং প্রক্রিয়াধীন। আপনার অর্ডার নম্বর <strong>${orderNumber}</strong>।</p>
    <p>আপনি আপনার অর্ডারের স্ট্যাটাস ট্র্যাক করতে নিচের বোতামে ক্লিক করতে পারেন।</p>
    <a href="${orderLink}" class="button">অর্ডার ট্র্যাক করুন</a>
  `;
  return {
    subject: `আপনার অর্ডার নিশ্চিত হয়েছে - ${orderNumber}`,
    html: getBaseTemplate(content),
  };
};

// --- ৭. নতুন অ্যাফিলিয়েট আবেদন (অ্যাডমিনকে) ---
export const newAffiliateApplicationEmail = ({ name, email, applicationId }: { name: string; email: string; applicationId: string }) => {
  const content = `
    <h2>নতুন অ্যাফিলিয়েট আবেদন</h2>
    <p>একজন নতুন ইউজার অ্যাফিলিয়েট প্রোগ্রামে যোগ দেওয়ার জন্য আবেদন করেছে।</p>
    <p><strong>নাম:</strong> ${name}</p>
    <p><strong>ইমেল:</strong> ${email}</p>
    <p><strong>আবেদন ID:</strong> ${applicationId}</p>
    <p>অ্যাডমিন প্যানেলে লগইন করে আবেদনটি পর্যালোচনা করুন।</p>
  `;
  return {
    subject: `নতুন অ্যাফিলিয়েট আবেদন: ${name}`,
    html: getBaseTemplate(content),
  };
};