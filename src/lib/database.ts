import { prisma } from "./prisma";

let ensureDatabasePromise: Promise<void> | null = null;

export function ensureDatabase() {
  ensureDatabasePromise ??= createMissingTables();
  return ensureDatabasePromise;
}

async function createMissingTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "weight_logs" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "date" TEXT NOT NULL,
      "weightKg" REAL NOT NULL,
      "memo" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "weight_logs_date_key"
    ON "weight_logs"("date");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "schedule_categories" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "color" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "schedules" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "date" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "startTime" TEXT NOT NULL,
      "endTime" TEXT NOT NULL,
      "memo" TEXT,
      "categoryId" INTEGER NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL,
      CONSTRAINT "schedules_categoryId_fkey"
        FOREIGN KEY ("categoryId")
        REFERENCES "schedule_categories" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "schedules_date_idx"
    ON "schedules"("date");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "meals" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "date" TEXT NOT NULL,
      "mealType" TEXT NOT NULL,
      "foodName" TEXT NOT NULL,
      "calories" INTEGER NOT NULL,
      "proteinG" REAL NOT NULL,
      "fatG" REAL NOT NULL,
      "carbsG" REAL NOT NULL,
      "memo" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "meals_date_idx"
    ON "meals"("date");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "nutrition_goals" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "calories" INTEGER NOT NULL,
      "proteinG" REAL NOT NULL,
      "fatG" REAL NOT NULL,
      "carbsG" REAL NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    );
  `);
}
