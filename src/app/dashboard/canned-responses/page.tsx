"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, MessageSquareText } from "lucide-react";
import type { CannedResponseData } from "@/types";

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponseData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchResponses = async () => {
    const res = await fetch("/api/canned-responses");
    if (res.ok) {
      setResponses(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setDialogOpen(true);
  };

  const openEdit = (response: CannedResponseData) => {
    setEditingId(response.id);
    setTitle(response.title);
    setBody(response.body);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) return;

    if (editingId) {
      await fetch("/api/canned-responses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title, body }),
      });
    } else {
      await fetch("/api/canned-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
    }

    setDialogOpen(false);
    await fetchResponses();
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/canned-responses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchResponses();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Canned Responses</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5" />
            Reply Templates
          </CardTitle>
          <CardDescription>
            Create reusable reply templates to speed up your responses. These
            can be inserted when composing replies to tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading...
            </p>
          ) : responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No canned responses yet. Create templates for common replies.
              </p>
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium">{response.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {response.body}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(response)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(response.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g., Greeting, Follow-up, Closing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Body</label>
              <Textarea
                placeholder="Write your template reply..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim() || !body.trim()}
              >
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
