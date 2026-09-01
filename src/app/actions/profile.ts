"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fieldErrorsOf, valuesOf, type FormState } from "@/lib/form";
import { profileSchema, userSkillSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const values = valuesOf(formData);
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { name, headline, bio, city, country, availability, avatarUrl } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      headline: headline || null,
      bio: bio || null,
      city: city || null,
      country: country || null,
      availability: availability || null,
      avatarUrl: avatarUrl || null,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/members/${userId}`);
  revalidatePath("/browse");
  return { ok: true };
}

export async function addSkillAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await requireUserId();
  const values = valuesOf(formData);
  const raw = Object.fromEntries(formData);
  const parsed = userSkillSchema.safeParse({
    ...raw,
    level: raw.level === "" ? undefined : raw.level,
  });
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { skillName, kind, level, description } = parsed.data;
  const slug = slugify(skillName);
  if (!slug) return { values, fieldErrors: { skillName: "Enter a valid skill name" } };

  const skill = await prisma.skill.upsert({
    where: { slug },
    update: {},
    create: { slug, name: skillName, category: "Other" },
  });

  const duplicate = await prisma.userSkill.findUnique({
    where: { userId_skillId_kind: { userId, skillId: skill.id, kind } },
    select: { id: true },
  });
  if (duplicate) {
    return {
      values,
      fieldErrors: {
        skillName: `${skill.name} is already in your ${kind === "OFFER" ? "teaching" : "learning"} list`,
      },
    };
  }

  await prisma.userSkill.create({
    data: {
      userId,
      skillId: skill.id,
      kind,
      level: kind === "OFFER" ? (level ?? "INTERMEDIATE") : null,
      description: description || null,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/members/${userId}`);
  revalidatePath("/browse");
  return { ok: true };
}

export async function removeSkillAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("userSkillId") ?? "");
  if (!id) return;

  // deleteMany scopes the delete to the owner — a forged id hits zero rows.
  await prisma.userSkill.deleteMany({ where: { id, userId } });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/members/${userId}`);
  revalidatePath("/browse");
}
