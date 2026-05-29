import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { parseJsonBody } from "../../../lib/request";

type MealTemplateRequestBody = {
  name?: string;
  mealType?: string;
  foodName?: string;
  calories?: number;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
  memo?: string;
};

const mealTypes = new Set(["breakfast", "lunch", "dinner", "snack"]);

function isValidNonNegativeNumber(value: number) {
  return Number.isFinite(value) && value >= 0;
}

export async function GET() {

  const templates = await prisma.mealTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {

  const body = await parseJsonBody<MealTemplateRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const mealType = body.mealType?.trim() ?? "";
  const foodName = body.foodName?.trim() ?? "";
  const calories = Number(body.calories);
  const proteinG = Number(body.proteinG);
  const fatG = Number(body.fatG);
  const carbsG = Number(body.carbsG);
  const memo = body.memo?.trim() || null;

  if (!name || !mealType || !foodName) {
    return NextResponse.json(
      { message: "テンプレート名、食事区分、食品名を入力してください。" },
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

  const template = await prisma.mealTemplate.create({
    data: {
      name,
      mealType,
      foodName,
      calories,
      proteinG,
      fatG,
      carbsG,
      memo,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
