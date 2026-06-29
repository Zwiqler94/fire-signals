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

import {effect} from '@angular/core';
import {FireSignal, FireSignalOptions, createFireSignal} from '../../core';
import {QueryChange, ListenEvent, Query} from '../interfaces';
import {fromRefSignal} from '../fromRef';
import {stateChangesSignal} from './index';

export function auditTrailSignal(
    query: Query,
    options: {
    events?: ListenEvent[]
  }={},
    signalOptions: FireSignalOptions<QueryChange[]> = {},
): FireSignal<QueryChange[]> {
  return createFireSignal((controller) => {
    let changes: QueryChange[] = [];
    let lastKeyToLoad: string | null | undefined;
    let loaded = false;

    const value = fromRefSignal(query, ListenEvent.value, {
      injector: signalOptions.injector,
      debugName: signalOptions.debugName,
    });
    const child = stateChangesSignal(query, options, {
      injector: signalOptions.injector,
      debugName: signalOptions.debugName,
    });

    const emitIfLoaded = () => {
      if (!loaded) {
        return;
      }
      if (lastKeyToLoad == null || changes.some((change) => change.snapshot.key === lastKeyToLoad)) {
        controller.next(changes);
      }
    };

    const stopValueEffect = effect(() => {
      if (value.status() === 'error') {
        controller.error(value.error());
        return;
      }
      if (!value.hasValue()) {
        return;
      }

      lastKeyToLoad = undefined;
      value.value()?.snapshot.forEach((snapshot) => {
        lastKeyToLoad = snapshot.key;
        return false;
      });
      loaded = true;
      emitIfLoaded();
    }, {injector: signalOptions.injector});

    const stopChildEffect = effect(() => {
      if (child.status() === 'error') {
        controller.error(child.error());
        return;
      }
      if (!child.hasValue()) {
        return;
      }
      changes = [...changes, child.value() as QueryChange];
      emitIfLoaded();
    }, {injector: signalOptions.injector});

    return () => {
      stopChildEffect.destroy();
      stopValueEffect.destroy();
      child.destroy();
      value.destroy();
    };
  }, signalOptions);
}
