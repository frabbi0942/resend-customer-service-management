"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const shortcuts = [
  { keys: "g t", description: "Go to Tickets" },
  { keys: "g d", description: "Go to Dashboard" },
  { keys: "g s", description: "Go to Settings" },
  { keys: "g m", description: "Go to Team" },
  { keys: "?", description: "Show keyboard shortcuts" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "?") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      if (key === "escape") {
        setShowHelp(false);
        setPendingKey(null);
        return;
      }

      if (pendingKey === "g") {
        setPendingKey(null);
        switch (key) {
          case "t":
            router.push("/dashboard/tickets");
            break;
          case "d":
            router.push("/dashboard");
            break;
          case "s":
            router.push("/dashboard/settings");
            break;
          case "m":
            router.push("/dashboard/team");
            break;
        }
        return;
      }

      if (key === "g") {
        setPendingKey("g");
        setTimeout(() => setPendingKey(null), 1000);
        return;
      }
    },
    [pendingKey, router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent onClose={() => setShowHelp(false)}>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.keys}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="inline-flex items-center gap-1 rounded border bg-muted px-2 py-1 font-mono text-xs">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
