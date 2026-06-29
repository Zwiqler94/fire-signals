<!-- markdownlint-disable MD013 -->

# FireSignals Functions

Import from `@zwiqler94/fire-signals/functions`.

## API

| Function | Return |
| --- | --- |
| `httpsCallableSignal(functions, name, options?)` | `(data?, signalOptions?) => FireSignal<ResponseData>` |

## Example

```ts
import {getFunctions} from 'firebase/functions';
import {httpsCallableSignal} from '@zwiqler94/fire-signals/functions';

const reverseString = httpsCallableSignal<{value: string}, {reversed: string}>(
    getFunctions(),
    'reverseString',
);

const result = reverseString({value: 'FireSignals'});
```
