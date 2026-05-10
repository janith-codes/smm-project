import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const providers = await prisma.smmProvider.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(providers);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { name, url, apiEndpoint, apiKey, isActive } = body as {
    name: string;
    url: string;
    apiEndpoint: string;
    apiKey: string;
    isActive?: boolean;
  };

  if (!name || !url || !apiEndpoint || !apiKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const provider = await prisma.smmProvider.create({
    data: { name, url, apiEndpoint, apiKey, isActive: isActive ?? true },
  });
  return NextResponse.json(provider, { status: 201 });
}
