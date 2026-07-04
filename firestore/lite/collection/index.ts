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

type DataWithId<T, U extends string> = T | (NonNullable<T> & { [K in U]: string });

/**
 * Creates a FireSignal of document snapshots from a one-shot query read in sort
 * order.
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
 * Creates a FireSignal of query document data from a one-shot read, optionally
 * adding the document ID.
 * @param query
 */
export function collectionDataSignal<T=DocumentData, U extends string=never>(
    query: Query<T>,
    options: {
    idField?: U
  }={},
    signalOptions: FireSignalOptions<DataWithId<T, U>[]> = {},
): FireSignal<DataWithId<T, U>[]> {
  return mapFireSignal(
      collectionSignal(query, {
        injector: signalOptions.injector,
        debugName: signalOptions.debugName,
      }),
      (arr) => arr.map((snap) => snapToData(snap, options)!),
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
