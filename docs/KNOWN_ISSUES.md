<!-- @format -->

# KNOWN_ISSUES

## Current Issues

- Runtime application routes outside auth still rely on placeholder data.
- Email verification, Google OAuth, and Apple Sign-In still need provider-side credentials or mail transport configuration.
- API responses for non-auth domains are still placeholders.
- Production deployment still needs real environment variables and provider credentials.

## Temporary Workarounds

- Use mock data for all UI previews until backend services are implemented.
- Use the seeded demo student for local development and smoke checks.
- Use the auth cookie flow for manual testing; clear browser cookies to simulate a signed-out state.

## Notes

- The auth/session layer is live, but the broader product still needs the remaining Epic 2 and downstream milestone work.
- The scaffold is intentionally sparse on business logic so the architecture can stabilize before feature depth increases.
