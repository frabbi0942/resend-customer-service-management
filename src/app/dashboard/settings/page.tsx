"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Settings, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Assignment Settings
          </CardTitle>
          <CardDescription>
            Configure how tickets are automatically assigned to team members.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Assignment Strategy</label>
            <Select
              value={settings.assignment_strategy || "least_loaded"}
              onChange={(e) =>
                updateSetting("assignment_strategy", e.target.value)
              }
              className="mt-1"
            >
              <option value="least_loaded">
                Least Loaded (assign to member with fewest open tickets)
              </option>
              <option value="round_robin">
                Round Robin (rotate through team members)
              </option>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Determines how new tickets are automatically assigned to active
              team members.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Set up your Resend webhook to forward emails to this application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Webhook URL</label>
            <Input
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/webhooks/resend`}
              readOnly
              className="mt-1 font-mono text-xs"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add this URL in your Resend Dashboard under Webhooks. Select the
              &quot;email.received&quot; event type.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Setup Steps</label>
            <ol className="text-sm text-muted-foreground mt-2 space-y-2 list-decimal list-inside">
              <li>Go to your Resend Dashboard &rarr; Webhooks</li>
              <li>Click &quot;Add Webhook&quot;</li>
              <li>Paste the webhook URL above</li>
              <li>Select &quot;email.received&quot; as the event type</li>
              <li>Copy the webhook signing secret to your .env file as RESEND_WEBHOOK_SECRET</li>
              <li>Set up a receiving domain in Resend &rarr; Domains &rarr; Receiving</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
