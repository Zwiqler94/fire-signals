# Repository Guidelines

## Project Structure & Module Organization

FireSignals is a TypeScript library for Angular signal-first Firebase helpers.
Root entry points live in `index.ts` and `core.ts`. Product entry points are
grouped by Firebase surface: `auth/`, `database/`, `firestore/`,
`firestore/lite/`, `functions/`, `performance/`, `remote-config/`, and
`storage/`. Shared docs live in `docs/`; secondary entry point package metadata
lives beside each module. Tests and emulator fixtures live under `test/`.

## Workspace & Release Coupling

This repo is consumed by sibling `../angularfire` through
`file:../fire-signals/dist`, so rebuild here before validating AngularFire
changes. Release governance lives in `RELEASE_POLICY.md`; keep package majors
aligned to the supported Angular major.

## Build, Test, and Development Commands

- `npm run build`: cleans and builds declarations, Rollup bundles, and
  distributable docs into `dist/`.
- `npm run dev`: runs Rollup in watch mode for local library development.
- `npm test`: runs Vitest unit tests matching `test/**/*.spec.ts`.
- `npm run test:emulators`: runs emulator-backed Vitest tests through Firebase CLI.
- `npm run lint`: runs ESLint across TypeScript sources.

## Coding Style & Naming Conventions

Use strict TypeScript and preserve the existing Google ESLint style. Formatting
uses two-space indentation, single quotes, semicolons, and named exports for
public APIs. Keep entry point APIs small and resource-shaped around
`FireSignal<T>`. Name signal helpers with a clear Firebase noun plus `Signal`,
for example `docDataSignal`. Use `kebab-case` files/directories, `camelCase`
functions, and `PascalCase` types/classes.

## Testing Guidelines

Use Vitest with `jsdom`. Place standard specs in `test/**/*.spec.ts`; emulator
specs should use `test/**/*.emulator.spec.ts`. Prefer public API and behavior
tests over implementation-only assertions. When touching Firebase service
behavior, run the emulator command in addition to `npm test`.

## Commit & Pull Request Guidelines

History uses Conventional Commits such as `chore: ...`, `chore(ci): ...`, and
`docs: ...`. Keep commits scoped and imperative, for example
`fix(firestore): preserve initial loading state`. Pull requests should describe
changed entry points, note contract impact for public helpers, link issues when
available, list validation commands, and call out release or dependency risks.
Include docs updates when public behavior, package exports, or setup changes.

## Security & Configuration Tips

Do not commit credentials, tokens, or local registry auth. Publishing targets
Artifact Registry through `publishConfig` and publish scripts; keep
authentication in user-level npm or Google auth config. Treat Firebase rules and
emulator fixtures as test inputs and update them with behavior changes.
