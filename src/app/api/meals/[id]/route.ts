import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "../../../../lib/database";
import { prisma } from "../../../../lib/prisma";
import { parseJsonBody } from "../../../../lib/request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MealRequestBody = {
  date?: string;
  mealType?: string;
  foodName?: string;
  calories?: number;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
  memo?: string;
};

const mealTypes = new Set(["breakfast", "lunch", "dinner", "snack"]);

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidNonNegativeNumber(value: number) {
  return Number.isFinite(value) && value >= 0;
}

async function getId(context: RouteContext) {
  const params = await context.params;
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  await ensureDatabase();

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const body = await parseJsonBody<MealRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const date = body.date?.trim() ?? "";
  const mealType = body.mealType?.trim() ?? "";
  const foodName = body.foodName?.trim() ?? "";
  const calories = Number(body.calories);
  const proteinG = Number(body.proteinG);
  const fatG = Number(body.fatG);
  const carbsG = Number(body.carbsG);
  const memo = body.memo?.trim() || null;

  if (!date || !mealType || !foodName) {
    return NextResponse.json(
      { message: "日付、食事区分、食品名を入力してください。" },
      { status: 400 },
    );
  }

  if (!isValidDate(date)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (!mealTypes.has(mealType)) {
    return NextResponse.json(
      { message: "食事区分が正しくありません。" },
      { status: 400 },
    );
  }

  if (
    !Number.isInteger(calories) ||
    calories < 0 ||
    !isValidNonNegativeNumber(proteinG) ||
    !isValidNonNegativeNumber(fatG) ||
    !isValidNonNegativeNumber(carbsG)
  ) {
    return NextResponse.json(
      { message: "カロリーとPFCは0以上の数値で入力してください。" },
      { status: 400 },
    );
  }

  const meal = await prisma.meal.findUnique({ where: { id } });

  if (!meal) {
    return NextResponse.json(
      { message: "食事記録が見つかりません。" },
      { status: 404 },
    );
  }

  const updatedMeal = await prisma.meal.update({
    where: { id },
    data: {
      date,
      mealType,
      foodName,
      calories,
      proteinG,
      fatG,
      carbsG,
      memo,
    },
  });

  return NextResponse.json(updatedMeal);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  await ensureDatabase();

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const meal = await prisma.meal.findUnique({ where: { id } });

  if (!meal) {
    return NextResponse.json(
      { message: "食事記録が見つかりません。" },
      { status: 404 },
    );
  }

  await prisma.meal.delete({ where: { id } });

  return NextResponse.json({ message: "食事記録を削除しました。" });
}
