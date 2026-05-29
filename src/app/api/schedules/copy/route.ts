import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "../../../../lib/database";
import { prisma } from "../../../../lib/prisma";
import { parseJsonBody } from "../../../../lib/request";
import { isValidDate } from "../../../../lib/validation";

type CopySchedulesRequestBody = {
  sourceDate?: string;
  targetDate?: string;
};

export async function POST(request: NextRequest) {
  await ensureDatabase();

  const body = await parseJsonBody<CopySchedulesRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const sourceDate = body.sourceDate?.trim() ?? "";
  const targetDate = body.targetDate?.trim() ?? "";

  if (!isValidDate(sourceDate) || !isValidDate(targetDate)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  if (sourceDate === targetDate) {
    return NextResponse.json(
      { message: "コピー元とコピー先には別の日付を指定してください。" },
      { status: 400 },
    );
  }

  const sourceSchedules = await prisma.schedule.findMany({
    where: { date: sourceDate },
    orderBy: [{ startTime: "asc" }, { id: "asc" }],
  });

  if (sourceSchedules.length === 0) {
    return NextResponse.json(
      { message: "コピー元の日付にスケジュールがありません。" },
      { status: 404 },
    );
  }

  const createdSchedules = await prisma.$transaction(
    sourceSchedules.map((schedule) =>
      prisma.schedule.create({
        data: {
          date: targetDate,
          title: schedule.title,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          memo: schedule.memo,
          categoryId: schedule.categoryId,
        },
        include: { category: true },
      }),
    ),
  );

  return NextResponse.json({
    count: createdSchedules.length,
    schedules: createdSchedules,
  });
}
