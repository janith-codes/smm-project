import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";

interface ImportServiceItem {
  service: number | string;
  name: string;
  type?: string;
  category?: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  categoryId?: string;
  sellingRate?: number;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { providerId, services } = body as {
    providerId: string;
    services: ImportServiceItem[];
  };

  if (!providerId || !services?.length) {
    return NextResponse.json({ error: "Missing providerId or services" }, { status: 400 });
  }

  const provider = await prisma.smmProvider.findUnique({ where: { id: providerId } });
  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const created = await prisma.$transaction(
    services.map((svc) =>
      prisma.product.create({
        data: {
          name: svc.name,
          description: svc.type ?? null,
          categoryId: svc.categoryId ?? null,
          providerId,
          providerServiceId: String(svc.service),
          providerRate: parseFloat(String(svc.rate)),
          sellingRate: svc.sellingRate ?? parseFloat(String(svc.rate)),
          minOrder: parseInt(String(svc.min)),
          maxOrder: parseInt(String(svc.max)),
          serviceType: svc.type ?? null,
          isActive: true,
        },
      })
    )
  );

  return NextResponse.json({ imported: created.length, products: created }, { status: 201 });
}
