import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { projectMessages } from "@/shared/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  projectId: z.string(),
  body: z.string().min(1).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = schema.parse(await request.json());

    if (!db) {
      return NextResponse.json({
        id: "local-msg",
        ...data,
        senderRole: user.role === "customer" ? "customer" : "admin",
        createdAt: new Date().toISOString(),
      });
    }

    const [message] = await db
      .insert(projectMessages)
      .values({
        projectId: data.projectId,
        senderUserId: user.id,
        senderRole: user.role === "customer" ? "customer" : "admin",
        body: data.body,
      })
      .returning();

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
