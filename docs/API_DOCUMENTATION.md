<!-- @format -->

# API_DOCUMENTATION

## Status

The API foundation is implemented for health, auth, current-user lookups, and password reset. Auth now sets HTTP-only cookies, rotates refresh tokens with remember-me-aware lifetimes, and reads the current user from live session state. Password reset requests persist hashed tokens and return a local preview link outside production so the flow can be verified without external mail infrastructure. The health endpoint now also reports database status, and startup fails fast if the database is unavailable. Additional product domains are still documented as planned routes so the roadmap stays aligned with the intended SaaS shape.

## GET /api/health

- Description: Returns API health and uptime status.
- Authentication Required: No
- Response: `{ status, timestamp, service, database: { ok, message } }`
- Possible Errors: `500 Internal Server Error`

## POST /api/auth/register

- Description: Registers a new account with email and password.
- Authentication Required: No
- Request Body: `{ email, password, displayName, username }`
- Response: `{ user, profile }` and HTTP-only access/refresh cookies
- Possible Errors: `400 Bad Request`, `409 Conflict`

## POST /api/auth/login

- Description: Authenticates an existing user.
- Authentication Required: No
- Request Body: `{ email, password, rememberMe }`
- Response: `{ user, profile }` and HTTP-only access/refresh cookies
- Possible Errors: `400 Bad Request`, `401 Unauthorized`

## POST /api/auth/refresh

- Description: Exchanges a refresh token for a new access token.
- Authentication Required: Refresh token
- Request Body: None; refresh token is read from the cookie
- Response: `{ user, profile }` and rotated HTTP-only cookies
- Possible Errors: `401 Unauthorized`

## POST /api/auth/logout

- Description: Invalidates the current session.
- Authentication Required: Yes
- Response: `{ success: true }`
- Possible Errors: `401 Unauthorized`

## POST /api/auth/password-reset/request

- Description: Creates a password reset token for the account with the requested email.
- Authentication Required: No
- Request Body: `{ email }`
- Response: `{ success: true, previewLink }` where `previewLink` is returned outside production for local verification.
- Possible Errors: `400 Bad Request`

## POST /api/auth/password-reset/confirm

- Description: Applies a reset token and updates the user password.
- Authentication Required: No
- Request Body: `{ token, password }`
- Response: `{ success: true }`
- Possible Errors: `400 Bad Request`, `401 Unauthorized`

## GET /api/auth/me

- Description: Returns the current authenticated user profile.
- Authentication Required: Yes
- Response: `{ user, profile }`
- Possible Errors: `401 Unauthorized`

## GET /api/users/me

- Description: Returns the current authenticated user using the auth session cookie.
- Authentication Required: Yes
- Response: `{ user, profile }`
- Possible Errors: `401 Unauthorized`

## Planned Auth Endpoints

- `POST /api/auth/email-verification/request` - sends a verification email for unverified accounts.
- `POST /api/auth/email-verification/confirm` - marks an account as verified after token validation.
- `GET /api/auth/google` / `GET /api/auth/google/callback` - Google OAuth start and callback routes.
- `GET /api/auth/apple` / `GET /api/auth/apple/callback` - Apple Sign-In start and callback routes.

## GET /api/onboarding

- Description: Returns onboarding state for the signed-in user.
- Authentication Required: Yes
- Response: `{ completed, profile }`
- Possible Errors: `401 Unauthorized`

## PUT /api/onboarding

- Description: Saves onboarding answers.
- Authentication Required: Yes
- Request Body: `{ examType, studyTrack, targetUniversity, targetDepartment, targetRanking, dailyStudyGoal, dailyQuestionGoal }`
- Response: `{ profile }`
- Possible Errors: `400 Bad Request`, `401 Unauthorized`

## GET /api/dashboard

- Description: Returns dashboard summary data.
- Authentication Required: Yes
- Response: `{ streak, goals, activity, insights }`
- Possible Errors: `401 Unauthorized`

## GET /api/subjects

- Description: Returns the syllabus hierarchy.
- Authentication Required: Yes
- Response: `{ exams, subjects, topics, subtopics }`
- Possible Errors: `401 Unauthorized`

## POST /api/study-sessions

- Description: Creates a study session log.
- Authentication Required: Yes
- Request Body: `{ subjectId, topicId, subtopicId, durationMinutes, notes }`
- Response: `{ studySession }`
- Possible Errors: `400 Bad Request`, `401 Unauthorized`

## POST /api/question-logs

- Description: Logs solved questions.
- Authentication Required: Yes
- Request Body: `{ subjectId, topicId, subtopicId, questionsSolved, correct, wrong, difficulty, notes }`
- Response: `{ questionLog }`
- Possible Errors: `400 Bad Request`, `401 Unauthorized`

## POST /api/wrong-questions

- Description: Saves a wrong-question review item.
- Authentication Required: Yes
- Request Body: `{ subjectId, topicId, subtopicId, reason, difficulty, imageUrl, reviewDate }`
- Response: `{ wrongQuestion }`
- Possible Errors: `400 Bad Request`, `401 Unauthorized`

## POST /api/mock-exams

- Description: Records a mock exam result.
- Authentication Required: Yes
- Request Body: `{ examType, name, takenAt, results }`
- Response: `{ mockExam }`
- Possible Errors: `400 Bad Request`, `401 Unauthorized`

## GET /api/analytics/summary

- Description: Returns aggregated study analytics.
- Authentication Required: Yes
- Response: `{ daily, weekly, monthly, trends }`
- Possible Errors: `401 Unauthorized`

## GET /api/social/friends

- Description: Returns the friend list and pending requests.
- Authentication Required: Yes
- Response: `{ friends, requests }`
- Possible Errors: `401 Unauthorized`

## POST /api/integrations/spotify/connect

- Description: Starts Spotify OAuth linking.
- Authentication Required: Yes
- Response: `{ authorizationUrl }`
- Possible Errors: `401 Unauthorized`

## GET /api/ai/insights

- Description: Returns generated study insights.
- Authentication Required: Yes
- Response: `{ insights }`
- Possible Errors: `401 Unauthorized`
