import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const provider = await prisma.smmProvider.findUnique({ where: { id } });
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const formData = new URLSearchParams();
  formData.append("key", provider.apiKey);
  formData.append("action", "services");

  const response = await fetch(provider.apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Provider API returned ${response.status}` },
      { status: 502 }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
