-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Day" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datetime" DATETIME NOT NULL,
    "healthScore" TEXT NOT NULL DEFAULT '',
    "healthSummary" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Day" ("datetime", "id") SELECT "datetime", "id" FROM "Day";
DROP TABLE "Day";
ALTER TABLE "new_Day" RENAME TO "Day";
CREATE UNIQUE INDEX "Day_datetime_key" ON "Day"("datetime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
