import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const where = {
    ...(search && { name: { contains: search } }),
    ...(categoryId && { categoryId }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, limit });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const {
    name,
    description,
    categoryId,
    providerId,
    providerServiceId,
    providerRate,
    sellingRate,
    minOrder,
    maxOrder,
    serviceType,
    isActive,
  } = body as {
    name: string;
    description?: string;
    categoryId?: string;
    providerId?: string;
    providerServiceId?: string;
    providerRate?: number;
    sellingRate?: number;
    minOrder?: number;
    maxOrder?: number;
    serviceType?: string;
    isActive?: boolean;
  };

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      name,
      description,
      categoryId: categoryId ?? null,
      providerId: providerId ?? null,
      providerServiceId,
      providerRate,
      sellingRate,
      minOrder,
      maxOrder,
      serviceType,
      isActive: isActive ?? true,
    },
    include: {
      category: { select: { id: true, name: true } },
      provider: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(product, { status: 201 });
}
