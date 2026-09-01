"use client";

import { useState } from "react";

import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Shown once a swap completes, when the member still wants a skill nobody
 * teaches yet. No referral table, no tracking — the whole feature is a message
 * worth sending, per roadmap 2.4.
 */
export function InviteNudge({ skillName, message }: { skillName: string; message: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the text stays selectable either way.
      setCopied(false);
    }
  }

  return (
    <Card className="border-accent/40 bg-accent-soft/40">
      <p className="font-medium">Know anyone who teaches {skillName}?</p>
      <p className="mt-1 text-sm text-muted">
        You are still looking for it, and nobody here offers it yet. An invite is the fastest way to
        change that.
      </p>

      <textarea
        readOnly
        rows={3}
        value={message}
        aria-label="Invite message"
        className="mt-3 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      />

      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={copy} className={buttonClass("secondary", "sm")}>
          Copy invite
        </button>
        <span aria-live="polite" className="text-sm text-muted">
          {copied ? "Copied." : ""}
        </span>
      </div>
    </Card>
  );
}
