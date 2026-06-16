import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { parseJsonBody } from "../../../../lib/request";
import { isValidDate } from "../../../../lib/validation";

type CopyMealsRequestBody = {
  sourceDate?: string;
  targetDate?: string;
  targetMealType?: string;
  mealIds?: number[];
};

const mealTypes = new Set(["breakfast", "lunch", "dinner", "snack"]);

function isValidMealIds(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((id) => Number.isInteger(id) && id > 0)
  );
}

export async function POST(request: NextRequest) {

  const body = await parseJsonBody<CopyMealsRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const sourceDate = body.sourceDate?.trim() ?? "";
  const targetDate = body.targetDate?.trim() ?? "";
  const targetMealType = body.targetMealType?.trim() ?? "";

  if (!isValidDate(sourceDate) || !isValidDate(targetDate)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (!mealTypes.has(targetMealType)) {
    return NextResponse.json(
      { message: "コピー先の食事区分が正しくありません。" },
      { status: 400 },
    );
  }

  if (!isValidMealIds(body.mealIds)) {
    return NextResponse.json(
      { message: "コピーする食品を選択してください。" },
      { status: 400 },
    );
  }

  const sourceMeals = await prisma.meal.findMany({
    where: {
      date: sourceDate,
      id: { in: body.mealIds },
    },
    orderBy: { id: "asc" },
  });

  if (sourceMeals.length === 0) {
    return NextResponse.json(
      { message: "コピー対象の食事記録がありません。" },
      { status: 404 },
    );
  }

  if (sourceMeals.length !== body.mealIds.length) {
    return NextResponse.json(
      { message: "コピー対象にコピー元日付以外の食事が含まれています。" },
      { status: 400 },
    );
  }

  const createdMeals = await prisma.$transaction(
    sourceMeals.map((meal) =>
      prisma.meal.create({
        data: {
          date: targetDate,
          mealType: targetMealType,
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
