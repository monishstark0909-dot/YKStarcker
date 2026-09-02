-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studyPlanId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "subtopicId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" "PlannerItemStatus" NOT NULL DEFAULT 'planned',
    "recurrence" TEXT NOT NULL DEFAULT 'none',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevisionTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT,
    "topicId" TEXT,
    "subtopicId" TEXT,
    "wrongQuestionId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" "PlannerItemStatus" NOT NULL DEFAULT 'planned',
    "recurrence" TEXT NOT NULL DEFAULT 'none',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevisionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyPlan_userId_idx" ON "StudyPlan"("userId");

-- CreateIndex
CREATE INDEX "StudyTask_userId_date_idx" ON "StudyTask"("userId", "date");

-- CreateIndex
CREATE INDEX "StudyTask_subjectId_idx" ON "StudyTask"("subjectId");

-- CreateIndex
CREATE INDEX "StudyTask_topicId_idx" ON "StudyTask"("topicId");

-- CreateIndex
CREATE INDEX "StudyTask_subtopicId_idx" ON "StudyTask"("subtopicId");

-- CreateIndex
CREATE INDEX "RevisionTask_userId_date_idx" ON "RevisionTask"("userId", "date");

-- CreateIndex
CREATE INDEX "RevisionTask_subjectId_idx" ON "RevisionTask"("subjectId");

-- CreateIndex
CREATE INDEX "RevisionTask_topicId_idx" ON "RevisionTask"("topicId");

-- CreateIndex
CREATE INDEX "RevisionTask_subtopicId_idx" ON "RevisionTask"("subtopicId");

-- CreateIndex
CREATE INDEX "RevisionTask_wrongQuestionId_idx" ON "RevisionTask"("wrongQuestionId");

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTask" ADD CONSTRAINT "RevisionTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTask" ADD CONSTRAINT "RevisionTask_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTask" ADD CONSTRAINT "RevisionTask_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTask" ADD CONSTRAINT "RevisionTask_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RevisionTask" ADD CONSTRAINT "RevisionTask_wrongQuestionId_fkey" FOREIGN KEY ("wrongQuestionId") REFERENCES "WrongQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
