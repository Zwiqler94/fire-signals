<!-- markdownlint-disable MD013 -->

# FireSignals

Angular signal-first Firebase helpers rearchitected from RxFire.

FireSignals keeps the Firebase behavior that made RxFire useful, but exposes
Angular signal state objects instead of RxJS Observables. The package is
intended for Angular 21+, Firebase 12+, zoneless-friendly applications, SSR
stability, and future Angular resource interop.

## Package

```bash
npm i @zwiqler94/fire-signals firebase @angular/core
yarn add @zwiqler94/fire-signals firebase @angular/core
```

Firebase and Angular are peer dependencies. RxJS is not a FireSignals public
peer dependency.

## State Shape

Every helper returns a `FireSignal<T>` resource-shaped state object.

```ts
export interface FireSignal<T> {
  readonly value: Signal<T | undefined>;
  readonly error: Signal<unknown | undefined>;
  readonly loading: Signal<boolean>;
  readonly status: Signal<'loading' | 'ready' | 'error'>;
  readonly hasValue: Signal<boolean>;
  destroy(): void;
}
```

Most helpers accept:

```ts
export interface FireSignalOptions<T> {
  initialValue?: T;
  injector?: Injector;
  equal?: ValueEqualityFn<T>;
  debugName?: string;
}
```

If no `injector` is passed, helpers must be created inside an Angular injection
context.

## Firestore Example

```ts
import {collection, getFirestore, query, where} from 'firebase/firestore';
import {collectionDataSignal} from '@zwiqler94/fire-signals/firestore';

interface City {
  id: string;
  name: string;
  state: string;
}

export class CitiesStore {
  private readonly firestore = getFirestore();
  private readonly citiesRef = query(
      collection(this.firestore, 'cities'),
      where('state', '==', 'CO'),
  );

  readonly cities = collectionDataSignal<City, 'id'>(
      this.citiesRef,
      {idField: 'id'},
      {debugName: 'cities'},
  );
}
```

```html
@if (cities.loading()) {
  <p>Loading...</p>
} @else if (cities.status() === 'error') {
  <p>Could not load cities.</p>
} @else {
  @for (city of cities.value() ?? []; track city.id) {
    <p>{{ city.name }}</p>
  }
}
```

## Entry Points

```ts
import {authStateSignal, userSignal, idTokenSignal} from '@zwiqler94/fire-signals/auth';
import {objectValSignal, listValSignal} from '@zwiqler94/fire-signals/database';
import {docDataSignal, collectionDataSignal} from '@zwiqler94/fire-signals/firestore';
import {docDataSignal as liteDocDataSignal} from '@zwiqler94/fire-signals/firestore/lite';
import {httpsCallableSignal} from '@zwiqler94/fire-signals/functions';
import {getPerformanceSignal, traceSignal} from '@zwiqler94/fire-signals/performance';
import {getStringSignal, getAllSignal} from '@zwiqler94/fire-signals/remote-config';
import {getDownloadURLSignal, uploadBytesResumableSignal} from '@zwiqler94/fire-signals/storage';
```

## Product Coverage

- Auth: `authStateSignal`, `userSignal`, `idTokenSignal`
- Firestore: document, collection, changes, audit trail, count, and data helpers
- Firestore Lite: one-shot document, collection, count, and data helpers
- Realtime Database: object, list, audit trail, and event helpers
- Functions: `httpsCallableSignal`
- Performance: `getPerformanceSignal` and signal trace helpers
- Remote Config: initialized parameter getters
- Storage: download URL, metadata, upload progress, upload string, and percentage helpers

## Attribution

FireSignals is a rearchitected fork of RxFire. RxFire and Firebase SDK work are
Copyright Google LLC and licensed under Apache-2.0. FireSignals rearchitecture
work is Copyright 2026 Zwiqler94 and licensed under Apache-2.0. See
[NOTICE](NOTICE) and [LICENSE](LICENSE).
