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

import {FireSignal, FireSignalOptions, createFireSignal} from '../core';
import {ListenEvent, QueryChange, ListenerMethods} from './interfaces';

/**
 * Create a FireSignal from a Database Reference or Database Query.
 * @param ref Database Reference
 * @param event Listen event type ('value', 'added', 'changed', 'removed', 'moved')
 */
export function fromRefSignal(
    ref: import('firebase/database').Query,
    event: ListenEvent,
    options: FireSignalOptions<QueryChange> = {},
): FireSignal<QueryChange> {
  return createFireSignal<QueryChange>((controller) => {
    const unsubscribe = ListenerMethods[event](
        ref,
        (snapshot, prevKey) => {
          queueMicrotask(() => {
            if (!controller.destroyed) {
              controller.next({snapshot, prevKey, event});
            }
          });
        },
        (error) => controller.error(error),
    );
    return unsubscribe;
  }, options);
}
