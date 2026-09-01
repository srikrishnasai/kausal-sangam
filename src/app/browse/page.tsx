import type { Metadata } from "next";
import Link from "next/link";

import { currentUser } from "@/auth";
import { MemberCard, type MemberCardData } from "@/components/member-card";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/field";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = { title: "Browse members" };

type Search = { q?: string; skill?: string; city?: string };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { q = "", skill = "", city = "" } = await searchParams;
  const viewer = await currentUser();

  const where: Prisma.UserWhereInput = {
    skills: skill
      ? { some: { kind: "OFFER", skill: { slug: skill } } }
      : { some: { kind: "OFFER" } },
  };

  if (viewer) where.id = { not: viewer.id };
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { headline: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      { skills: { some: { skill: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  const [members, skills] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
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
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.skill.findMany({
      where: { users: { some: { kind: "OFFER" } } },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const filtered = Boolean(q || skill || city);

  return (
    <div className="page-shell py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Browse members</h1>
      <p className="mt-1.5 text-muted">
        Everyone listed here is offering at least one skill. Find a trade that suits you.
      </p>

      <form className="mt-6 grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Name, skill or keyword" />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={city} placeholder="Any city" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="skill">Skill on offer</Label>
          <Select id="skill" name="skill" defaultValue={skill}>
            <option value="">Any skill</option>
            {skills.map((option) => (
              <option key={option.id} value={option.slug}>
                {option.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 sm:justify-end">
          <button type="submit" className={buttonClass("primary", "md")}>
            Apply
          </button>
          {filtered ? (
            <Link href="/browse" className={buttonClass("ghost", "md")}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <p className="mt-6 mb-4 text-sm text-muted">
        {members.length} {members.length === 1 ? "member" : "members"}
        {filtered ? (members.length === 1 ? " matches your filters" : " match your filters") : ""}
      </p>

      {members.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(members as MemberCardData[]).map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No members match yet"
          description="Try a broader search, or be the first to offer this skill."
        />
      )}
    </div>
  );
}
