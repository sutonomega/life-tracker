import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { parseJsonBody } from "../../../../lib/request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type WeightLogRequestBody = {
  date?: string;
  weightKg?: number;
  memo?: string;
};

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function getId(context: RouteContext) {
  const params = await context.params;
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: NextRequest, context: RouteContext) {

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const body = await parseJsonBody<WeightLogRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

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

  const [weightLog, existingLog] = await Promise.all([
    prisma.weightLog.findUnique({ where: { id } }),
    prisma.weightLog.findUnique({ where: { date } }),
  ]);

  if (!weightLog) {
    return NextResponse.json(
      { message: "体重記録が見つかりません。" },
      { status: 404 },
    );
  }

  if (existingLog && existingLog.id !== id) {
    return NextResponse.json(
      { message: "この日付の体重はすでに登録されています。" },
      { status: 409 },
    );
  }

  const updatedWeightLog = await prisma.weightLog.update({
    where: { id },
    data: {
      date,
      weightKg,
      memo,
    },
  });

  return NextResponse.json(updatedWeightLog);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const weightLog = await prisma.weightLog.findUnique({ where: { id } });

  if (!weightLog) {
    return NextResponse.json(
      { message: "体重記録が見つかりません。" },
      { status: 404 },
    );
  }

  await prisma.weightLog.delete({ where: { id } });

  return NextResponse.json({ message: "体重記録を削除しました。" });
}
