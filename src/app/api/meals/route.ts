import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { parseJsonBody } from "../../../lib/request";

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

export async function GET(request: NextRequest) {

  const date = request.nextUrl.searchParams.get("date")?.trim();

  if (date && !isValidDate(date)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  const meals = await prisma.meal.findMany({
    where: date ? { date } : undefined,
    orderBy: [{ date: "desc" }, { id: "asc" }],
  });

  return NextResponse.json(meals);
}

export async function POST(request: NextRequest) {

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

  const meal = await prisma.meal.create({
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

  return NextResponse.json(meal, { status: 201 });
}
