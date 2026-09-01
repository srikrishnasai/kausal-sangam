import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { location } from "@/lib/utils";

export type MemberCardData = {
  id: string;
  name: string;
  headline: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  skills: { id: string; kind: "OFFER" | "WANT"; skill: { name: string } }[];
};

/**
 * `lead` decides which half of the trade is shown first. Browse flips it when
 * you switch to the "looking to learn" side, so the column you searched on is
 * the column you read first.
 */
export function MemberCard({
  member,
  lead = "OFFER",
}: {
  member: MemberCardData;
  lead?: "OFFER" | "WANT";
}) {
  const teaches = member.skills.filter((s) => s.kind === "OFFER");
  const learns = member.skills.filter((s) => s.kind === "WANT");
  const place = location(member.city, member.country);

  return (
    <Card className="flex h-full flex-col gap-4 transition-colors hover:border-brand/50">
      <div className="flex items-start gap-3">
        <Avatar name={member.name} src={member.avatarUrl} size={48} />
        <div className="min-w-0">
          <Link href={`/members/${member.id}`} className="font-semibold hover:text-brand">
            {member.name}
          </Link>
          {member.headline ? (
            <p className="truncate text-sm text-muted">{member.headline}</p>
          ) : null}
          {place ? <p className="mt-0.5 text-xs text-muted">{place}</p> : null}
        </div>
      </div>

      <div className="space-y-2.5">
        {(lead === "WANT" ? ["WANT", "OFFER"] : ["OFFER", "WANT"]).map((section) => {
          const primary = section === lead;
          const entries = section === "OFFER" ? teaches : learns;

          // The half you filtered on always renders, even when empty, so the
          // card does not silently change shape between results.
          if (!entries.length && !primary) return null;

          return (
            <div key={section}>
              <p className="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">
                {section === "OFFER" ? "Teaches" : "Wants to learn"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entries.length ? (
                  entries.slice(0, 4).map((s) => (
                    <Badge key={s.id} tone={section === "OFFER" ? "brand" : "accent"}>
                      {s.skill.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted">Nothing listed yet</span>
                )}
                {entries.length > 4 ? <Badge>+{entries.length - 4}</Badge> : null}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href={`/members/${member.id}`}
        className="mt-auto text-sm font-medium text-brand hover:underline"
      >
        View profile &rarr;
      </Link>
    </Card>
  );
}
