import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ensureDatabase } from "../../../lib/database";
import { prisma } from "../../../lib/prisma";
import { parseJsonBody } from "../../../lib/request";
import { isValidDate } from "../../../lib/validation";

type ScheduleTemplateRequestBody = {
  name?: string;
  sourceDate?: string;
};

const templateInclude = {
  items: {
    include: { category: true },
    orderBy: [{ startTime: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.ScheduleTemplateInclude;

export async function GET() {
  await ensureDatabase();

  const templates = await prisma.scheduleTemplate.findMany({
    include: templateInclude,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  await ensureDatabase();

  const body = await parseJsonBody<ScheduleTemplateRequestBody>(request);

  if (!body) {
    return NextResponse.json(
      { message: "リクエスト本文が正しくありません。" },
      { status: 400 },
    );
  }

  const name = body.name?.trim() ?? "";
  const sourceDate = body.sourceDate?.trim() ?? "";

  if (!name || !isValidDate(sourceDate)) {
    return NextResponse.json(
      { message: "テンプレート名とコピー元日付を入力してください。" },
      { status: 400 },
    );
  }

  const schedules = await prisma.schedule.findMany({
    where: { date: sourceDate },
    orderBy: [{ startTime: "asc" }, { id: "asc" }],
  });

  if (schedules.length === 0) {
    return NextResponse.json(
      { message: "テンプレート化するスケジュールがありません。" },
      { status: 404 },
    );
  }

  const template = await prisma.scheduleTemplate.create({
    data: {
      name,
      items: {
        create: schedules.map((schedule) => ({
          title: schedule.title,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          memo: schedule.memo,
          categoryId: schedule.categoryId,
        })),
      },
    },
    include: templateInclude,
  });

  return NextResponse.json(template, { status: 201 });
}
