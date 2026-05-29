import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "../../../lib/database";
import { prisma } from "../../../lib/prisma";
import { parseJsonBody } from "../../../lib/request";

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

export async function GET(request: NextRequest) {
  await ensureDatabase();

  const date = request.nextUrl.searchParams.get("date")?.trim();

  if (date && !isValidDate(date)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  const schedules = await prisma.schedule.findMany({
    where: date ? { date } : undefined,
    include: { category: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(schedules);
}

export async function POST(request: NextRequest) {
  await ensureDatabase();

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
  const categoryId = body.categoryId;

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

  const category = await prisma.scheduleCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return NextResponse.json(
      { message: "カテゴリが見つかりません。" },
      { status: 400 },
    );
  }

  const schedule = await prisma.schedule.create({
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

  return NextResponse.json(schedule, { status: 201 });
}
