/* eslint-disable @typescript-eslint/no-explicit-any */
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = clerkUser.emailAddresses[0].emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: "User does not have an email address" },
        { status: 404 }
      );
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (existingProfile) {
      return NextResponse.json({ message: "Profile already exists" });
    }

    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });

    return NextResponse.json({ message: "Profile created" }, { status: 201 });
  } catch (error: any) {
    console.error("Error in creating profile", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
