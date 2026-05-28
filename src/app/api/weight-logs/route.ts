import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "../../../lib/database";
import { prisma } from "../../../lib/prisma";

type WeightLogRequestBody = {
  date?: string;
  weightKg?: number;
  memo?: string;
};

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET() {
  await ensureDatabase();

  const weightLogs = await prisma.weightLog.findMany({
    orderBy: { date: "desc" },
  });

  return NextResponse.json(weightLogs);
}

export async function POST(request: NextRequest) {
  await ensureDatabase();

  const body = (await request.json()) as WeightLogRequestBody;

  const date = body.date?.trim() ?? "";
  const weightKg = Number(body.weightKg);
  const memo = body.memo?.trim() || null;

  if (!date || !Number.isFinite(weightKg)) {
    return NextResponse.json(
      { message: "日付と体重を入力してください。" },
      { status: 400 },
    );
  }

  if (!isValidDate(date)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (weightKg <= 0 || weightKg > 300) {
    return NextResponse.json(
      { message: "体重は 0 より大きく 300 以下で入力してください。" },
      { status: 400 },
    );
  }

  const existingLog = await prisma.weightLog.findUnique({
    where: { date },
  });

  if (existingLog) {
    return NextResponse.json(
      { message: "この日付の体重はすでに登録されています。" },
      { status: 409 },
    );
  }

  const weightLog = await prisma.weightLog.create({
    data: {
      date,
      weightKg,
      memo,
    },
  });

  return NextResponse.json(weightLog, { status: 201 });
}
