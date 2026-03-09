"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  timeAgo,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
} from "@/lib/utils";
import { Search, RefreshCw } from "lucide-react";
import type { TicketWithDetails } from "@/types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (search) params.set("search", search);

    const res = await fetch(`/api/tickets?${params}`);
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  }, [status, priority, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Poll every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <Button variant="outline" size="sm" onClick={fetchTickets}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by subject or email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchTickets()}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(s)}
                  </option>
                ))}
              </Select>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {getPriorityLabel(p)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No tickets found. Tickets will appear here when customers send
              emails to your support address.
            </p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{ticket.number}
                      </span>
                      <span className="font-medium text-sm truncate">
                        {ticket.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{ticket.customer.email}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(ticket.createdAt)}</span>
                      {ticket._count && (
                        <>
                          <span>&middot;</span>
                          <span>{ticket._count.messages} messages</span>
                        </>
                      )}
                    </div>
                    {ticket.labels.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {ticket.labels.map((label) => (
                          <Badge
                            key={label.id}
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: label.color,
                              color: label.color,
                            }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
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
