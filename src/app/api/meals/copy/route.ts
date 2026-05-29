import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "../../../../lib/database";
import { prisma } from "../../../../lib/prisma";
import { parseJsonBody } from "../../../../lib/request";
import { isValidDate } from "../../../../lib/validation";

type CopyMealsRequestBody = {
  sourceDate?: string;
  targetDate?: string;
};

export async function POST(request: NextRequest) {
  await ensureDatabase();

  const body = await parseJsonBody<CopyMealsRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const sourceDate = body.sourceDate?.trim() ?? "";
  const targetDate = body.targetDate?.trim() ?? "";

  if (!isValidDate(sourceDate) || !isValidDate(targetDate)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (sourceDate === targetDate) {
    return NextResponse.json(
      { message: "コピー元とコピー先には別の日付を指定してください。" },
      { status: 400 },
    );
  }

  const sourceMeals = await prisma.meal.findMany({
    where: { date: sourceDate },
    orderBy: { id: "asc" },
  });

  if (sourceMeals.length === 0) {
    return NextResponse.json(
      { message: "コピー元の日付に食事記録がありません。" },
      { status: 404 },
    );
  }

  const createdMeals = await prisma.$transaction(
    sourceMeals.map((meal) =>
      prisma.meal.create({
        data: {
          date: targetDate,
          mealType: meal.mealType,
          foodName: meal.foodName,
          calories: meal.calories,
          proteinG: meal.proteinG,
          fatG: meal.fatG,
          carbsG: meal.carbsG,
          memo: meal.memo,
        },
      }),
    ),
  );

  return NextResponse.json({ count: createdMeals.length, meals: createdMeals });
}
