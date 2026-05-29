import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { parseJsonBody } from "../../../lib/request";

type NutritionGoalRequestBody = {
  calories?: number;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
};

const defaultGoal = {
  calories: 2000,
  proteinG: 100,
  fatG: 60,
  carbsG: 250,
};

function isPositiveNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

function isNonNegativeNumber(value: number) {
  return Number.isFinite(value) && value >= 0;
}

async function getOrCreateGoal() {
  const goal = await prisma.nutritionGoal.findFirst({
    orderBy: { id: "asc" },
  });

  if (goal) {
    return goal;
  }

  return prisma.nutritionGoal.create({
    data: defaultGoal,
  });
}

export async function GET() {
  const goal = await getOrCreateGoal();
  return NextResponse.json(goal);
}

export async function POST(request: NextRequest) {
  return saveNutritionGoal(request);
}

export async function PUT(request: NextRequest) {
  return saveNutritionGoal(request);
}

async function saveNutritionGoal(request: NextRequest) {

  const body = await parseJsonBody<NutritionGoalRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const calories = Number(body.calories);
  const proteinG = Number(body.proteinG);
  const fatG = Number(body.fatG);
  const carbsG = Number(body.carbsG);

  if (
    !Number.isInteger(calories) ||
    !isPositiveNumber(calories) ||
    !isNonNegativeNumber(proteinG) ||
    !isNonNegativeNumber(fatG) ||
    !isNonNegativeNumber(carbsG)
  ) {
    return NextResponse.json(
      { message: "カロリーは1以上、PFCは0以上の数値で入力してください。" },
      { status: 400 },
    );
  }

  const currentGoal = await getOrCreateGoal();
  const goal = await prisma.nutritionGoal.update({
    where: { id: currentGoal.id },
    data: {
      calories,
      proteinG,
      fatG,
      carbsG,
    },
  });

  return NextResponse.json(goal);
}
