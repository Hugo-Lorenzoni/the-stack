# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the CPV FPMs Next.js app. The integration includes client-side initialization via `instrumentation-client.ts`, a server-side PostHog helper, user identification on login, error tracking, and 12 custom events spread across API routes and client components. A reverse proxy is configured in `next.config.ts` to reduce ad-blocker interference.

| Event | Description | File |
|---|---|---|
| `user_registered` | Fired when a new user successfully registers an account | `src/app/api/register/route.ts` |
| `user_approved` | Fired when an admin approves a waiting user account (grants BAPTISE role) | `src/app/api/admin/acceptuser/route.ts` |
| `user_rejected` | Fired when an admin rejects a waiting user account | `src/app/api/admin/rejectuser/route.ts` |
| `user_signed_out` | Fired when a user clicks the sign-out button | `src/components/AuthButton.tsx` |
| `event_created` | Fired when an admin successfully creates a new photo event | `src/app/api/admin/event/route.ts` |
| `event_published` | Fired when an admin publishes a drafted event, making it visible to users | `src/app/api/admin/publishevent/route.ts` |
| `event_deleted` | Fired when an admin deletes an event and its associated photos | `src/app/api/admin/deleteevent/route.ts` |
| `photos_added` | Fired when an admin adds photos to an existing event | `src/app/api/admin/addphotos/route.ts` |
| `password_protected_event_unlocked` | Fired when a user successfully unlocks a password-protected (AUTRE) event | `src/app/api/passwordcheck/[id]/route.ts` |
| `search_performed` | Fired when a user submits a search query | `src/components/SearchBar.tsx` |
| `forgot_password_requested` | Fired when a user successfully requests a password reset email | `src/app/api/forgot-password/route.ts` |
| `password_reset` | Fired when a user successfully resets their password via a reset token | `src/app/api/reset-password/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/153716/dashboard/604975
- **New Registrations Over Time**: https://eu.posthog.com/project/153716/insights/nhQSg9nJ
- **Registration to Approval Funnel**: https://eu.posthog.com/project/153716/insights/xs1NSfgy
- **Event Creation to Publication Funnel**: https://eu.posthog.com/project/153716/insights/dNVRkSuW
- **Search Activity & Sign-outs**: https://eu.posthog.com/project/153716/insights/VYX21ASb
- **Password-Protected Event Unlocks**: https://eu.posthog.com/project/153716/insights/7W6zlaH1

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
