import { brevoClient } from "../config/brevo.js";
import { env } from "../config/env.js";

export const sendTemplateEmail = async (
  to: string,
  templateId: number,
  dynamicTemplateData: Record<string, unknown>,
) => {
  await brevoClient.transactionalEmails.sendTransacEmail({
    to: [{ email: to }],
    sender: {
      email: env.BREVO_FROM_EMAIL,
      name: env.BREVO_FROM_NAME,
    },
    templateId,
    params: dynamicTemplateData,
  });
};

export const sendTestEmail = async (to: string) => {
  await brevoClient.transactionalEmails.sendTransacEmail({
    to: [{ email: to }],
    sender: {
      email: env.BREVO_FROM_EMAIL,
      name: env.BREVO_FROM_NAME,
    },
    subject: "Onboarding platform test email",
    textContent: "Your Brevo email integration is working.",
    htmlContent:
      "<p>Your Brevo email integration is working.</p><p>JrGuide onboarding email service is ready.</p>",
  });
};
