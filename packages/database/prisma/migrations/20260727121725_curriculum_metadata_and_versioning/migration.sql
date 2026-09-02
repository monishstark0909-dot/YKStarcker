/*
  Warnings:

  - Added the required column `slug` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Subtopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "color" TEXT,
ADD COLUMN     "curriculumVersionId" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subtopic" ADD COLUMN     "curriculumVersionId" TEXT,
ADD COLUMN     "estimatedQuestionWeight" DECIMAL(65,30),
ADD COLUMN     "importance" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "curriculumVersionId" TEXT,
ADD COLUMN     "estimatedHours" INTEGER,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CurriculumVersion" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumVersion_year_key" ON "CurriculumVersion"("year");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "CurriculumVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "CurriculumVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_curriculumVersionId_fkey" FOREIGN KEY ("curriculumVersionId") REFERENCES "CurriculumVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_slug_key" ON "Subject"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subtopic_slug_key" ON "Subtopic"("slug");
