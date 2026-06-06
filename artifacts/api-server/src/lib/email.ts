import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Cardone Loans & Grants <noreply@cardoneloansgrants.org>";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://cardoneloansgrants.org";

export async function sendConfirmationEmail(email: string, name: string, token: string) {
  const url = `${FRONTEND_URL}/confirm-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Confirm your Cardone Loans & Grants account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px;">Cardone Loans & Grants</h1>
          <p style="color: #ffffff80; margin: 8px 0 0;">Your Gateway to Growth Capital</p>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0B1F3A;">Welcome, ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">Thank you for creating your account. Please confirm your email address to activate your account and start your application.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="background: #1FA67A; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Confirm My Email</a>
          </div>
          <p style="color: #888; font-size: 14px;">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">© 2024 Cardone Loans & Grants. All rights reserved.<br>info@cardoneloansgrants.org | +1 254-528-9454</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your Cardone Loans & Grants password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px;">Cardone Loans & Grants</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0B1F3A;">Password Reset Request</h2>
          <p style="color: #555; line-height: 1.6;">Hi ${name}, we received a request to reset your password. Click the button below to set a new password.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${url}" style="background: #0B1F3A; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #888; font-size: 14px;">This link expires in 1 hour. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="color: #888; font-size: 12px; text-align: center;">© 2024 Cardone Loans & Grants. All rights reserved.</p>
        </div>
      </div>
    `,
  });
}

export async function sendApprovalEmail(email: string, name: string, appId: number, amount: number, releaseDate: Date) {
  const releaseDateStr = releaseDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Application #${appId} Approved – Funds Release Scheduled`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="background: #0B1F3A; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px;">Cardone Loans & Grants</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1FA67A;">🎉 Congratulations, ${name}!</h2>
          <p style="color: #555; line-height: 1.6;">Your application <strong>#${appId}</strong> has been approved. Here are your funding details:</p>
          <div style="background: #f0fdf4; border: 1px solid #1FA67A; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #0B1F3A;"><strong>Approved Amount:</strong> $${amount.toLocaleString()}</p>
            <p style="margin: 8px 0 0; color: #0B1F3A;"><strong>Funds Available:</strong> ${releaseDateStr}</p>
          </div>
          <p style="color: #555;">Log into your dashboard on or after the release date to request your withdrawal to your registered bank account.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${FRONTEND_URL}/dashboard" style="background: #1FA67A; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
          </div>
        </div>
      </div>
    `,
  });
}
