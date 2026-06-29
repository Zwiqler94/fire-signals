<!-- markdownlint-disable MD013 -->

# FireSignals Auth

Import from `@zwiqler94/fire-signals/auth`.

## APIs

| Function | Firebase source | Return |
| --- | --- | --- |
| `authStateSignal(auth, options?)` | `onAuthStateChanged` | `FireSignal<User \| null>` |
| `userSignal(auth, options?)` | `onIdTokenChanged` | `FireSignal<User \| null>` |
| `idTokenSignal(auth, options?)` | `onIdTokenChanged` + `getIdToken` | `FireSignal<string \| null>` |

## Example

```ts
import {authStateSignal} from '@zwiqler94/fire-signals/auth';
import {getAuth} from 'firebase/auth';

export class SessionStore {
  readonly authState = authStateSignal(getAuth(), {
    debugName: 'session.authState',
  });
}
```

`value()` is `undefined` until the first listener emission, then `User | null`.
