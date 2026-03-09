"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  formatDate,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
} from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  StickyNote,
  RefreshCw,
  User,
  Headphones,
} from "lucide-react";
import type { TicketWithDetails, CannedResponseData } from "@/types";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [cannedResponses, setCannedResponses] = useState<CannedResponseData[]>(
    []
  );

  const fetchTicket = useCallback(async () => {
    const res = await fetch(`/api/tickets/${id}`);
    if (res.ok) {
      const data = await res.json();
      setTicket(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchTicket();
    fetch("/api/canned-responses")
      .then((r) => r.json())
      .then(setCannedResponses)
      .catch(() => {});
  }, [fetchTicket]);

  // Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  }, [fetchTicket]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    setSending(true);

    const res = await fetch(`/api/tickets/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent, isInternal }),
    });

    if (res.ok) {
      setReplyContent("");
      setIsInternal(false);
      await fetchTicket();
    }
    setSending(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await fetchTicket();
  };

  const handlePriorityChange = async (newPriority: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: newPriority }),
    });
    await fetchTicket();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Ticket not found</p>
        <Button
          variant="link"
          onClick={() => router.push("/dashboard/tickets")}
        >
          Back to tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/tickets")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-mono">
                #{ticket.number}
              </span>
              <h1 className="text-xl font-bold">{ticket.subject}</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              From {ticket.customer.email} &middot;{" "}
              {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Conversation */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.isInternal
                      ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3"
                      : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarFallback>
                      {message.senderType === "customer" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Headphones className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.fromName || message.fromEmail}
                      </span>
                      {message.isInternal && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs"
                        >
                          Internal Note
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <div
                      className="text-sm prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.body }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reply Composer */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={isInternal ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsInternal(false)}
                >
                  <Send className="mr-1 h-3 w-3" />
                  Reply
                </Button>
                <Button
                  variant={isInternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsInternal(true)}
                  className={isInternal ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  <StickyNote className="mr-1 h-3 w-3" />
                  Internal Note
                </Button>
                {cannedResponses.length > 0 && (
                  <Select
                    className="w-auto text-xs"
                    onChange={(e) => {
                      const response = cannedResponses.find(
                        (r) => r.id === e.target.value
                      );
                      if (response) setReplyContent(response.body);
                    }}
                    value=""
                  >
                    <option value="">Insert template...</option>
                    {cannedResponses.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={
                  isInternal
                    ? "Write an internal note (not sent to customer)..."
                    : "Write your reply..."
                }
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                className={
                  isInternal
                    ? "border-yellow-300 dark:border-yellow-800"
                    : ""
                }
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || sending}
                  className={
                    isInternal
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : ""
                  }
                >
                  {sending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : isInternal ? (
                    <StickyNote className="mr-2 h-4 w-4" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isInternal ? "Add Note" : "Send Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Status
                </label>
                <Select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="mt-1"
                >
                  {TICKET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {getStatusLabel(s)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Priority
                </label>
                <Select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="mt-1"
                >
                  {TICKET_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {getPriorityLabel(p)}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Customer
                </label>
                <p className="text-sm mt-1">{ticket.customer.email}</p>
                {ticket.customer.name && (
                  <p className="text-xs text-muted-foreground">
                    {ticket.customer.name}
                  </p>
                )}
              </div>

              {ticket.labels.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ticket.labels.map((label) => (
                      <Badge
                        key={label.id}
                        variant="outline"
                        style={{
                          borderColor: label.color,
                          color: label.color,
                        }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm mt-1">{formatDate(ticket.createdAt)}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Updated
                </label>
                <p className="text-sm mt-1">{formatDate(ticket.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
