-- CreateTable
CREATE TABLE "UserSubtopicProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subtopicId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'not_started',
    "confidence" INTEGER,
    "notes" TEXT,
    "isBookmarked" BOOLEAN NOT NULL DEFAULT false,
    "flaggedRevision" BOOLEAN NOT NULL DEFAULT false,
    "difficulty" "DifficultyLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubtopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubtopicProgress_userId_subtopicId_key" ON "UserSubtopicProgress"("userId", "subtopicId");

-- CreateIndex
CREATE INDEX "UserSubtopicProgress_userId_idx" ON "UserSubtopicProgress"("userId");

-- CreateIndex
CREATE INDEX "UserSubtopicProgress_subtopicId_idx" ON "UserSubtopicProgress"("subtopicId");

-- AddForeignKey
ALTER TABLE "UserSubtopicProgress" ADD CONSTRAINT "UserSubtopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubtopicProgress" ADD CONSTRAINT "UserSubtopicProgress_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
