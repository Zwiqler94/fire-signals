# Contributing to FireSignals

FireSignals is a rearchitected fork of RxFire. New contributions should target:

- Angular signal-first APIs.
- Vitest tests.
- Angular 21 and Firebase 12 compatibility.
- The `@zwiqler94/fire-signals` package identity.
- Apache-2.0 attribution preservation for upstream RxFire work.

## Development

```bash
yarn install --ignore-scripts
yarn build
yarn test
```

Use `*.spec.ts` for unit tests and `*.emulator.spec.ts` for Firebase emulator
tests. The `test/legacy` folder contains upstream RxFire Observable tests that
are retained only as migration reference.

## API Direction

Public helpers should return `FireSignal<T>` state objects. Do not add a new
RxJS public API unless a future compatibility plan explicitly asks for it.

## Attribution

Keep existing Google LLC license headers on upstream-derived files. Add new
Zwiqler94 copyright notices only for new files or substantially reauthored
files where that is appropriate.
