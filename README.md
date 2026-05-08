# PublicPulse Frontend

Next.js frontend for PublicPulse, a civic-tech platform for reporting damaged roads and public infrastructure issues.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- pnpm

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Description | Default example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:5000` |

## Project Structure

- `src/app` - App Router routes and global styles
- `src/components` - Reusable UI components
- `src/services` - API and service helpers
- `src/types` - Shared TypeScript types
- `src/utils` - Utility functions
