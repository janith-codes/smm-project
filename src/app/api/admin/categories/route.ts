import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { name, parentId } = body as { name: string; parentId?: string };

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  let slug = slugify(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const category = await prisma.category.create({
    data: { name, slug, parentId: parentId ?? null },
    include: { parent: { select: { id: true, name: true } } },
  });
  return NextResponse.json(category, { status: 201 });
}
