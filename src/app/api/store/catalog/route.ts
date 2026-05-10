import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      sellingRate: true,
      minOrder: true,
      maxOrder: true,
      serviceType: true,
      providerServiceId: true,
      category: {
        select: {
          id: true,
          name: true,
          parent: { select: { id: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json({ products });
}
