/*
  Warnings:

  - You are about to drop the column `cusine_type` on the `Meal` table. All the data in the column will be lost.
  - You are about to drop the column `food_type` on the `Meal` table. All the data in the column will be lost.
  - You are about to alter the column `dateRecorded` on the `Meal` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - Added the required column `cusineType` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayId` to the `Meal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foodType` to the `Meal` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Day" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateRecorded" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cusineType" JSONB NOT NULL,
    "foodType" JSONB NOT NULL,
    "notes" TEXT NOT NULL,
    "dayId" INTEGER NOT NULL,
    CONSTRAINT "Meal_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meal" ("category", "dateRecorded", "id", "name", "notes") SELECT "category", "dateRecorded", "id", "name", "notes" FROM "Meal";
DROP TABLE "Meal";
ALTER TABLE "new_Meal" RENAME TO "Meal";
CREATE UNIQUE INDEX "Meal_dateRecorded_key" ON "Meal"("dateRecorded");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Day_day_key" ON "Day"("day");
