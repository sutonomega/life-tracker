import { NextRequest, NextResponse } from "next/server";
import { ensureDatabase } from "../../../../../lib/database";
import { prisma } from "../../../../../lib/prisma";
import { parseJsonBody } from "../../../../../lib/request";
import { isValidDate } from "../../../../../lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ApplyTemplateRequestBody = {
  date?: string;
};

async function getId(context: RouteContext) {
  const params = await context.params;
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function POST(request: NextRequest, context: RouteContext) {
  await ensureDatabase();

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const body = await parseJsonBody<ApplyTemplateRequestBody>(request);
  const date = body?.date?.trim() ?? "";

  if (!isValidDate(date)) {
    return NextResponse.json(
      { message: "日付の形式が正しくありません。" },
      { status: 400 },
    );
  }

  const template = await prisma.scheduleTemplate.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ startTime: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!template) {
    return NextResponse.json(
      { message: "テンプレートが見つかりません。" },
      { status: 404 },
    );
  }

  if (template.items.length === 0) {
    return NextResponse.json(
      { message: "テンプレートに予定がありません。" },
      { status: 400 },
    );
  }

  const schedules = await prisma.$transaction(
    template.items.map((item) =>
      prisma.schedule.create({
        data: {
          date,
          title: item.title,
          startTime: item.startTime,
          endTime: item.endTime,
          memo: item.memo,
          categoryId: item.categoryId,
        },
        include: { category: true },
      }),
    ),
  );

  return NextResponse.json({ count: schedules.length, schedules });
}
