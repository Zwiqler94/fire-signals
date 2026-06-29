/**
 * @license
 * Copyright 2026 Zwiqler94
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

import {
  DestroyRef,
  Injector,
  PendingTasks,
  Signal,
  ValueEqualityFn,
  assertInInjectionContext,
  computed,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';

export type FireSignalStatus = 'loading' | 'ready' | 'error';

export interface FireSignal<T> {
  readonly value: Signal<T | undefined>;
  readonly error: Signal<unknown | undefined>;
  readonly loading: Signal<boolean>;
  readonly status: Signal<FireSignalStatus>;
  readonly hasValue: Signal<boolean>;
  destroy(): void;
}

export interface FireSignalOptions<T> {
  initialValue?: T;
  injector?: Injector;
  equal?: ValueEqualityFn<T>;
  debugName?: string;
}

type Teardown = void | (() => void) | { unsubscribe(): void };

interface FireSignalController<T> {
  next(value: T): void;
  error(error: unknown): void;
  complete(): void;
  loading(): void;
  onCleanup(teardown: Teardown): void;
  get destroyed(): boolean;
}

function teardown(teardownValue: Teardown): void {
  if (typeof teardownValue === 'function') {
    teardownValue();
  } else if (teardownValue) {
    teardownValue.unsubscribe();
  }
}

function resolveInjector<T>(options: FireSignalOptions<T> | undefined, debugFn: Function): Injector {
  if (options?.injector) {
    return options.injector;
  }
  assertInInjectionContext(debugFn);
  return inject(Injector);
}

function debugName(base: string | undefined, suffix: string): string | undefined {
  return base ? `${base}.${suffix}` : undefined;
}

export function createFireSignal<T>(
    setup: (controller: FireSignalController<T>) => Teardown,
    options: FireSignalOptions<T> = {},
): FireSignal<T> {
  const injector = resolveInjector(options, createFireSignal);
  return runInInjectionContext(injector, () => {
    const destroyRef = inject(DestroyRef);
    const pendingTasks = inject(PendingTasks, {optional: true});
    const value = signal<T | undefined>(options.initialValue, {
      equal: options.equal as ValueEqualityFn<T | undefined> | undefined,
      debugName: debugName(options.debugName, 'value'),
    });
    const currentError = signal<unknown | undefined>(undefined, {
      debugName: debugName(options.debugName, 'error'),
    });
    const isLoading = signal(options.initialValue === undefined, {
      debugName: debugName(options.debugName, 'loading'),
    });
    const status = computed<FireSignalStatus>(() => {
      if (currentError() !== undefined) {
        return 'error';
      }
      return isLoading() ? 'loading' : 'ready';
    }, {debugName: debugName(options.debugName, 'status')});
    const hasValue = computed(() => value() !== undefined, {
      debugName: debugName(options.debugName, 'hasValue'),
    });

    let destroyed = false;
    let pendingCleanup = options.initialValue === undefined ? pendingTasks?.add() : undefined;
    const cleanups: Teardown[] = [];

    const clearPending = () => {
      pendingCleanup?.();
      pendingCleanup = undefined;
    };

    const controller: FireSignalController<T> = {
      next(nextValue) {
        if (destroyed) {
          return;
        }
        value.set(nextValue);
        currentError.set(undefined);
        isLoading.set(false);
        clearPending();
      },
      error(nextError) {
        if (destroyed) {
          return;
        }
        currentError.set(nextError);
        isLoading.set(false);
        clearPending();
      },
      complete() {
        if (destroyed) {
          return;
        }
        isLoading.set(false);
        clearPending();
      },
      loading() {
        if (destroyed) {
          return;
        }
        if (!isLoading()) {
          pendingCleanup = pendingCleanup ?? pendingTasks?.add();
        }
        currentError.set(undefined);
        isLoading.set(true);
      },
      onCleanup(teardownValue) {
        cleanups.push(teardownValue);
      },
      get destroyed() {
        return destroyed;
      },
    };

    const destroy = () => {
      if (destroyed) {
        return;
      }
      destroyed = true;
      clearPending();
      while (cleanups.length > 0) {
        teardown(cleanups.pop());
      }
      isLoading.set(false);
    };

    controller.onCleanup(setup(controller));
    const unregisterDestroy = destroyRef.onDestroy(destroy);
    controller.onCleanup(unregisterDestroy);

    return {
      value: value.asReadonly(),
      error: currentError.asReadonly(),
      loading: isLoading.asReadonly(),
      status,
      hasValue,
      destroy,
    };
  });
}

export function fromPromiseSignal<T>(
    factory: () => PromiseLike<T>,
    options: FireSignalOptions<T> = {},
): FireSignal<T> {
  return createFireSignal((controller) => {
    let active = true;
    factory().then(
        (value) => {
          if (active) {
            controller.next(value);
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

export function mapFireSignal<T, R>(
    source: FireSignal<T>,
    project: (value: T) => R,
    options: FireSignalOptions<R> = {},
): FireSignal<R> {
  const value = computed<R | undefined>(() => {
    if (source.hasValue()) {
      return project(source.value() as T);
    }
    return options.initialValue;
  }, {
    equal: options.equal as ValueEqualityFn<R | undefined> | undefined,
    debugName: debugName(options.debugName, 'value'),
  });

  return {
    value,
    error: source.error,
    loading: source.loading,
    status: source.status,
    hasValue: computed(() => value() !== undefined, {
      debugName: debugName(options.debugName, 'hasValue'),
    }),
    destroy() {
      source.destroy();
    },
  };
}
