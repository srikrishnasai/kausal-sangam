import Link from "next/link";

import { MemberCard, type MemberCardData } from "@/components/member-card";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const memberSelect = {
  id: true,
  name: true,
  headline: true,
  city: true,
  country: true,
  avatarUrl: true,
  skills: {
    select: { id: true, kind: true, skill: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  },
} as const;

const steps = [
  {
    title: "List what you can teach",
    body: "Add the skills you are happy to share - an instrument, a language, a framework, a recipe.",
  },
  {
    title: "Find a fair trade",
    body: "Search by skill or city. Everyone here is offering something and looking for something.",
  },
  {
    title: "Swap and vouch",
    body: "Agree the terms in chat, meet, and leave each other a review when you are done.",
  },
];

export default async function HomePage() {
  const [memberCount, swapCount, skills, featured] = await Promise.all([
    prisma.user.count(),
    prisma.swapRequest.count({ where: { status: "COMPLETED" } }),
    prisma.skill.findMany({
      where: { users: { some: { kind: "OFFER" } } },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { users: { where: { kind: "OFFER" } } } },
      },
    }),
    prisma.user.findMany({
      where: { skills: { some: { kind: "OFFER" } } },
      select: memberSelect,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const popular = [...skills].sort((a, b) => b._count.users - a._count.users).slice(0, 12);

  const stats = [
    { label: "members", value: memberCount },
    { label: "skills on offer", value: skills.length },
    { label: "swaps completed", value: swapCount },
  ];

  return (
    <>
      <section className="page-shell pt-16 pb-14 sm:pt-24">
        <div className="max-w-2xl">
          <Badge tone="accent">कौशल संगम &mdash; a confluence of skills</Badge>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl">
            Trade what you know for what you want to learn.
          </h1>
          <p className="mt-5 text-lg text-muted text-pretty">
            Kausal Sangam is a skill-swap community. No fees, no credits, no money &mdash; just one
            person teaching another, both ways.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className={buttonClass("primary", "lg")}>
              Start swapping
            </Link>
            <Link href="/browse" className={buttonClass("secondary", "lg")}>
              Browse members
            </Link>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {popular.length ? (
        <section className="page-shell pb-14">
          <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
            Popular right now
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {popular.map((skill) => (
              <Link
                key={skill.id}
                href={`/browse?skill=${skill.slug}`}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm transition-colors hover:border-brand hover:text-brand"
              >
                {skill.name}
                <span className="ml-1.5 text-muted tabular-nums">{skill._count.users}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-border bg-surface py-14">
        <div className="page-shell">
          <h2 className="text-2xl font-semibold tracking-tight">How a swap works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-brand-soft-fg">
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {featured.length ? (
        <section className="page-shell py-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Newest members</h2>
            <Link href="/browse" className="text-sm font-medium text-brand hover:underline">
              See everyone &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(featured as MemberCardData[]).map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
