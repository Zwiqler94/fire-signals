<!-- markdownlint-disable MD013 -->

# FireSignals Realtime Database

Import from `@zwiqler94/fire-signals/database`.

## APIs

| Function | Return |
| --- | --- |
| `fromRefSignal(query, event, options?)` | `FireSignal<QueryChange>` |
| `stateChangesSignal(query, changeOptions?, options?)` | `FireSignal<QueryChange>` |
| `listSignal(query, changeOptions?, options?)` | `FireSignal<QueryChange[]>` |
| `listValSignal(query, valueOptions?, options?)` | `FireSignal<T[]>` |
| `auditTrailSignal(query, changeOptions?, options?)` | `FireSignal<QueryChange[]>` |
| `objectSignal(query, options?)` | `FireSignal<QueryChange>` |
| `objectValSignal(query, valueOptions?, options?)` | `FireSignal<T>` |

## Example

```ts
import {getDatabase, ref} from 'firebase/database';
import {listValSignal} from '@zwiqler94/fire-signals/database';

interface Todo {
  key: string;
  title: string;
}

export class TodosStore {
  private readonly todosRef = ref(getDatabase(), 'todos');
  readonly todos = listValSignal<Todo>(this.todosRef, {keyField: 'key'});
}
```
