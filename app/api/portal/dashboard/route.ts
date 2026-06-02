import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPortalDashboard } from "@/server/services/portalService";

export async function GET() {
  const user = await getCurrentUser();
  const data = await getPortalDashboard(user?.role === "customer" ? user.id : null);
  return NextResponse.json(data);
}
