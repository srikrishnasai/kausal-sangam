import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "accent" | "success" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-soft-fg",
  accent: "bg-accent-soft text-accent-soft-fg",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-2 text-muted",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
