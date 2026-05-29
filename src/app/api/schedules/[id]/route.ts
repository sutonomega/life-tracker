import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { parseJsonBody } from "../../../../lib/request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ScheduleRequestBody = {
  date?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  memo?: string;
  categoryId?: number;
};

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
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

  const body = await parseJsonBody<ScheduleRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const date = body.date?.trim() ?? "";
  const title = body.title?.trim() ?? "";
  const startTime = body.startTime?.trim() ?? "";
  const endTime = body.endTime?.trim() ?? "";
  const memo = body.memo?.trim() || null;
  const categoryId = Number(body.categoryId);

  if (!date || !title || !startTime || !endTime || !categoryId) {
    return NextResponse.json(
      { message: "必須項目を入力してください。" },
      { status: 400 },
    );
  }

  if (!isValidDate(date)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return NextResponse.json(
      { message: "時刻の形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (startTime >= endTime) {
    return NextResponse.json(
      { message: "終了時刻は開始時刻より後にしてください。" },
      { status: 400 },
    );
  }

  const [schedule, category] = await Promise.all([
    prisma.schedule.findUnique({ where: { id } }),
    prisma.scheduleCategory.findUnique({ where: { id: categoryId } }),
  ]);

  if (!schedule) {
    return NextResponse.json(
      { message: "スケジュールが見つかりません。" },
      { status: 404 },
    );
  }

  if (!category) {
    return NextResponse.json(
      { message: "カテゴリが見つかりません。" },
      { status: 400 },
    );
  }

  const updatedSchedule = await prisma.schedule.update({
    where: { id },
    data: {
      date,
      title,
      startTime,
      endTime,
      memo,
      categoryId,
    },
    include: { category: true },
  });

  return NextResponse.json(updatedSchedule);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const schedule = await prisma.schedule.findUnique({ where: { id } });

  if (!schedule) {
    return NextResponse.json(
      { message: "スケジュールが見つかりません。" },
      { status: 404 },
    );
  }

  await prisma.schedule.delete({ where: { id } });

  return NextResponse.json({ message: "スケジュールを削除しました。" });
}
