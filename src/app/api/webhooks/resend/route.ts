import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { autoAssignTicket } from "@/lib/assignment";
import { extractEmailAddress, extractNameFromEmail } from "@/lib/utils";

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    message_id?: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
    }>;
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("RESEND_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  let payload: ResendWebhookPayload;
  try {
    const wh = new Webhook(webhookSecret);
    payload = wh.verify(body, headers) as ResendWebhookPayload;
  } catch {
    console.error("Webhook verification failed");
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  if (payload.type !== "email.received") {
    return NextResponse.json({ message: "Event type ignored" });
  }

  const { data } = payload;
  const fromEmail = extractEmailAddress(data.from);
  const fromName = extractNameFromEmail(data.from);
  const subject = data.subject || "(No Subject)";

  // Fetch full email body from Resend Receiving API
  let emailBody = "";
  let emailBodyText = "";
  try {
    const emailData = await resend.emails.get(data.email_id);
    if (emailData.data) {
      const emailRecord = emailData.data as unknown as Record<string, unknown>;
      emailBody = (emailRecord.html as string) || "";
      emailBodyText = (emailRecord.text as string) || "";
    }
  } catch (err) {
    console.error("Failed to fetch email body:", err);
    emailBody = "<p>Email body could not be retrieved.</p>";
  }

  // Upsert customer
  const customer = await prisma.customer.upsert({
    where: { email: fromEmail },
    update: { name: fromName || undefined },
    create: { email: fromEmail, name: fromName },
  });

  // Check if this is a reply to an existing ticket
  const isReply = subject.toLowerCase().startsWith("re:");
  let existingTicket = null;

  if (isReply) {
    // Try to find ticket by subject match (strip "Re: " prefix)
    const cleanSubject = subject.replace(/^re:\s*/i, "");
    existingTicket = await prisma.ticket.findFirst({
      where: {
        customerId: customer.id,
        subject: cleanSubject,
        status: { not: "closed" },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  if (existingTicket) {
    // Add message to existing ticket
    await prisma.message.create({
      data: {
        ticketId: existingTicket.id,
        senderType: "customer",
        fromEmail,
        fromName,
        body: emailBody,
        bodyText: emailBodyText,
      },
    });

    // Reopen if resolved
    if (existingTicket.status === "resolved") {
      await prisma.ticket.update({
        where: { id: existingTicket.id },
        data: { status: "open" },
      });
    }
  } else {
    // Create new ticket
    const assignedToId = await autoAssignTicket();

    const ticket = await prisma.ticket.create({
      data: {
        subject: isReply ? subject.replace(/^re:\s*/i, "") : subject,
        customerId: customer.id,
        assignedToId,
        emailMessageId: data.message_id,
        status: "open",
        priority: "medium",
      },
    });

    // Create first message
    await prisma.message.create({
      data: {
        ticketId: ticket.id,
        senderType: "customer",
        fromEmail,
        fromName,
        body: emailBody,
        bodyText: emailBodyText,
      },
    });
  }

  return NextResponse.json({ message: "Processed" });
}
