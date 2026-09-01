import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { currentUser } from "@/auth";
import { SwapRequestForm } from "@/components/forms/swap-request-form";
import { Stars } from "@/components/stars";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, EmptyState, SectionTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate, location } from "@/lib/utils";

const levelLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

async function getMember(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      headline: true,
      bio: true,
      city: true,
      country: true,
      avatarUrl: true,
      availability: true,
      createdAt: true,
      skills: {
        select: {
          id: true,
          kind: true,
          level: true,
          description: true,
          skill: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      reviewsReceived: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  return { title: member?.name ?? "Member" };
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  const viewer = await currentUser();
  const isSelf = viewer?.id === member.id;

  const teaches = member.skills.filter((entry) => entry.kind === "OFFER");
  const learns = member.skills.filter((entry) => entry.kind === "WANT");
  const place = location(member.city, member.country);

  const ratingCount = member.reviewsReceived.length;
  const averageRating = ratingCount
    ? member.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / ratingCount
    : 0;

  const mySkills =
    viewer && !isSelf
      ? await prisma.userSkill.findMany({
          where: { userId: viewer.id, kind: "OFFER" },
          select: { skill: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        })
      : [];

  return (
    <div className="page-shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-8">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={member.name} src={member.avatarUrl} size={88} />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">{member.name}</h1>
            {member.headline ? <p className="mt-1 text-lg text-muted">{member.headline}</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              {place ? <span>{place}</span> : null}
              {member.availability ? <span>Free: {member.availability}</span> : null}
              <span>Member since {formatDate(member.createdAt)}</span>
            </div>
            {ratingCount ? (
              <div className="mt-3">
                <Stars rating={averageRating} count={ratingCount} />
              </div>
            ) : null}
          </div>
        </div>

        {member.bio ? (
          <Card>
            <p className="text-pretty whitespace-pre-line">{member.bio}</p>
          </Card>
        ) : null}

        <section>
          <SectionTitle title="Can teach" description="Skills this member is offering to swap." />
          {teaches.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {teaches.map((entry) => (
                <li key={entry.id}>
                  <Card className="h-full p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{entry.skill.name}</span>
                      {entry.level ? (
                        <Badge tone="brand">{levelLabel[entry.level] ?? entry.level}</Badge>
                      ) : null}
                    </div>
                    {entry.description ? (
                      <p className="mt-1.5 text-sm text-muted">{entry.description}</p>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No skills listed yet" />
          )}
        </section>

        {learns.length ? (
          <section>
            <SectionTitle title="Wants to learn" />
            <div className="flex flex-wrap gap-2">
              {learns.map((entry) => (
                <Badge key={entry.id} tone="accent" className="px-3 py-1 text-sm">
                  {entry.skill.name}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionTitle title="Reviews" />
          {member.reviewsReceived.length ? (
            <ul className="space-y-3">
              {member.reviewsReceived.map((review) => (
                <li key={review.id}>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={review.author.name} src={review.author.avatarUrl} size={32} />
                      <div className="min-w-0">
                        <Link
                          href={`/members/${review.author.id}`}
                          className="text-sm font-medium hover:text-brand"
                        >
                          {review.author.name}
                        </Link>
                        <p className="text-xs text-muted">{formatDate(review.createdAt)}</p>
                      </div>
                      <span className="ml-auto">
                        <Stars rating={review.rating} />
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="mt-3 text-sm text-pretty">{review.comment}</p>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No reviews yet"
              description="Reviews appear after a completed swap."
            />
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <h2 className="text-lg font-semibold tracking-tight">Propose a swap</h2>

          {isSelf ? (
            <>
              <p className="mt-1.5 text-sm text-muted">This is how your profile looks to others.</p>
              <Link
                href="/dashboard/profile"
                className={buttonClass("secondary", "md", "mt-4 w-full")}
              >
                Edit profile
              </Link>
            </>
          ) : !viewer ? (
            <>
              <p className="mt-1.5 text-sm text-muted">
                Sign in to send {member.name} a swap request.
              </p>
              <Link
                href={`/login?callbackUrl=/members/${member.id}`}
                className={buttonClass("primary", "md", "mt-4 w-full")}
              >
                Sign in to continue
              </Link>
            </>
          ) : teaches.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted">
              {member.name} has not listed a skill to teach yet.
            </p>
          ) : mySkills.length === 0 ? (
            <>
              <p className="mt-1.5 text-sm text-muted">
                Add at least one skill you can teach before proposing a swap.
              </p>
              <Link
                href="/dashboard/profile"
                className={buttonClass("primary", "md", "mt-4 w-full")}
              >
                Add a skill
              </Link>
            </>
          ) : (
            <div className="mt-4">
              <SwapRequestForm
                toUserId={member.id}
                toUserName={member.name.split(" ")[0] ?? member.name}
                theirSkills={teaches.map((entry) => entry.skill)}
                mySkills={mySkills.map((entry) => entry.skill)}
              />
            </div>
          )}
        </Card>
      </aside>
    </div>
  );
}
