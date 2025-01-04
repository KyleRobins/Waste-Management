import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        wasteRecords: true,
        products: true,
      },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        location: data.location,
        status: data.status,
        joinDate: new Date(),
        userId: data.userId,
      },
      include: {
        wasteRecords: true,
        products: true,
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}