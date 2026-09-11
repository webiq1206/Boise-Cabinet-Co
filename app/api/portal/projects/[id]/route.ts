import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getCustomerProject,
  getProjectInvoices,
  getProjectMessages,
  getProjectOrders,
} from "@/server/services/portalService";

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  const customerId = user?.role === "customer" ? user.id : null;

  const project = await getCustomerProject(params.id, customerId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const [invoices, messages, orders] = await Promise.all([
    getProjectInvoices(params.id),
    getProjectMessages(params.id, "customer"),
    getProjectOrders(params.id),
  ]);

  return NextResponse.json({ project, invoices, messages, orders });
}
