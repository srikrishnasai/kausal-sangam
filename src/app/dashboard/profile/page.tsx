import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { currentUser } from "@/auth";
import { removeSkillAction } from "@/app/actions/profile";
import { AddSkillForm } from "@/components/forms/add-skill-form";
import { ProfileForm } from "@/components/forms/profile-form";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Your profile" };

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export default async function ProfileSettingsPage() {
  const viewer = await currentUser();
  if (!viewer) redirect("/login?callbackUrl=/dashboard/profile");

  const [profile, suggestions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: viewer.id },
      select: {
        id: true,
        name: true,
        headline: true,
        bio: true,
        city: true,
        country: true,
        availability: true,
        avatarUrl: true,
        skills: {
          select: {
            id: true,
            kind: true,
            level: true,
            description: true,
            skill: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.skill.findMany({ select: { name: true }, orderBy: { name: "asc" }, take: 200 }),
  ]);

  if (!profile) redirect("/login");

  const teaches = profile.skills.filter((entry) => entry.kind === "OFFER");
  const learns = profile.skills.filter((entry) => entry.kind === "WANT");
  const suggestionNames = suggestions.map((entry) => entry.name);

  return (
    <div className="page-shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
          <p className="mt-1.5 text-muted">
            This is what other members see when they consider a swap.
          </p>
        </div>
        <Link href={`/members/${profile.id}`} className={buttonClass("secondary", "md")}>
          View public profile
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <Card>
          <SectionTitle title="Details" />
          <ProfileForm profile={profile} />
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle
              title="You can teach"
              description="At least one is needed to send a swap request."
            />

            {teaches.length ? (
              <ul className="mb-5 space-y-2">
                {teaches.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/60 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{entry.skill.name}</span>
                        {entry.level ? (
                          <Badge tone="brand">{levelLabel[entry.level] ?? entry.level}</Badge>
                        ) : null}
                      </div>
                      {entry.description ? (
                        <p className="mt-0.5 text-sm text-muted">{entry.description}</p>
                      ) : null}
                    </div>
                    <form action={removeSkillAction}>
                      <input type="hidden" name="userSkillId" value={entry.id} />
                      <button
                        type="submit"
                        aria-label={`Remove ${entry.skill.name}`}
                        className="cursor-pointer text-sm text-muted hover:text-danger"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-5 text-sm text-muted">Nothing added yet.</p>
            )}

            <AddSkillForm kind="OFFER" suggestions={suggestionNames} />
          </Card>

          <Card>
            <SectionTitle
              title="You want to learn"
              description="Helps others find a fair trade with you."
            />

            {learns.length ? (
              <ul className="mb-5 space-y-2">
                {learns.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/60 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{entry.skill.name}</span>
                      {entry.description ? (
                        <p className="mt-0.5 text-sm text-muted">{entry.description}</p>
                      ) : null}
                    </div>
                    <form action={removeSkillAction}>
                      <input type="hidden" name="userSkillId" value={entry.id} />
                      <button
                        type="submit"
                        aria-label={`Remove ${entry.skill.name}`}
                        className="cursor-pointer text-sm text-muted hover:text-danger"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-5 text-sm text-muted">Nothing added yet.</p>
            )}

            <AddSkillForm kind="WANT" suggestions={suggestionNames} />
          </Card>
        </div>
      </div>
    </div>
  );
}
