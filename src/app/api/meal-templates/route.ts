import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma";
import { parseJsonBody } from "../../../lib/request";

type MealTemplateRequestBody = {
  name?: string;
  foodName?: string;
  calories?: number;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
  memo?: string;
};

function isValidNonNegativeNumber(value: number) {
  return Number.isFinite(value) && value >= 0;
}

function isMealTypeSchemaMismatch(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  return (
    (error.code === "P2011" || error.code === "P2022") &&
    String(error.message).includes("mealType")
  );
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
  const foodName = body.foodName?.trim() ?? "";
  const calories = Number(body.calories);
  const proteinG = Number(body.proteinG);
  const fatG = Number(body.fatG);
  const carbsG = Number(body.carbsG);
  const memo = body.memo?.trim() || null;

  if (!name || !foodName) {
    return NextResponse.json(
      { message: "テンプレート名、食品名を入力してください。" },
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

  try {
    const template = await prisma.mealTemplate.create({
      data: {
        name,
        foodName,
        calories,
        proteinG,
        fatG,
        carbsG,
        memo,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (isMealTypeSchemaMismatch(error)) {
      return NextResponse.json(
        {
          message:
            "本番DBの食事テンプレートスキーマが古い可能性があります。Prisma migrationを適用してください。",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "テンプレートの保存に失敗しました。" },
      { status: 500 },
    );
  }
}
