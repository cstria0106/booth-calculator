# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript source.
  - `index.tsx`: app entry; renders to `document.body`.
  - `ui.tsx`: Preact UI components and interactions.
  - `booth.ts`: network scraping of BOOTH orders (fetch + DOMParser).
  - `csv.ts`: CSV import/export utilities (PapaParse).
  - `utils.ts`, `types.ts`: helpers and shared types.
- `dist/`: tsup build output (`index.js`, `index.d.ts`).
- Config: `tsconfig.json`, `tsup.config.ts`, `pnpm-lock.yaml`.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies.
- `pnpm build`: bundle ESM to `dist/` with dts.
- `pnpm check`: TypeScript type-check (no emit).
- Watch build (example): `pnpm tsup src/index.tsx --watch`.

## Coding Style & Naming Conventions
- Language: TypeScript (strict), ES modules, JSX via Preact.
- Components/types: PascalCase (e.g., `App`). Functions/vars: camelCase.
- Files: lowercase; use `.tsx` for JSX and `.ts` otherwise.
- Keep side effects in `index.tsx`; keep modules pure where possible.
- Prefer small, single-responsibility modules; reuse utilities in `utils.ts`.
- Run `pnpm check` and `pnpm build` after making changes to ensure type safety and correct bundling.

## Commit & Pull Request Guidelines
- Commits: use clear, imperative messages. Conventional Commits are encouraged (e.g., `feat: add csv export`, `fix: handle empty price`).
- Pull Requests: include a concise description, steps to verify, and screenshots/GIFs for UI changes. Link related issues.
- Keep diffs focused; avoid unrelated refactors/formatting in feature PRs.

## Security & Configuration Tips
- Do not commit secrets. Network calls target `https://accounts.booth.pm`; keep respectful delays in `utils.wait` and avoid aggressive scraping.
- For offline development, use CSV import/export paths in the UI to simulate data.
