import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };

  if (src) {
    return (
      // Avatars are arbitrary user-supplied URLs, so next/image remote patterns
      // would have to allow every host — a plain img is the honest choice here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={style}
        className={cn("shrink-0 rounded-full border border-border object-cover", className)}
      />
    );
  }

  return (
    <span
      style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-soft-fg",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
