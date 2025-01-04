import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const records = await prisma.wasteRecord.findMany({
      include: {
        supplier: true,
        user: true,
      },
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch waste records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const record = await prisma.wasteRecord.create({
      data: {
        date: new Date(data.date),
        type: data.type,
        quantity: data.quantity,
        location: data.location,
        status: data.status,
        supplierId: data.supplierId,
        userId: data.userId,
      },
      include: {
        supplier: true,
        user: true,
      },
    });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create waste record" },
      { status: 500 }
    );
  }
}