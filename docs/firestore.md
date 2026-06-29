<!-- markdownlint-disable MD013 -->

# FireSignals Firestore

Import from `@zwiqler94/fire-signals/firestore` or `@zwiqler94/fire-signals/firestore/lite`.

## Firestore APIs

| Function | Return |
| --- | --- |
| `docSignal(ref, options?)` | `FireSignal<DocumentSnapshot<T>>` |
| `docDataSignal(ref, snapshotOptions?, options?)` | `FireSignal<T \| undefined>` |
| `collectionSignal(query, options?)` | `FireSignal<QueryDocumentSnapshot<T>[]>` |
| `collectionDataSignal(query, snapshotOptions?, options?)` | `FireSignal<T[]>` |
| `collectionChangesSignal(query, changeOptions?, options?)` | `FireSignal<DocumentChange<T>[]>` |
| `sortedChangesSignal(query, changeOptions?, options?)` | `FireSignal<DocumentChange<T>[]>` |
| `auditTrailSignal(query, changeOptions?, options?)` | `FireSignal<DocumentChange<T>[]>` |
| `collectionCountSnapSignal(query, options?)` | `FireSignal<CountSnapshot>` |
| `collectionCountSignal(query, options?)` | `FireSignal<number>` |

## Firestore Lite APIs

Firestore Lite helpers are one-shot promise-backed signals.

| Function | Return |
| --- | --- |
| `docSignal(ref, options?)` | `FireSignal<DocumentSnapshot<T>>` |
| `docDataSignal(ref, snapshotOptions?, options?)` | `FireSignal<T \| undefined>` |
| `collectionSignal(query, options?)` | `FireSignal<QueryDocumentSnapshot<T>[]>` |
| `collectionDataSignal(query, snapshotOptions?, options?)` | `FireSignal<T[]>` |
| `collectionCountSnapSignal(query, options?)` | `FireSignal<CountSnapshot>` |
| `collectionCountSignal(query, options?)` | `FireSignal<number>` |

## Example

```ts
import {collection, getFirestore} from 'firebase/firestore';
import {collectionDataSignal} from '@zwiqler94/fire-signals/firestore';

interface User {
  uid: string;
  name: string;
}

export class UsersStore {
  private readonly usersRef = collection(getFirestore(), 'users');
  readonly users = collectionDataSignal<User, 'uid'>(
      this.usersRef,
      {idField: 'uid'},
  );
}
```
