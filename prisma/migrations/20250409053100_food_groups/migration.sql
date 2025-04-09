/*
  Warnings:

  - Added the required column `foodGroups` to the `Meal` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateRecorded" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "foodGroups" JSONB NOT NULL,
    "cusineType" JSONB NOT NULL,
    "foodType" JSONB NOT NULL,
    "notes" TEXT NOT NULL,
    "dayId" INTEGER NOT NULL,
    CONSTRAINT "Meal_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meal" ("category", "cusineType", "dateRecorded", "dayId", "foodType", "id", "name", "notes") SELECT "category", "cusineType", "dateRecorded", "dayId", "foodType", "id", "name", "notes" FROM "Meal";
DROP TABLE "Meal";
ALTER TABLE "new_Meal" RENAME TO "Meal";
CREATE UNIQUE INDEX "Meal_dateRecorded_key" ON "Meal"("dateRecorded");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
