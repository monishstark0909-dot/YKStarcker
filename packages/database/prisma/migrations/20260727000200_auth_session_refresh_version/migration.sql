-- @format

ALTER TABLE "AuthSession"
ADD COLUMN "refreshTokenVersion" INTEGER NOT NULL DEFAULT 0;
