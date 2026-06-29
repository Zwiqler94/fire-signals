<!-- markdownlint-disable MD013 -->

# FireSignals Storage

Import from `@zwiqler94/fire-signals/storage`.

## APIs

| Function | Return |
| --- | --- |
| `fromTaskSignal(task, options?)` | `FireSignal<UploadTaskSnapshot>` |
| `getDownloadURLSignal(ref, options?)` | `FireSignal<string>` |
| `getMetadataSignal(ref, options?)` | `FireSignal<FullMetadata>` |
| `uploadBytesResumableSignal(ref, data, metadata?, options?)` | `FireSignal<UploadTaskSnapshot>` |
| `uploadStringSignal(ref, data, format?, metadata?, options?)` | `FireSignal<UploadResult>` |
| `percentageSignal(task, options?)` | `FireSignal<{progress: number; snapshot: UploadTaskSnapshot}>` |

## Example

```ts
import {getStorage, ref} from 'firebase/storage';
import {getDownloadURLSignal} from '@zwiqler94/fire-signals/storage';

const imageRef = ref(getStorage(), 'images/city.png');
const imageUrl = getDownloadURLSignal(imageRef);
```
