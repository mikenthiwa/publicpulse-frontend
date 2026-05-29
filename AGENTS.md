# Setup

- Use pnpm for this Next.js/TypeScript frontend.
- Install dependencies with `pnpm install`.
- Create local env with `cp .env.example .env.local`.
- Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` when the backend is not at `http://localhost:5000`.
- Run the dev server with `pnpm dev` and open `http://localhost:3000`.

# Testing

- Run unit/component tests with `pnpm test`.
- Use `pnpm test:watch` for local watch mode.
- Run `pnpm lint` before handing off changes.
- Run `pnpm build` for TypeScript and production build validation.
- For API-dependent UI, smoke test against the backend configured by `NEXT_PUBLIC_API_BASE_URL`.

# Style

- Follow the existing Next.js App Router structure under `src/app`.
- Prefer TypeScript and shared types in `src/types`.
- Keep API access in `src/services` and reusable UI in `src/components`.
- Use the `@/*` import alias for source imports.
- Preserve Tailwind CSS conventions and the restrained civic UI style already in the app.
- Keep components focused, readable, and explicit about loading, empty, and error states.

# UI Skills

- For any frontend/UI work, always use `.codex/skills/ui-design-brain/SKILL.md`.
- Before writing or modifying UI code, read the skill instructions and consult `.codex/skills/ui-design-brain/components.md` for the relevant component patterns.
- Select the applicable components first, then implement using the skill's best practices for layout, states, accessibility, and interaction.
- Mention in the final response which UI skill guidance was used.

# Review

- Check `git status --short` before and after changes.
- Do not revert unrelated user changes.
- Review diffs for behavior regressions, missing validation, and unnecessary complexity.
- Confirm `pnpm lint` and `pnpm build` results in the final response.
- Call out any skipped manual smoke tests, especially when the backend is unavailable.
