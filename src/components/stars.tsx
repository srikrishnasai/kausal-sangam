const FILLED = "★";

export function Stars({ rating, count }: { rating: number; count?: number }) {
  const rounded = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span aria-hidden className="tracking-tight text-accent">
        {FILLED.repeat(rounded)}
        <span className="text-muted/40">{FILLED.repeat(5 - rounded)}</span>
      </span>
      <span className="text-muted tabular-nums">
        {rating.toFixed(1)}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>
    </span>
  );
}
