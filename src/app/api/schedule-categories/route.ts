import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const defaultCategories = [
  { name: "生活", color: "#10b981" },
  { name: "運動", color: "#0ea5e9" },
  { name: "食事", color: "#f59e0b" },
  { name: "仕事", color: "#6366f1" },
];

export async function GET() {
  const count = await prisma.scheduleCategory.count();

  if (count === 0) {
    await prisma.scheduleCategory.createMany({
      data: defaultCategories,
    });
  }

  const categories = await prisma.scheduleCategory.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(categories);
}
