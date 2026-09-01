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

export function MemberCard({ member }: { member: MemberCardData }) {
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
        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">Teaches</p>
          <div className="flex flex-wrap gap-1.5">
            {teaches.length ? (
              teaches.slice(0, 4).map((s) => (
                <Badge key={s.id} tone="brand">
                  {s.skill.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted">Nothing listed yet</span>
            )}
            {teaches.length > 4 ? <Badge>+{teaches.length - 4}</Badge> : null}
          </div>
        </div>

        {learns.length ? (
          <div>
            <p className="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">
              Wants to learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {learns.slice(0, 3).map((s) => (
                <Badge key={s.id} tone="accent">
                  {s.skill.name}
                </Badge>
              ))}
              {learns.length > 3 ? <Badge>+{learns.length - 3}</Badge> : null}
            </div>
          </div>
        ) : null}
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
