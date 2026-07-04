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

import {fromRefSignal} from '../fromRef';
import {createFireSignal, FireSignal, FireSignalOptions, mapFireSignal} from '../../core';
import {snapToData} from '../document';
import {DocumentChangeType, DocumentChange, Query, QueryDocumentSnapshot, QuerySnapshot, DocumentData} from '../interfaces';
import {getCountFromServer, onSnapshot, refEqual} from 'firebase/firestore';
import type {SnapshotOptions} from 'firebase/firestore';
import type {CountSnapshot} from '../lite/interfaces';
const ALL_EVENTS: DocumentChangeType[] = ['added', 'modified', 'removed'];

/**
 * Returns whether any document change matches the event filter.
 */
function hasWantedEvents<T>(
    changes: DocumentChange<T>[],
    events: DocumentChangeType[],
): boolean {
  for (let i = 0; i < changes.length; i++) {
    if (events.indexOf(changes[i].type) >= 0) {
      return true;
    }
  }
  return false;
}

/**
 * Splice arguments on top of a sliced array, to break top-level ===
 * this is useful for change-detection
 */
function sliceAndSplice<T>(
    original: T[],
    start: number,
    deleteCount: number,
    ...args: T[]
): T[] {
  const returnArray = original.slice();
  returnArray.splice(start, deleteCount, ...args);
  return returnArray;
}

/**
 * Creates a new sorted array from a new change.
 * @param combined
 * @param change
 */
function processIndividualChange<T>(
    combined: DocumentChange<T>[],
    change: DocumentChange<T>,
): DocumentChange<T>[] {
  switch (change.type) {
    case 'added':
      if (
        combined[change.newIndex] &&
        refEqual(combined[change.newIndex].doc.ref, change.doc.ref)
      ) {
        // Repeated added changes for a ref already at this index are no-ops,
        // keeping the sorted change list idempotent.
      } else {
        return sliceAndSplice(combined, change.newIndex, 0, change);
      }
      break;
    case 'modified':
      if (
        combined[change.oldIndex] == null ||
        refEqual(combined[change.oldIndex].doc.ref, change.doc.ref)
      ) {
        // When an item changes position we first remove it
        // and then add it's new position
        if (change.oldIndex !== change.newIndex) {
          const copiedArray = combined.slice();
          copiedArray.splice(change.oldIndex, 1);
          copiedArray.splice(change.newIndex, 0, change);
          return copiedArray;
        } else {
          return sliceAndSplice(combined, change.newIndex, 1, change);
        }
      }
      break;
    case 'removed':
      if (
        combined[change.oldIndex] &&
        refEqual(combined[change.oldIndex].doc.ref, change.doc.ref)
      ) {
        return sliceAndSplice(combined, change.oldIndex, 1);
      }
      break;
    default: // ignore
  }
  return combined;
}

/**
 * Combines the total result set from the current set of changes from an incoming set
 * of changes.
 * @param current
 * @param changes
 * @param events
 */
function processDocumentChanges<T>(
    current: DocumentChange<T>[],
    changes: DocumentChange<T>[],
    events: DocumentChangeType[] = ALL_EVENTS,
): DocumentChange<T>[] {
  changes.forEach((change) => {
    // skip unwanted change types
    if (events.indexOf(change.type) > -1) {
      current = processIndividualChange(current, change);
    }
  });
  return current;
}

/**
 * Given two snapshots does their metadata match?
 * @param a
 * @param b
 */
const metaDataEquals = <T, R extends QuerySnapshot<T> | QueryDocumentSnapshot<T>>(
  a: R,
  b: R,
) => JSON.stringify(a.metadata) === JSON.stringify(b.metadata);

function listenCollectionChanges<T>(
    query: Query<T>,
    options: {
      events?: DocumentChangeType[]
    },
    next: (changes: DocumentChange<T>[]) => void,
    error: (error: unknown) => void,
    complete: () => void,
): () => void {
  const events = options.events || ALL_EVENTS;
  let priorSnapshot: QuerySnapshot<T> | undefined;
  return onSnapshot(query, {includeMetadataChanges: true}, {
    next: (currentSnapshot) => {
      const docChanges = currentSnapshot.docChanges();
      if (priorSnapshot && !metaDataEquals(priorSnapshot, currentSnapshot)) {
        // The metadata changed, but docChanges() omits metadata-only events.
        currentSnapshot.docs.forEach((currentDocSnapshot, currentIndex) => {
          const currentDocChange = docChanges.find((c) =>
            refEqual(c.doc.ref, currentDocSnapshot.ref),
          );
          if (currentDocChange) {
            if (metaDataEquals(currentDocChange.doc, currentDocSnapshot)) {
              return;
            }
          } else {
            const priorDocSnapshot = priorSnapshot?.docs.find((d) =>
              refEqual(d.ref, currentDocSnapshot.ref),
            );
            if (
              priorDocSnapshot &&
              metaDataEquals(priorDocSnapshot, currentDocSnapshot)
            ) {
              return;
            }
          }
          docChanges.push({
            oldIndex: currentIndex,
            newIndex: currentIndex,
            type: 'modified',
            doc: currentDocSnapshot,
          });
        });
      }

      const isFirst = priorSnapshot === undefined;
      priorSnapshot = currentSnapshot;
      if ((docChanges.length === 0 && isFirst) || hasWantedEvents(docChanges, events)) {
        next(docChanges.filter((change) => events.indexOf(change.type) > -1));
      }
    },
    error,
    complete,
  });
}

/**
 * Creates a FireSignal of document changes for a query. These results are not in
 * sort order, but in order of occurrence.
 * @param query
 */
export function collectionChangesSignal<T=DocumentData>(
    query: Query<T>,
    options: {
    events?: DocumentChangeType[]
  }={},
    signalOptions: FireSignalOptions<DocumentChange<T>[]> = {},
): FireSignal<DocumentChange<T>[]> {
  return createFireSignal((controller) => {
    return listenCollectionChanges(
        query,
        options,
        (changes) => controller.next(changes),
        (error) => controller.error(error),
        () => controller.complete(),
    );
  }, signalOptions);
}

/**
 * Creates a FireSignal of document snapshots for a query in sort order.
 * @param query
 */
export function collectionSignal<T=DocumentData>(
    query: Query<T>,
    options: FireSignalOptions<QueryDocumentSnapshot<T>[]> = {},
): FireSignal<QueryDocumentSnapshot<T>[]> {
  return mapFireSignal(
      fromRefSignal(query, {includeMetadataChanges: true}, {
        injector: options.injector,
        debugName: options.debugName,
      }),
      (changes) => changes.docs,
      options,
  );
}

/**
 * Creates a FireSignal of document changes accumulated in query sort order.
 * @param query
 */
export function sortedChangesSignal<T=DocumentData>(
    query: Query<T>,
    options: {
    events?: DocumentChangeType[]
  }={},
    signalOptions: FireSignalOptions<DocumentChange<T>[]> = {},
): FireSignal<DocumentChange<T>[]> {
  return createFireSignal((controller) => {
    let current: DocumentChange<T>[] = [];
    return listenCollectionChanges(
        query,
        options,
        (changes) => {
          current = processDocumentChanges(current, changes, options.events);
          controller.next(current);
        },
        (error) => controller.error(error),
        () => controller.complete(),
    );
  }, signalOptions);
}

/**
 * Creates a FireSignal that accumulates changes as they occur, similar to
 * docChanges().
 */
export function auditTrailSignal<T=DocumentData>(
    query: Query<T>,
    options: {
    events?: DocumentChangeType[]
  }={},
    signalOptions: FireSignalOptions<DocumentChange<T>[]> = {},
): FireSignal<DocumentChange<T>[]> {
  return createFireSignal((controller) => {
    let current: DocumentChange<T>[] = [];
    return listenCollectionChanges(
        query,
        options,
        (changes) => {
          current = [...current, ...changes];
          controller.next(current);
        },
        (error) => controller.error(error),
        () => controller.complete(),
    );
  }, signalOptions);
}

/**
 * Creates a FireSignal of query document data, optionally adding the document ID.
 * @param query
 * @param options
 */
export function collectionDataSignal<T=DocumentData, U extends string=never>(
    query: Query<T>,
    options: {
  idField?: ((U | keyof T) & keyof NonNullable<T>),
  } & SnapshotOptions={},
    signalOptions: FireSignalOptions<((T & { [T in U]: string; }) | NonNullable<T>)[]> = {},
): FireSignal<((T & { [T in U]: string; }) | NonNullable<T>)[]> {
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
  return createFireSignal((controller) => {
    let active = true;
    getCountFromServer(query).then(
        (snapshot) => {
          if (active) {
            controller.next(snapshot);
          }
        },
        (error) => {
          if (active) {
            controller.error(error);
          }
        },
    );
    return () => {
      active = false;
    };
  }, options);
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
