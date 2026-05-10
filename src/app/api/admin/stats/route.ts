import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [providers, categories, products, activeProducts] = await Promise.all([
    prisma.smmProvider.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  return NextResponse.json({ providers, categories, products, activeProducts });
}
