-- CreateTable
CREATE TABLE "Day" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datetime" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Meal" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Day_datetime_key" ON "Day"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "Meal_dateRecorded_key" ON "Meal"("dateRecorded");
