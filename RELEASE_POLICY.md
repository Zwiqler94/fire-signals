# Release Policy

This repository publishes `@zwiqler94/fire-signals`.

## Version Alignment

- Package majors track the supported Angular major.
- The first fork release branch is `21.0.0`.
- FireSignals and AngularFire versions may differ when only one package changes,
  but dependency and peer ranges must stay compatible for the same Angular major.
- TypeScript 6 work belongs to the Angular 22 release line unless Angular 21
  officially widens its compatibility range.

## Branches

- `main` is the integration branch for the next unreleased major.
- `21.0.0` is the stabilization branch for the Angular 21.0.0 release.
- Future minor releases use their own branches, for example `21.1.0`, so
  Angular 21.0.0 fixes can continue independently.
- Future major work starts on its own branch, for example `22.0.0`, so Angular
  21 fixes can continue independently.
- Hotfixes start from the affected release branch and merge forward into newer
  active release branches.

## Tags

- Use immutable semver git tags with a `v` prefix:
  - `v21.0.0-next.0`
  - `v21.0.0-rc.0`
  - `v21.0.0`
- Tags mark published `@zwiqler94/fire-signals` builds from this repository.
- Do not reuse or move published tags.

## Publishing

- Publish from the package build output: `dist`.
- The package publishes to Google Artifact Registry:
  - `https://us-central1-npm.pkg.dev/jlz-portfolio/angular-libraries/`
- Authenticate with `npm run artifactregistry-login` before publishing.
- Use `npm run publish:dry-run` before `npm run publish:registry`.
