import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "support@example.com";

  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    ...(replyTo && { replyTo }),
  });

  return result;
}
