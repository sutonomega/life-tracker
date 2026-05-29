import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ensureDatabase } from "../../../../lib/database";
import { prisma } from "../../../../lib/prisma";
import { parseJsonBody } from "../../../../lib/request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ScheduleTemplateRequestBody = {
  name?: string;
};

const templateInclude = {
  items: {
    include: { category: true },
    orderBy: [{ startTime: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.ScheduleTemplateInclude;

async function getId(context: RouteContext) {
  const params = await context.params;
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  await ensureDatabase();

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const body = await parseJsonBody<ScheduleTemplateRequestBody>(request);
  const name = body?.name?.trim() ?? "";

  if (!name) {
    return NextResponse.json(
      { message: "テンプレート名を入力してください。" },
      { status: 400 },
    );
  }

  const template = await prisma.scheduleTemplate.findUnique({ where: { id } });

  if (!template) {
    return NextResponse.json(
      { message: "テンプレートが見つかりません。" },
      { status: 404 },
    );
  }

  const updatedTemplate = await prisma.scheduleTemplate.update({
    where: { id },
    data: { name },
    include: templateInclude,
  });

  return NextResponse.json(updatedTemplate);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  await ensureDatabase();

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const template = await prisma.scheduleTemplate.findUnique({ where: { id } });

  if (!template) {
    return NextResponse.json(
      { message: "テンプレートが見つかりません。" },
      { status: 404 },
    );
  }

  await prisma.scheduleTemplate.delete({ where: { id } });

  return NextResponse.json({ message: "テンプレートを削除しました。" });
}
