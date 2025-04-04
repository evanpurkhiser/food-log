-- CreateTable
CREATE TABLE "Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateRecorded" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cusine_type" JSONB NOT NULL,
    "food_type" JSONB NOT NULL,
    "notes" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Meal_dateRecorded_key" ON "Meal"("dateRecorded");
