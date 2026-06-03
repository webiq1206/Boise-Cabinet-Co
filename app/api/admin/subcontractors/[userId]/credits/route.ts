import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, creditTransactions } from "@/shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSession, getUserFromDb, sanitizeUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const adminUser = await getUserFromDb(session.userId);
  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { userId } = await params;

  try {
    const targetUser = await db.select().from(users).where(eq(users.id, userId));
    if (!targetUser[0] || targetUser[0].role !== "subcontractor") {
      return NextResponse.json({ error: "Subcontractor not found" }, { status: 404 });
    }

    const transactions = await db.select().from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching credit history:", error);
    return NextResponse.json({ error: "Failed to fetch credit history" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const adminUser = await getUserFromDb(session.userId);
  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { userId } = await params;
  const body = await request.json();
  const { amount, description } = body;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }

  if (amount > 10000) {
    return NextResponse.json({ error: "Maximum credit amount is $10,000" }, { status: 400 });
  }

  const userResults = await db.select().from(users).where(eq(users.id, userId));
  const targetUser = userResults[0];

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.role !== "subcontractor") {
    return NextResponse.json({ error: "Credits can only be added to subcontractor accounts" }, { status: 400 });
  }

  if (targetUser.isActive === false) {
    return NextResponse.json({ error: "Cannot add credits to an inactive account" }, { status: 400 });
  }

  try {
    const [updatedUser] = await db.update(users).set({
      creditBalance: sql`CAST(${users.creditBalance} AS DECIMAL(10,2)) + ${String(amount)}`,
      updatedAt: new Date(),
    }).where(eq(users.id, userId)).returning();

    const newBalance = updatedUser.creditBalance || "0";

    let transaction;
    try {
      [transaction] = await db.insert(creditTransactions).values({
        userId,
        amount: String(amount),
        type: "admin_credit",
        description: description || null,
        adminId: session.userId,
        balanceAfter: newBalance,
      }).returning();
    } catch (auditError) {
      await db.update(users).set({
        creditBalance: sql`CAST(${users.creditBalance} AS DECIMAL(10,2)) - ${String(amount)}`,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
      console.error("Failed to record credit transaction:", auditError);
      return NextResponse.json({ error: "Failed to record credit transaction" }, { status: 500 });
    }

    return NextResponse.json({ user: sanitizeUser(updatedUser), transaction });
  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
  }
}
