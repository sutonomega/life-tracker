import { NextResponse } from "next/server";
import { ensureDatabase } from "../../../../lib/database";
import { prisma } from "../../../../lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getId(context: RouteContext) {
  const params = await context.params;
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function DELETE(_request: Request, context: RouteContext) {
  await ensureDatabase();

  const id = await getId(context);

  if (!id) {
    return NextResponse.json({ message: "IDが正しくありません。" }, { status: 400 });
  }

  const template = await prisma.mealTemplate.findUnique({ where: { id } });

  if (!template) {
    return NextResponse.json(
      { message: "テンプレートが見つかりません。" },
      { status: 404 },
    );
  }

  await prisma.mealTemplate.delete({ where: { id } });

  return NextResponse.json({ message: "テンプレートを削除しました。" });
}
