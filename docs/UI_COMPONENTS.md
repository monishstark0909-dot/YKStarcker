<!-- @format -->

# UI_COMPONENTS

## AppShell

- Purpose: Shared authenticated layout with navigation and workspace framing.
- Props: `children`, `activeRoute`.
- States: Desktop sidebar, tablet collapsed layout, mobile stacked layout.
- Responsive behavior: Switches to a narrow rail and top navigation on smaller screens.
- Dependencies: `navigation` config, user summary data.

## AuthShell

- Purpose: Dedicated authentication layout with brand framing and supporting copy.
- Props: `title`, `description`, `children`.
- States: Single-column on narrow screens and split-panel on larger screens.
- Responsive behavior: Collapses into a stacked reading flow on mobile.
- Dependencies: Badge primitive and design tokens.

## Button

- Purpose: Primary, secondary, ghost, and destructive actions.
- Props: `variant`, `size`, `disabled`, `loading`, `children`.
- States: Default, hover, active, disabled, loading.
- Responsive behavior: Full-width on narrow screens when used in forms.
- Dependencies: Design tokens.

## Card

- Purpose: Standard surface container for metrics and content blocks.
- Props: `title`, `description`, `children`, `accent`.
- States: Default, elevated, highlighted.
- Responsive behavior: Stacks naturally in grid layouts.
- Dependencies: None beyond design tokens.

## PlaceholderPage

- Purpose: Reusable placeholder screen for unfinished routes.
- Props: `title`, `description`, `badge`, `primaryAction`, `secondaryAction`.
- States: Empty, informative, action-ready.
- Responsive behavior: Reflows from two-column to single-column presentation.
- Dependencies: Button and Card primitives.

## StatCard

- Purpose: Show a key metric with context and trend hint.
- Props: `label`, `value`, `delta`, `tone`.
- States: Positive, neutral, warning.
- Responsive behavior: Adapts to the card grid.
- Dependencies: Typography scale and status colors.

## DashboardOverview

- Purpose: Composes the main dashboard hero, metrics, charts, and recommendation cards.
- Props: None in the first milestone because it renders from shared mock data.
- States: Static placeholder content until live API data is connected.
- Responsive behavior: Reflows from two columns to one column on smaller screens.
- Dependencies: Card, Badge, Button, ProgressBar, and StatCard primitives.

## AuthForm

- Purpose: Handles login and register submissions against the auth API using credentialed requests.
- Props: `mode`.
- States: Idle, pending, validation error, and API error.
- Responsive behavior: Stacks cleanly inside the auth card on mobile and desktop.
- Dependencies: Button, Input, router navigation, and the auth helper in `lib/auth.ts`.

## PasswordResetRequestForm

- Purpose: Submits password reset requests and surfaces the local preview link in development.
- Props: None.
- States: Idle, pending, success, and API error.
- Responsive behavior: Stacks cleanly inside the auth card on mobile and desktop.
- Dependencies: Button, Input, and the password-reset helper in `lib/auth.ts`.

## PasswordResetConfirmForm

- Purpose: Completes the password reset flow by validating a reset token and setting a new password.
- Props: `token`.
- States: Idle, pending, success, missing-token, and API error.
- Responsive behavior: Stacks cleanly inside the auth card on mobile and desktop.
- Dependencies: Button, Input, router-independent form state, and the password-reset helper in `lib/auth.ts`.

## DashboardGuard

- Purpose: Prevents unauthenticated users from accessing protected routes.
- Props: `children`.
- States: Loading, allowed, redirected.
- Responsive behavior: Renders a minimal loading state until the client session check resolves.
- Dependencies: auth API `me` probe, middleware, and Next.js router.

## TopBar

- Purpose: Global header for the authenticated app.
- Props: `user`, `notifications`, `searchEnabled`.
- States: Collapsed on mobile, expanded on desktop.
- Responsive behavior: Reduces density on tablet and mobile.
- Dependencies: Avatar, Button, Badge.
