/**
 * Contact Form Email Utility
 * Sends email notifications for contact form submissions via Gmail/Google Workspace
 */

import nodemailer from "nodemailer";
import { SITE_URL } from "@/lib/site-url";
import { EMAIL } from "@/lib/config/email";
import { getSiteConfig } from "@/lib/config/site-config";

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
  ip: string;
  timestamp: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};

const CONTACT_FORM_TO = process.env.CONTACT_FORM_TO || EMAIL.contact;
const CONTACT_FORM_FROM =
  process.env.CONTACT_FORM_FROM || process.env.SMTP_USER || "";

function createTransporter() {
  return nodemailer.createTransport(SMTP_CONFIG);
}

function formatEmailBody(data: ContactEmailData, siteName: string): string {
  return `
New contact form submission from ${siteName} website:

Name: ${data.name}
Email: ${data.email}
Submitted: ${data.timestamp}

Message:
${data.message}

---
Technical Details:
- IP Address: ${data.ip}
- Source: ${SITE_URL}/contact
`.trim();
}

function formatHtmlBody(data: ContactEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0C3F23; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #0C3F23; }
    .message { background: white; padding: 15px; border-left: 4px solid #0C3F23; margin: 15px 0; }
    .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Name:</span> ${escapeHtml(data.name)}
      </div>
      <div class="field">
        <span class="label">Email:</span> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
      </div>
      <div class="field">
        <span class="label">Submitted:</span> ${data.timestamp}
      </div>
      <div class="message">
        <span class="label">Message:</span>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
      </div>
      <div class="footer">
        <p>IP Address: ${data.ip}</p>
        <p>Source: ${SITE_URL}/contact</p>
      </div>
    </div>
  </div>
</body>
</html>
`.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function sendContactEmail(
  data: ContactEmailData,
): Promise<EmailResult> {
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    return {
      success: false,
      error: "Email not configured",
    };
  }

  try {
    const config = await getSiteConfig();
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${config.siteName} Website" <${CONTACT_FORM_FROM}>`,
      to: CONTACT_FORM_TO,
      replyTo: data.email,
      subject: `Contact Form: ${data.name}`,
      text: formatEmailBody(data, config.siteName),
      html: formatHtmlBody(data),
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function verifyEmailConnection(): Promise<boolean> {
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    return false;
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
