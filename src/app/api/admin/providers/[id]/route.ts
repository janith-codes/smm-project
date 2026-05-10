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
  if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(provider);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { name, url, apiEndpoint, apiKey, isActive } = body as {
    name?: string;
    url?: string;
    apiEndpoint?: string;
    apiKey?: string;
    isActive?: boolean;
  };

  const provider = await prisma.smmProvider.update({
    where: { id },
    data: { name, url, apiEndpoint, apiKey, isActive },
  });
  return NextResponse.json(provider);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.smmProvider.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
