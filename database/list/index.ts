/**
 * @license
 * Copyright 2021 Google LLC
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

import {QueryChange, ListenEvent, Query} from '../interfaces';
import {validateEventsArray} from '../utils';
import {changeToData} from '../object';
import {get as databaseGet} from 'firebase/database';
import {createFireSignal, FireSignal, FireSignalOptions, mapFireSignal} from '../../core';
import {fromRefSignal} from '../fromRef';
import {effect} from '@angular/core';

export function stateChangesSignal(
    query: Query,
    options: {
    events?: ListenEvent[]
  } = {},
    signalOptions: FireSignalOptions<QueryChange> = {},
): FireSignal<QueryChange> {
  const events = validateEventsArray(options.events);
  return createFireSignal((controller) => {
    const children = events.map((event) =>
      fromRefSignal(query, event, {
        injector: signalOptions.injector,
        debugName: signalOptions.debugName,
      }),
    );
    const cleanups = children.map((child) => child.destroy);
    const stopEffects = children.map((child) => {
      return effect(() => {
        if (child.status() === 'error') {
          controller.error(child.error());
          return;
        }
        if (child.hasValue()) {
          controller.next(child.value() as QueryChange);
        }
      }, {injector: signalOptions.injector});
    });
    return () => {
      stopEffects.forEach((stopEffect) => stopEffect.destroy());
      cleanups.forEach((cleanup) => cleanup());
    };
  }, signalOptions);
}

export function listSignal(
    query: Query,
    options: {
    events?: ListenEvent[]
  } = {},
    signalOptions: FireSignalOptions<QueryChange[]> = {},
): FireSignal<QueryChange[]> {
  const events = validateEventsArray(options.events);
  return createFireSignal((controller) => {
    let current: QueryChange[] = [];
    const cleanups: Array<() => void> = [];
    let active = true;

    databaseGet(query).then(
        (snapshot) => {
          if (!active || controller.destroyed) {
            return;
          }
          current = buildView(current, {snapshot, prevKey: null, event: ListenEvent.value});
          controller.next(current);
          events.forEach((event) => {
            const child = fromRefSignal(query, event, {
              injector: signalOptions.injector,
              debugName: signalOptions.debugName,
            });
            const stopEffect = effect(() => {
              if (child.status() === 'error') {
                controller.error(child.error());
                return;
              }
              if (child.hasValue()) {
                current = buildView(current, child.value() as QueryChange);
                controller.next(current);
              }
            }, {injector: signalOptions.injector});
            cleanups.push(() => {
              stopEffect.destroy();
              child.destroy();
            });
          });
        },
        (error) => controller.error(error),
    );

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, signalOptions);
}

/**
 * Get an object mapped to its value, and optionally its key
 * @param query object ref or query
 * @param keyField map the object key to a specific field
 */
export function listValSignal<T>(
    query: Query,
    options: {
    keyField?: string,
  } = {},
    signalOptions: FireSignalOptions<T[]> = {},
): FireSignal<T[]> {
  return mapFireSignal(
      listSignal(query, undefined, {
        injector: signalOptions.injector,
        debugName: signalOptions.debugName,
      }),
      (arr) => arr.map((change) => changeToData(change, options) as T),
      signalOptions,
  );
}

function positionFor(changes: QueryChange[], key: string | null): number {
  const len = changes.length;
  for (let i = 0; i < len; i++) {
    if (changes[i].snapshot.key === key) {
      return i;
    }
  }
  return -1;
}

function positionAfter(changes: QueryChange[], prevKey?: string): number {
  if (prevKey == null) {
    return 0;
  } else {
    const i = positionFor(changes, prevKey);
    if (i === -1) {
      return changes.length;
    } else {
      return i + 1;
    }
  }
}

function buildView(current: QueryChange[], change: QueryChange): QueryChange[] {
  const {snapshot, prevKey, event} = change;
  const {key} = snapshot;
  const currentKeyPosition = positionFor(current, key);
  const afterPreviousKeyPosition = positionAfter(current, prevKey || undefined);

  switch (event) {
    case ListenEvent.value:
      if (change.snapshot && change.snapshot.exists()) {
        let prevKey: string | null = null;
        change.snapshot.forEach((snapshot) => {
          const action: QueryChange = {
            snapshot,
            event: ListenEvent.value,
            prevKey,
          };
          prevKey = snapshot.key;
          current = [...current, action];
          return false;
        });
      }
      return current;
    case ListenEvent.added:
      if (currentKeyPosition > -1) {
        // check that the previouskey is what we expect, else reorder
        const previous = current[currentKeyPosition - 1];
        if (((previous && previous.snapshot.key) || null) !== prevKey) {
          current = current.filter((x) => x.snapshot.key !== snapshot.key);
          current.splice(afterPreviousKeyPosition, 0, change);
        }
      } else if (prevKey == null) {
        return [change, ...current];
      } else {
        current = current.slice();
        current.splice(afterPreviousKeyPosition, 0, change);
      }
      return current;
    case ListenEvent.removed:
      return current.filter((x) => x.snapshot.key !== snapshot.key);
    case ListenEvent.changed:
      return current.map((x) => (x.snapshot.key === key ? change : x));
    case ListenEvent.moved:
      if (currentKeyPosition > -1) {
        const data = current.splice(currentKeyPosition, 1)[0];
        current = current.slice();
        current.splice(afterPreviousKeyPosition, 0, data);
        return current;
      }
      return current;
    // default will also remove null results
    default:
      return current;
  }
}
