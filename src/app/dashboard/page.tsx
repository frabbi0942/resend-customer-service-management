import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  timeAgo,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const [open, inProgress, resolved, total, recentTickets] = await Promise.all([
    prisma.ticket.count({ where: { status: "open" } }),
    prisma.ticket.count({ where: { status: "in_progress" } }),
    prisma.ticket.count({ where: { status: "resolved" } }),
    prisma.ticket.count(),
    prisma.ticket.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { customer: true, _count: { select: { messages: true } } },
    }),
  ]);

  return { open, inProgress, resolved, total, recentTickets };
}

export default async function DashboardPage() {
  const { open, inProgress, resolved, total, recentTickets } =
    await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No tickets yet. Tickets will appear here when customers send
              emails.
            </p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        #{ticket.number}
                      </span>
                      <span className="font-medium text-sm">
                        {ticket.subject}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {ticket.customer.email} &middot;{" "}
                      {timeAgo(ticket.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(ticket.status)}
                    >
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={getPriorityColor(ticket.priority)}
                    >
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
