-- CreateTable
CREATE TABLE "schedule_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_template_items" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "memo" TEXT,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_template_items_templateId_idx" ON "schedule_template_items"("templateId");

-- AddForeignKey
ALTER TABLE "schedule_template_items" ADD CONSTRAINT "schedule_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "schedule_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_template_items" ADD CONSTRAINT "schedule_template_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "schedule_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
