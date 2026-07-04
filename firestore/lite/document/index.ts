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

type DataWithId<T, U extends string> = T | (NonNullable<T> & { [K in U]: string });

export function docSignal<T=DocumentData>(
    ref: DocumentReference<T>,
    options: FireSignalOptions<DocumentSnapshot<T>> = {},
): FireSignal<DocumentSnapshot<T>> {
  return fromRefSignal(ref, options);
}

/**
 * Creates a FireSignal of document data from a one-shot read, optionally adding
 * the document ID.
 * @param query
 */
export function docDataSignal<T=DocumentData, U extends string=never>(
    ref: DocumentReference<T>,
    options: {
    idField?: U
  }={},
    signalOptions: FireSignalOptions<DataWithId<T, U> | undefined> = {},
): FireSignal<DataWithId<T, U> | undefined> {
  return mapFireSignal(
      docSignal(ref, {
        injector: signalOptions.injector,
        debugName: signalOptions.debugName,
      }),
      (snap) => snapToData(snap, options),
      signalOptions,
  );
}

export function snapToData<T=DocumentData, U extends string=never>(
    snapshot: DocumentSnapshot<T>,
    options: {
      idField?: U,
    }={},
): DataWithId<T, U> | undefined {
  const data = snapshot.data();
  // match the behavior of the JS SDK when the snapshot doesn't exist
  // it's possible with data converters too that the user didn't return an object
  if (!snapshot.exists() || typeof data !== 'object' || data === null || !options.idField) {
    return data;
  }
  return {
    ...data,
    [options.idField]: snapshot.id,
  } as NonNullable<T> & { [K in U]: string };
}
