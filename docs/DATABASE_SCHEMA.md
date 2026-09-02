<!-- @format -->

# DATABASE_SCHEMA

The initial schema is defined in [packages/database/prisma/schema.prisma](../packages/database/prisma/schema.prisma). The table notes below describe the current domain model used to shape the first implementation milestones. The schema is now backed by an initial migration and seeded with official syllabus data plus a demo development profile.

## users

- Purpose: Core account identity for each student.
- Primary Key: `id`
- Columns:
  - `id` UUID
  - `email` string unique
  - `passwordHash` string nullable
  - `displayName` string
  - `username` string unique
  - `avatarUrl` string nullable
  - `role` enum
  - `emailVerifiedAt` datetime nullable
  - `createdAt` datetime
  - `updatedAt` datetime
- Relationships:
  - One-to-one `profile`
  - One-to-many `authSessions`, `oauthAccounts`, `passwordResetTokens`, `emailVerificationTokens`
  - One-to-many `studySessions`, `questionLogs`, `wrongQuestions`, `mockExams`, `plannerItems`, `aiInsights`
  - Many-to-many `friends`
- Indexes:
  - Unique `email`
  - Unique `username`

## profiles

- Purpose: Onboarding and personalization data.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID unique
  - `examType` enum
  - `studyTrack` string
  - `targetUniversity` string nullable
  - `targetDepartment` string nullable
  - `targetRanking` integer nullable
  - `dailyStudyGoalMinutes` integer
  - `dailyQuestionGoal` integer
  - `timezone` string
  - `locale` string
  - `createdAt` datetime
  - `updatedAt` datetime
- Relationships:
  - Belongs to `users`

## subjects

- Purpose: Top-level syllabus grouping.
- Primary Key: `id`
- Columns:
  - `id` UUID
  - `examType` enum
  - `code` string
  - `name` string
  - `sortOrder` integer
  - `createdAt` datetime
  - `updatedAt` datetime
- Relationships:
  - One-to-many `topics`

## topics

- Purpose: Topic grouping under a subject.
- Primary Key: `id`
- Foreign Keys:
  - `subjectId` -> `subjects.id`
- Columns:
  - `id` UUID
  - `subjectId` UUID
  - `name` string
  - `sortOrder` integer
  - `createdAt` datetime
  - `updatedAt` datetime
- Relationships:
  - One-to-many `subtopics`

## subtopics

- Purpose: Trackable unit of syllabus progress.
- Primary Key: `id`
- Foreign Keys:
  - `topicId` -> `topics.id`
- Columns:
  - `id` UUID
  - `topicId` UUID
  - `name` string
  - `status` enum
  - `sortOrder` integer
  - `createdAt` datetime
  - `updatedAt` datetime
- Relationships:
  - One-to-many `studySessions`
  - One-to-many `questionLogs`

## study_sessions

- Purpose: Manual study time logging.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
  - `subjectId` -> `subjects.id`
  - `topicId` -> `topics.id`
  - `subtopicId` -> `subtopics.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `subjectId` UUID nullable
  - `topicId` UUID nullable
  - `subtopicId` UUID nullable
  - `durationMinutes` integer
  - `notes` text nullable
  - `startedAt` datetime nullable
  - `endedAt` datetime nullable
  - `createdAt` datetime
  - `updatedAt` datetime
- Indexes:
  - Composite on `userId`, `createdAt`
  - Composite on `subjectId`, `createdAt`
  - Composite on `topicId`, `createdAt`
  - Composite on `subtopicId`, `createdAt`

## question_logs

- Purpose: Track solved questions and accuracy.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
  - `subjectId` -> `subjects.id`
  - `topicId` -> `topics.id`
  - `subtopicId` -> `subtopics.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `subjectId` UUID nullable
  - `topicId` UUID nullable
  - `subtopicId` UUID nullable
  - `questionsSolved` integer
  - `correct` integer
  - `wrong` integer
  - `difficulty` enum nullable
  - `notes` text nullable
  - `createdAt` datetime
  - `updatedAt` datetime
- Indexes:
  - Composite on `userId`, `createdAt`
  - Composite on `subjectId`, `createdAt`
  - Composite on `topicId`, `createdAt`
  - Composite on `subtopicId`, `createdAt`

## wrong_questions

- Purpose: Review queue for mistakes.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
  - `subjectId` -> `subjects.id`
  - `topicId` -> `topics.id`
  - `subtopicId` -> `subtopics.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `subjectId` UUID nullable
  - `topicId` UUID nullable
  - `subtopicId` UUID nullable
  - `reason` string
  - `difficulty` enum nullable
  - `imageUrl` string nullable
  - `reviewDate` datetime nullable
  - `status` enum
  - `createdAt` datetime
  - `updatedAt` datetime
- Indexes:
  - Composite on `userId`, `status`
  - Composite on `subjectId`, `status`
  - Composite on `topicId`, `status`
  - Composite on `subtopicId`, `status`

## mock_exams

- Purpose: Store TYT and AYT mock exam attempts.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `examType` enum
  - `name` string
  - `takenAt` datetime
  - `overallCorrect` integer
  - `overallWrong` integer
  - `overallBlank` integer
  - `overallNet` decimal
  - `createdAt` datetime
  - `updatedAt` datetime
- Relationships:
  - One-to-many `mock_exam_subject_results`

## mock_exam_subject_results

- Purpose: Per-subject breakdown for mock exams.
- Primary Key: `id`
- Foreign Keys:
  - `mockExamId` -> `mock_exams.id`
  - `subjectId` -> `subjects.id`
- Columns:
  - `id` UUID
  - `mockExamId` UUID
  - `subjectId` UUID
  - `correct` integer
  - `wrong` integer
  - `blank` integer
  - `net` decimal
- Indexes:
  - Index on `mockExamId`
  - Index on `subjectId`

## planner_items

- Purpose: Plans, goals, revision sessions, and mock exam scheduling.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `title` string
  - `description` text nullable
  - `type` enum
  - `status` enum
  - `scheduledFor` datetime nullable
  - `createdAt` datetime
  - `updatedAt` datetime

## friendships

- Purpose: Bidirectional friend relationships.
- Primary Key: `id`
- Foreign Keys:
  - `requesterId` -> `users.id`
  - `addresseeId` -> `users.id`
- Columns:
  - `id` UUID
  - `requesterId` UUID
  - `addresseeId` UUID
  - `status` enum
  - `createdAt` datetime
  - `updatedAt` datetime
- Indexes:
  - Unique composite on `requesterId`, `addresseeId`
  - Composite on `requesterId`, `status`
  - Composite on `addresseeId`, `status`

## spotify_connections

- Purpose: OAuth state for Spotify integration.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID unique
  - `spotifyUserId` string unique
  - `accessToken` string encrypted
  - `refreshToken` string encrypted
  - `expiresAt` datetime
  - `createdAt` datetime
  - `updatedAt` datetime

## ai_insights

- Purpose: Stored AI-generated summaries and coaching notes.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `type` enum
  - `title` string
  - `content` text
  - `generatedAt` datetime
  - `createdAt` datetime
  - `updatedAt` datetime

## auth_sessions

- Purpose: Persist active login sessions with refresh-token digests and rotation state.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `refreshTokenHash` string
  - `userAgent` string nullable
  - `ipAddress` string nullable
  - `status` enum
  - `rememberMe` boolean
  - `refreshTokenVersion` integer
  - `expiresAt` datetime
  - `lastUsedAt` datetime nullable
  - `revokedAt` datetime nullable
  - `createdAt` datetime
  - `updatedAt` datetime
- Indexes:
  - Composite on `userId`, `status`
  - Index on `expiresAt`
- Notes:
  - `refreshTokenHash` stores a SHA-256 digest of the JWT refresh token.
  - `rememberMe` preserves the intended session lifetime across refresh rotations.
  - `refreshTokenVersion` increments with each refresh so old tokens fail deterministically.

## oauth_accounts

- Purpose: Store Google and Apple identity links.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `provider` enum
  - `providerAccountId` string
  - `accessToken` string nullable
  - `refreshToken` string nullable
  - `expiresAt` datetime nullable
  - `createdAt` datetime
  - `updatedAt` datetime
- Indexes:
  - Unique composite on `provider`, `providerAccountId`

## password_reset_tokens

- Purpose: Track password reset requests.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `tokenHash` string
  - `purpose` enum
  - `expiresAt` datetime
  - `usedAt` datetime nullable
  - `createdAt` datetime
  - `updatedAt` datetime

## email_verification_tokens

- Purpose: Track email verification requests.
- Primary Key: `id`
- Foreign Keys:
  - `userId` -> `users.id`
- Columns:
  - `id` UUID
  - `userId` UUID
  - `tokenHash` string
  - `purpose` enum
  - `expiresAt` datetime
  - `usedAt` datetime nullable
  - `createdAt` datetime
  - `updatedAt` datetime
