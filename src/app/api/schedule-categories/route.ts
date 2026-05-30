import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const defaultCategories = [
  { name: "生活", color: "#10b981" },
  { name: "運動", color: "#0ea5e9" },
  { name: "食事", color: "#f59e0b" },
  { name: "仕事", color: "#6366f1" },
  { name: "趣味", color: "#ec4899" },
];

export async function GET() {
  const categories = await prisma.scheduleCategory.findMany({
    orderBy: { id: "asc" },
  });
  const existingCategoryNames = new Set(
    categories.map((category) => category.name),
  );
  const missingCategories = defaultCategories.filter(
    (category) => !existingCategoryNames.has(category.name),
  );

  if (missingCategories.length > 0) {
    await prisma.scheduleCategory.createMany({
      data: missingCategories,
    });
  }

  const latestCategories = await prisma.scheduleCategory.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(latestCategories);
}
