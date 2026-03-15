/**
 * Contact Form Email Utility
 * Sends two emails via Resend:
 * 1. Notification to staff (info@otyokwah.org) with reply-to set to the sender
 * 2. Confirmation to the user with CMS-editable template
 */

import { Resend } from "resend";
import { SITE_URL } from "@/lib/site-url";
import { EMAIL } from "@/lib/config/email";
import { resolve } from "@/lib/feature-flags";
import { CC_STAFF_EMAIL } from "@/lib/feature-flags/flags";
import { getSiteConfig } from "@/lib/config/site-config";
import { reader } from "@/lib/keystatic-reader";

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

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const CONTACT_FORM_TO = process.env.CONTACT_FORM_TO || EMAIL.contact;
const CONTACT_FORM_FROM =
  process.env.CONTACT_FORM_FROM || `noreply@${EMAIL.domain}`;

interface ConfirmationTemplate {
  confirmationSubject: string;
  confirmationHeading: string;
  confirmationBody: string;
  confirmationFooter: string;
}

const DEFAULT_TEMPLATE: ConfirmationTemplate = {
  confirmationSubject: "Thank you for contacting Camp Otyokwah",
  confirmationHeading: "We Received Your Message",
  confirmationBody:
    "Hi {name},\n\nThank you for reaching out to Camp Otyokwah! We've received your message and a member of our team will get back to you shortly.\n\nIf your matter is urgent, please call us at (419) 883-3854.\n\nFor the Kingdom,\nThe Camp Otyokwah Team",
  confirmationFooter:
    "Camp Otyokwah | 4715 Township Rd 606, Loudonville, OH 44842 | otyokwah.org",
};

async function getConfirmationTemplate(): Promise<ConfirmationTemplate> {
  try {
    const template =
      await reader().singletons.contactEmailTemplate.read();
    if (template) return template;
  } catch {
    // Fall back to defaults if CMS read fails
  }
  return DEFAULT_TEMPLATE;
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

function formatStaffNotificationHtml(data: ContactEmailData): string {
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
      <img src="https://www.otyokwah.org/images/logo-white.png" alt="Camp Otyokwah" style="max-width: 120px; height: auto; margin-bottom: 10px;" />
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

function formatStaffNotificationText(
  data: ContactEmailData,
  siteName: string,
): string {
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

function formatConfirmationHtml(
  data: ContactEmailData,
  template: ConfirmationTemplate,
): string {
  const body = template.confirmationBody
    .replace(/\{name\}/g, escapeHtml(data.name))
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0C3F23; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { font-size: 12px; color: #999; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.otyokwah.org/images/logo-white.png" alt="Camp Otyokwah" style="max-width: 120px; height: auto; margin-bottom: 10px;" />
      <h2 style="font-family: Georgia, 'Times New Roman', serif; color: white; font-size: 28px; letter-spacing: 1px; margin: 0;">${escapeHtml(template.confirmationHeading)}</h2>
    </div>
    <div class="content">
      <p>${body}</p>
    </div>
    <div class="footer">
      <p style="font-style: italic; color: #666; margin-bottom: 8px;">For the Kingdom</p>
      <p>${escapeHtml(template.confirmationFooter)}</p>
    </div>
  </div>
</body>
</html>
`.trim();
}

function formatConfirmationText(
  data: ContactEmailData,
  template: ConfirmationTemplate,
): string {
  return `${template.confirmationBody.replace(/\{name\}/g, data.name)}\n\n---\n${template.confirmationFooter}`;
}

export async function sendContactEmail(
  data: ContactEmailData,
): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    return {
      success: false,
      error: "Email not configured",
    };
  }

  try {
    const [config, template] = await Promise.all([
      getSiteConfig(),
      getConfirmationTemplate(),
    ]);
    const resend = new Resend(RESEND_API_KEY);
    const fromAddress = `${config.siteName} <${CONTACT_FORM_FROM}>`;
    const ccRecipients = resolve(CC_STAFF_EMAIL);

    // Send both emails concurrently
    const [staffResult, confirmResult] = await Promise.all([
      // 1. Staff notification — reply-to is the person who submitted
      resend.emails.send({
        from: fromAddress,
        to: [CONTACT_FORM_TO, ...ccRecipients],
        replyTo: data.email,
        subject: `Contact Form: ${data.name}`,
        text: formatStaffNotificationText(data, config.siteName),
        html: formatStaffNotificationHtml(data),
      }),
      // 2. User confirmation — let them know we received it
      resend.emails.send({
        from: fromAddress,
        to: [data.email],
        subject: template.confirmationSubject,
        text: formatConfirmationText(data, template),
        html: formatConfirmationHtml(data, template),
      }),
    ]);

    if (staffResult.error) {
      return { success: false, error: staffResult.error.message };
    }

    if (confirmResult.error) {
      console.error(
        "[contact] Confirmation email failed:",
        confirmResult.error.message,
      );
      // Staff email succeeded — don't fail the whole request
    }

    return {
      success: true,
      messageId: staffResult.data?.id,
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
  if (!RESEND_API_KEY) {
    return false;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.domains.list();
    return !error;
  } catch {
    return false;
  }
}
