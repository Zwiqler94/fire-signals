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

import {onSnapshot} from 'firebase/firestore';
import {createFireSignal, FireSignal, FireSignalOptions} from '../core';
import {DocumentReference, DocumentData, SnapshotListenOptions, Query, DocumentSnapshot, QuerySnapshot} from './interfaces';

const DEFAULT_OPTIONS = {includeMetadataChanges: false};
type FirestoreReference<T> = DocumentReference<T> | Query<T>;

export function fromRefSignal<T=DocumentData>(
    ref: DocumentReference<T>,
    options?: SnapshotListenOptions,
    signalOptions?: FireSignalOptions<DocumentSnapshot<T>>,
): FireSignal<DocumentSnapshot<T>>;
export function fromRefSignal<T=DocumentData>(
    ref: Query<T>,
    options?: SnapshotListenOptions,
    signalOptions?: FireSignalOptions<QuerySnapshot<T>>,
): FireSignal<QuerySnapshot<T>>;
export function fromRefSignal<T=DocumentData>(
    ref: FirestoreReference<T>,
    options: SnapshotListenOptions=DEFAULT_OPTIONS,
    signalOptions: FireSignalOptions<DocumentSnapshot<T>> | FireSignalOptions<QuerySnapshot<T>> = {},
): FireSignal<DocumentSnapshot<T> | QuerySnapshot<T>> {
  if (ref.type === 'document') {
    return createFireSignal<DocumentSnapshot<T>>((controller) => {
      return onSnapshot(ref, options, {
        next: (snapshot) => controller.next(snapshot),
        error: (error) => controller.error(error),
        complete: () => controller.complete(),
      });
    }, signalOptions as FireSignalOptions<DocumentSnapshot<T>>);
  }

  return createFireSignal<QuerySnapshot<T>>((controller) => {
    return onSnapshot(ref, options, {
      next: (snapshot) => controller.next(snapshot),
      error: (error) => controller.error(error),
      complete: () => controller.complete(),
    });
  }, signalOptions as FireSignalOptions<QuerySnapshot<T>>);
}
