import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const messages = await prisma.message.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { content, isInternal } = body;

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const user = await currentUser();
  const senderEmail =
    user?.emailAddresses?.[0]?.emailAddress || "support@example.com";
  const senderName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ") || "Support";

  let resendEmailId: string | null = null;

  // Send email if not an internal note
  if (!isInternal) {
    try {
      const result = await sendEmail({
        to: ticket.customer.email,
        subject: `Re: ${ticket.subject}`,
        html: content,
        replyTo: senderEmail,
      });
      resendEmailId = result.data?.id || null;
    } catch (err) {
      console.error("Failed to send email:", err);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  }

  const message = await prisma.message.create({
    data: {
      ticketId: id,
      senderType: "admin",
      senderClerkId: userId,
      fromEmail: senderEmail,
      fromName: senderName,
      body: content,
      isInternal: isInternal || false,
      resendEmailId,
    },
  });

  // Auto-update ticket status to in_progress if it's open
  if (ticket.status === "open" && !isInternal) {
    await prisma.ticket.update({
      where: { id },
      data: { status: "in_progress", assignedToId: ticket.assignedToId || userId },
    });
  }

  return NextResponse.json(message);
}
