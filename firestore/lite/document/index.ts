/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {DocumentReference, DocumentSnapshot, DocumentData} from '../interfaces';
import {FireSignal, FireSignalOptions, mapFireSignal} from '../../../core';
import {fromRefSignal} from '../fromRef';

export function docSignal<T=DocumentData>(
    ref: DocumentReference<T>,
    options: FireSignalOptions<DocumentSnapshot<T>> = {},
): FireSignal<DocumentSnapshot<T>> {
  return fromRefSignal(ref, options);
}

/**
 * Returns a stream of a document, mapped to its data payload and optionally the document ID
 * @param query
 */
export function docDataSignal<T=DocumentData>(
    ref: DocumentReference<T>,
    options: {
    idField?: string
  }={},
    signalOptions: FireSignalOptions<T | undefined> = {},
): FireSignal<T | undefined> {
  return mapFireSignal(
      docSignal(ref, {
        injector: signalOptions.injector,
        debugName: signalOptions.debugName,
      }),
      (snap) => snapToData(snap, options) as T,
      signalOptions,
  );
}

export function snapToData<T=DocumentData>(
    snapshot: DocumentSnapshot<T>,
    options: {
      idField?: string,
    }={},
): {} | undefined {
  // TODO clean up the typings
  const data = snapshot.data() as any;
  // match the behavior of the JS SDK when the snapshot doesn't exist
  // it's possible with data converters too that the user didn't return an object
  if (!snapshot.exists() || typeof data !== 'object' || data === null) {
    return data;
  }
  if (options.idField) {
    data[options.idField] = snapshot.id;
  }
  return data;
}
