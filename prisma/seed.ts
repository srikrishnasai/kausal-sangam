import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { slugify } from "../src/lib/utils";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEMO_PASSWORD = "password123";

const SKILLS: { name: string; category: string }[] = [
  { name: "Python", category: "Technology" },
  { name: "TypeScript", category: "Technology" },
  { name: "React", category: "Technology" },
  { name: "Excel", category: "Technology" },
  { name: "Guitar", category: "Music" },
  { name: "Tabla", category: "Music" },
  { name: "Carnatic Vocals", category: "Music" },
  { name: "Photography", category: "Creative" },
  { name: "Watercolour", category: "Creative" },
  { name: "Pottery", category: "Creative" },
  { name: "Bread Baking", category: "Food" },
  { name: "Gujarati Cooking", category: "Food" },
  { name: "Yoga", category: "Wellbeing" },
  { name: "Public Speaking", category: "Communication" },
  { name: "Spanish", category: "Languages" },
  { name: "Malayalam", category: "Languages" },
  { name: "Urdu Poetry", category: "Languages" },
];

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

type SeedUser = {
  email: string;
  name: string;
  headline: string;
  bio: string;
  city: string;
  country: string;
  availability: string;
  teaches: { skill: string; level: Level; note?: string }[];
  wants: { skill: string; note?: string }[];
};

const USERS: SeedUser[] = [
  {
    email: "ananya@example.com",
    name: "Ananya Iyer",
    headline: "Data engineer who sings Carnatic on weekends",
    bio: "I have been singing since I was six and writing Python for about a decade. Happy to take beginners through either, slowly and patiently.",
    city: "Bengaluru",
    country: "India",
    availability: "Weekday evenings after 7pm",
    teaches: [
      { skill: "Carnatic Vocals", level: "ADVANCED", note: "Varnams and basic kritis" },
      { skill: "Python", level: "EXPERT", note: "From first script to pandas" },
    ],
    wants: [{ skill: "Pottery" }, { skill: "Spanish", note: "Absolute beginner" }],
  },
  {
    email: "rahul@example.com",
    name: "Rahul Mehta",
    headline: "Guitarist, street photographer, terrible cook",
    bio: "Played in two bands, shot three weddings badly and one well. I teach in a relaxed way and I do not mind starting from zero.",
    city: "Pune",
    country: "India",
    availability: "Weekends, most of the day",
    teaches: [
      { skill: "Guitar", level: "ADVANCED", note: "Chords, rhythm, first songs" },
      { skill: "Photography", level: "INTERMEDIATE", note: "Manual mode and composition" },
    ],
    wants: [{ skill: "Python" }, { skill: "Bread Baking" }],
  },
  {
    email: "sneha@example.com",
    name: "Sneha Kulkarni",
    headline: "Baker by 5am, painter by dusk",
    bio: "Sourdough is my whole personality. I also paint small watercolour studies and would love to trade for something musical.",
    city: "Pune",
    country: "India",
    availability: "Weekday mornings, Sunday afternoons",
    teaches: [
      { skill: "Bread Baking", level: "EXPERT", note: "Sourdough starter to bake" },
      { skill: "Watercolour", level: "INTERMEDIATE" },
    ],
    wants: [{ skill: "Guitar" }, { skill: "Yoga" }],
  },
  {
    email: "imran@example.com",
    name: "Imran Sheikh",
    headline: "Tabla player and Urdu poetry nerd",
    bio: "Twelve years of tabla, and a long habit of reading Faiz out loud. I teach rhythm by feel before theory.",
    city: "Hyderabad",
    country: "India",
    availability: "Tuesday and Thursday evenings",
    teaches: [
      { skill: "Tabla", level: "EXPERT", note: "Teentaal onwards" },
      { skill: "Urdu Poetry", level: "ADVANCED", note: "Reading, meter and meaning" },
    ],
    wants: [{ skill: "Photography" }, { skill: "React" }],
  },
  {
    email: "priya@example.com",
    name: "Priya Nair",
    headline: "Yoga teacher, spreadsheet sceptic",
    bio: "Certified Hatha teacher. I want to get better with numbers and music, in that order.",
    city: "Kochi",
    country: "India",
    availability: "Early mornings",
    teaches: [
      { skill: "Yoga", level: "EXPERT", note: "Hatha, beginner friendly" },
      { skill: "Malayalam", level: "EXPERT" },
    ],
    wants: [{ skill: "Carnatic Vocals" }, { skill: "Excel" }],
  },
  {
    email: "vikram@example.com",
    name: "Vikram Rao",
    headline: "Frontend engineer trying to find a rhythm",
    bio: "I build React apps for a living and want to learn an instrument before I turn forty. Very happy to pair on code in return.",
    city: "Bengaluru",
    country: "India",
    availability: "Weeknights and Saturday mornings",
    teaches: [
      { skill: "React", level: "EXPERT", note: "Hooks, state, app structure" },
      { skill: "TypeScript", level: "ADVANCED" },
    ],
    wants: [{ skill: "Tabla" }, { skill: "Public Speaking" }],
  },
  {
    email: "meera@example.com",
    name: "Meera Joshi",
    headline: "Potter with a very patient kiln",
    bio: "Wheel throwing, hand building, and a Gujarati kitchen I learned from my grandmother.",
    city: "Ahmedabad",
    country: "India",
    availability: "Weekend afternoons",
    teaches: [
      { skill: "Pottery", level: "ADVANCED", note: "Wheel basics, first bowl" },
      { skill: "Gujarati Cooking", level: "EXPERT" },
    ],
    wants: [{ skill: "Watercolour" }, { skill: "TypeScript" }],
  },
  {
    email: "daniel@example.com",
    name: "Daniel Fernandes",
    headline: "Spanish tutor and recovering stage-fright case",
    bio: "Lived in Madrid for six years. I now coach people through their first talks, because I badly needed that myself.",
    city: "Panaji",
    country: "India",
    availability: "Flexible, ask me",
    teaches: [
      { skill: "Spanish", level: "EXPERT", note: "Conversational from day one" },
      { skill: "Public Speaking", level: "ADVANCED" },
    ],
    wants: [{ skill: "Urdu Poetry" }, { skill: "Gujarati Cooking" }],
  },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.swapRequest.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.user.deleteMany();
  await prisma.skill.deleteMany();

  console.log("Seeding skills...");
  await prisma.skill.createMany({
    data: SKILLS.map((entry) => ({ ...entry, slug: slugify(entry.name) })),
  });
  const skills = await prisma.skill.findMany({ select: { id: true, name: true } });
  const skillId = new Map(skills.map((skill) => [skill.name, skill.id]));

  const idFor = (name: string) => {
    const id = skillId.get(name);
    if (!id) throw new Error(`Unknown skill in seed data: ${name}`);
    return id;
  };

  console.log("Seeding members...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const userId = new Map<string, string>();

  for (const person of USERS) {
    const user = await prisma.user.create({
      data: {
        email: person.email,
        passwordHash,
        name: person.name,
        headline: person.headline,
        bio: person.bio,
        city: person.city,
        country: person.country,
        availability: person.availability,
        skills: {
          create: [
            ...person.teaches.map((entry) => ({
              skillId: idFor(entry.skill),
              kind: "OFFER" as const,
              level: entry.level,
              description: entry.note ?? null,
            })),
            ...person.wants.map((entry) => ({
              skillId: idFor(entry.skill),
              kind: "WANT" as const,
              description: entry.note ?? null,
            })),
          ],
        },
      },
      select: { id: true, email: true },
    });
    userId.set(user.email, user.id);
  }

  const uid = (email: string) => {
    const id = userId.get(email);
    if (!id) throw new Error(`Unknown user in seed data: ${email}`);
    return id;
  };

  console.log("Seeding swaps...");

  // In progress, with a short conversation.
  const active = await prisma.swapRequest.create({
    data: {
      fromUserId: uid("rahul@example.com"),
      toUserId: uid("ananya@example.com"),
      requestedSkillId: idFor("Python"),
      offeredSkillId: idFor("Guitar"),
      status: "ACCEPTED",
      respondedAt: new Date(),
      message:
        "Hi Ananya! I keep starting Python tutorials and stalling around week two. I could teach you guitar from scratch in exchange - chords, strumming, a first song.",
    },
    select: { id: true },
  });

  await prisma.message.createMany({
    data: [
      {
        swapRequestId: active.id,
        senderId: uid("ananya@example.com"),
        body: "Happy to do this. Shall we start with an hour on Saturday morning?",
      },
      {
        swapRequestId: active.id,
        senderId: uid("rahul@example.com"),
        body: "Saturday 10am works. I will bring a spare guitar so you can try it the same day.",
      },
      {
        swapRequestId: active.id,
        senderId: uid("ananya@example.com"),
        body: "Perfect. Install Python 3.12 before then and we will write something small.",
      },
    ],
  });

  // Completed, reviewed both ways.
  const completed = await prisma.swapRequest.create({
    data: {
      fromUserId: uid("sneha@example.com"),
      toUserId: uid("rahul@example.com"),
      requestedSkillId: idFor("Guitar"),
      offeredSkillId: idFor("Bread Baking"),
      status: "COMPLETED",
      respondedAt: new Date(),
      completedAt: new Date(),
      message:
        "I have wanted to play guitar since school. I can teach you sourdough properly, starter included.",
    },
    select: { id: true },
  });

  await prisma.message.createMany({
    data: [
      {
        swapRequestId: completed.id,
        senderId: uid("rahul@example.com"),
        body: "Four sessions each? Guitar at mine, baking at yours.",
      },
      {
        swapRequestId: completed.id,
        senderId: uid("sneha@example.com"),
        body: "Done. Bring an appetite.",
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        swapRequestId: completed.id,
        authorId: uid("sneha@example.com"),
        subjectId: uid("rahul@example.com"),
        rating: 5,
        comment: "Rahul is unbelievably patient. I played a whole song by the fourth session.",
      },
      {
        swapRequestId: completed.id,
        authorId: uid("rahul@example.com"),
        subjectId: uid("sneha@example.com"),
        rating: 5,
        comment: "My starter is alive and my kitchen smells like a bakery. Excellent teacher.",
      },
    ],
  });

  // A second completed swap with one review, so ratings vary.
  const completedTwo = await prisma.swapRequest.create({
    data: {
      fromUserId: uid("priya@example.com"),
      toUserId: uid("ananya@example.com"),
      requestedSkillId: idFor("Carnatic Vocals"),
      offeredSkillId: idFor("Yoga"),
      status: "COMPLETED",
      respondedAt: new Date(),
      completedAt: new Date(),
      message:
        "Would love some basics in Carnatic vocals. I can offer Hatha yoga sessions, beginner friendly, early mornings.",
    },
    select: { id: true },
  });

  await prisma.review.create({
    data: {
      swapRequestId: completedTwo.id,
      authorId: uid("priya@example.com"),
      subjectId: uid("ananya@example.com"),
      rating: 4,
      comment: "Clear and encouraging. I finally understand what sruti means.",
    },
  });

  // Pending requests, so the dashboard has something to act on.
  await prisma.swapRequest.createMany({
    data: [
      {
        fromUserId: uid("vikram@example.com"),
        toUserId: uid("imran@example.com"),
        requestedSkillId: idFor("Tabla"),
        offeredSkillId: idFor("React"),
        message:
          "I have wanted to learn tabla for years and never started. In return I can teach React properly, including the parts tutorials skip.",
      },
      {
        fromUserId: uid("meera@example.com"),
        toUserId: uid("sneha@example.com"),
        requestedSkillId: idFor("Watercolour"),
        offeredSkillId: idFor("Pottery"),
        message:
          "Your watercolour studies are lovely. I can teach you wheel throwing at my studio, all materials included.",
      },
      {
        fromUserId: uid("daniel@example.com"),
        toUserId: uid("imran@example.com"),
        requestedSkillId: idFor("Urdu Poetry"),
        offeredSkillId: idFor("Spanish"),
        message:
          "I read Urdu poetry only in translation and it is driving me mad. Spanish conversation in return, any level.",
      },
    ],
  });

  const counts = {
    skills: await prisma.skill.count(),
    members: await prisma.user.count(),
    swaps: await prisma.swapRequest.count(),
  };

  console.log("Seed complete:", counts);
  console.log(`Demo logins: any of the emails above, password "${DEMO_PASSWORD}"`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
