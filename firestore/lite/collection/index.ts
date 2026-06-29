/**
 * @license
 * Copyright 2023 Google LLC
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

import {snapToData} from '../document';
import {Query, QueryDocumentSnapshot, DocumentData, CountSnapshot} from '../interfaces';
import {getDocs, getCount} from 'firebase/firestore/lite';
import {FireSignal, FireSignalOptions, fromPromiseSignal, mapFireSignal} from '../../../core';

/**
 * Return a stream of document snapshots on a query. These results are in sort order.
 * @param query
 */
export function collectionSignal<T=DocumentData>(
    query: Query<T>,
    options: FireSignalOptions<QueryDocumentSnapshot<T>[]> = {},
): FireSignal<QueryDocumentSnapshot<T>[]> {
  return mapFireSignal(
      fromPromiseSignal(() => getDocs<T, DocumentData>(query), {
        injector: options.injector,
        debugName: options.debugName,
      }),
      (changes) => changes.docs,
      options,
  );
}

/**
 * Returns a stream of documents mapped to their data payload, and optionally the document ID
 * @param query
 */
export function collectionDataSignal<T=DocumentData>(
    query: Query<T>,
    options: {
    idField?: string
  }={},
    signalOptions: FireSignalOptions<T[]> = {},
): FireSignal<T[]> {
  return mapFireSignal(
      collectionSignal(query, {
        injector: signalOptions.injector,
        debugName: signalOptions.debugName,
      }),
      (arr) => arr.map((snap) => snapToData(snap, options) as T),
      signalOptions,
  );
}

export function collectionCountSnapSignal(
    query: Query<unknown>,
    options: FireSignalOptions<CountSnapshot> = {},
): FireSignal<CountSnapshot> {
  return fromPromiseSignal(() => getCount(query), options);
}

export function collectionCountSignal(
    query: Query<unknown>,
    options: FireSignalOptions<number> = {},
): FireSignal<number> {
  return mapFireSignal(
      collectionCountSnapSignal(query, {
        injector: options.injector,
        debugName: options.debugName,
      }),
      (snap) => snap.data().count,
      options,
  );
}
