# Capstone spec — PublicPulse Frontend

## Problem statement

PublicPulse Frontend provides the user-facing experience for a civic-tech
platform that helps citizens report damaged roads and public infrastructure
issues. It turns the PublicPulse backend API into clear workflows for creating,
viewing, confirming, and tracking infrastructure reports so citizen complaints
can become structured and visible.

## What success looks like

- [ ] A visitor can understand what PublicPulse does from the landing page.
- [ ] A user can register and log in with an email and password.
- [ ] The frontend stores the returned JWT for authenticated API requests.
- [ ] A citizen can create an infrastructure report with title, description,
      category, photo URL, county, and road name.
- [ ] Users can browse a public list of reported issues.
- [ ] Users can view full details for a single report.
- [ ] Users can anonymously confirm/upvote an existing issue.
- [ ] The authenticated report creator can update a report status from
      `Reported` to `InProgress` to `Resolved`.
- [ ] Unauthenticated users cannot create reports or update report status.
- [ ] Frontend checks pass with `pnpm lint` and `pnpm build`.

## Current frontend state

- A Next.js app exists with a simple landing/status page.
- The API base URL is configured with `NEXT_PUBLIC_API_BASE_URL`.
- A shared `ApiResponse<T>` type exists.
- Endpoint-specific TypeScript models, API helpers, forms, and report views
  still need to be built.

## Architecture sketch

- A Next.js App Router frontend written in TypeScript.
- Tailwind CSS for styling and responsive layouts.
- A small API service layer that reads `NEXT_PUBLIC_API_BASE_URL` and wraps
  backend requests.
- Shared TypeScript types for backend request and response contracts.
- Client-side auth state for storing and applying the JWT bearer token.
- Public pages for report browsing and report details.
- Authenticated workflows for report creation and creator-only status updates.

## Tech stack

- Framework: Next.js
- Language: TypeScript
- UI: React
- Styling: Tailwind CSS
- Package manager: pnpm
- API: PublicPulse backend REST API
- Configuration: `.env.local` and `NEXT_PUBLIC_API_BASE_URL`

## Backend API contract summary

The frontend should consume the implemented PublicPulse backend MVP endpoints.

| Flow | Endpoint | Auth | Frontend use |
| --- | --- | --- | --- |
| Register | `POST /api/Auth/register` | Public | Create a local account and receive a JWT. |
| Login | `POST /api/Auth/login` | Public | Authenticate and receive a JWT. |
| Categories | `GET /api/Categories` | Public | Populate the report category selector. |
| Create report | `POST /api/Reports` | Bearer token | Submit a new infrastructure report. |
| List reports | `GET /api/Reports` | Public | Show public report cards or table rows. |
| Report details | `GET /api/Reports/{id}` | Public | Show the full report detail page. |
| Confirm report | `POST /api/Reports/{id}/confirmations` | Public | Increment the report confirmation count. |
| Update status | `PUT /api/Reports/{id}/status` | Bearer token | Let the report creator update status. |

Backend responses use the shared wrapper shape:

```ts
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
```

Important backend models for frontend typing:

- `RegisterRequest`: `email`, `password`
- `LoginRequest`: `email`, `password`
- `AuthResponse`: `userId`, `email`, `token`, `expiresAtUtc`
- `CategoryResponse`: `id`, `name`, `description`
- `CreateReportRequest`: `description`, `categoryId`, `photoUrl`, `county`,
  `roadName`
- `ReportListItemResponse`: `id`, `categoryId`, `categoryName`, `county`,
  `roadName`, `status`, `confirmationCount`, `created`
- `ReportResponse`: list item fields plus `description`, `photoUrl`, and
  `lastModified`
- `ConfirmReportResponse`: `reportId`, `confirmationCount`
- `ReportStatus`: `Reported`, `InProgress`, `Resolved`

## Frontend task list

1. [ ] Confirm the frontend runs locally with `pnpm install` and `pnpm dev`.
2. [ ] Confirm `.env.local` supports `NEXT_PUBLIC_API_BASE_URL`.
3. [ ] Add endpoint-specific TypeScript request and response types.
4. [ ] Add API helper functions for auth, categories, reports, confirmations,
       and status updates.
5. [ ] Add authentication UI for register and login.
6. [ ] Store the JWT and attach it to authenticated requests.
7. [ ] Add a public reports list view.
8. [ ] Add a report detail view.
9. [ ] Add a report creation form using backend categories.
10. [ ] Add an anonymous confirm/upvote action on report details.
11. [ ] Add status update controls for authenticated report creators.
12. [ ] Add loading, empty, success, and error states for core flows.
13. [ ] Validate required form fields before submitting to the API.
14. [ ] Keep report responses public and avoid exposing creator identity.
15. [ ] Update README if setup, environment variables, or scripts change.
16. [ ] Run `pnpm lint` and `pnpm build`.
17. [ ] Manually smoke test the MVP against the local backend at
       `http://localhost:5000`.

## Manual acceptance scenarios

- A new user can register, receive a token, and stay authenticated in the app.
- An existing user can log in and make authenticated requests.
- An authenticated user can create a report with all required report fields.
- A public user can list reports without logging in.
- A public user can open a report detail page without logging in.
- A public user can confirm/upvote a report and see the confirmation count
  update.
- The authenticated report creator can update status to `InProgress` or
  `Resolved`.
- An unauthenticated user cannot create a report.
- An unauthenticated user cannot update report status.
- API errors are shown clearly without breaking the page.

## Verification

Run frontend checks before marking MVP frontend work complete:

```bash
pnpm lint
pnpm build
```

Manual smoke test with the backend running locally:

```bash
ASPNETCORE_URLS=http://localhost:5000 dotnet run --project ../publicpulse-backend/src/Web/Web.csproj
pnpm dev
```

Then open `http://localhost:3000` and test the main MVP flows against
`http://localhost:5000`.

## Out of scope for frontend MVP

- Real photo upload storage.
- Maps and geospatial search.
- Advanced admin dashboard.
- Real-time notifications.
- SMS/USSD integration.
- AI image analysis.
- Payment or donation features.
- Production deployment hardening.
- Complex duplicate-report detection or merging.

## Open questions

- Should JWT auth state be stored in local storage, session storage, or a cookie?
- Should anonymous confirmations be limited per browser/session in the frontend?
- Should report creation require a photo URL for MVP demos, or allow it to be
  optional until upload support exists?
- Should status update controls be hidden unless the frontend can identify the
  current user as the report creator?
- Should the first report list be a simple card grid, table, or map-ready list?
