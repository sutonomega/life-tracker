-- CreateTable
CREATE TABLE "schedule_templates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "schedule_template_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "memo" TEXT,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedule_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "schedule_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "schedule_template_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "schedule_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "schedule_template_items_templateId_idx" ON "schedule_template_items"("templateId");
