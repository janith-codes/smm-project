import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      categoryId: body.categoryId ?? null,
      providerId: body.providerId ?? null,
      providerServiceId: body.providerServiceId,
      providerRate: body.providerRate,
      sellingRate: body.sellingRate,
      minOrder: body.minOrder,
      maxOrder: body.maxOrder,
      serviceType: body.serviceType,
      isActive: body.isActive,
    },
    include: {
      category: { select: { id: true, name: true } },
      provider: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
