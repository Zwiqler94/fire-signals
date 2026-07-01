import {FireSignal, FireSignalOptions, createFireSignal, fromPromiseSignal} from './core';

type Teardown = void | (() => void) | { unsubscribe(): void };

function runTeardown(teardown: Teardown): void {
  if (typeof teardown === 'function') {
    teardown();
  } else if (teardown) {
    teardown.unsubscribe();
  }
}

export function fromAsyncSignal<T>(
    factory: () => PromiseLike<T>,
    options: FireSignalOptions<T> = {},
): FireSignal<T> {
  return fromPromiseSignal(() => Promise.resolve().then(factory), options);
}

export function fromSyncSignal<T>(
    factory: () => T,
    options: FireSignalOptions<T> = {},
): FireSignal<T> {
  return createFireSignal((controller) => {
    try {
      controller.next(factory());
      controller.complete();
    } catch (error) {
      controller.error(error);
    }
  }, options);
}

export function fromVoidSignal(
    factory: () => void,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromSyncSignal(factory, options);
}

export function fromListenerSignal<T>(
    listen: (
      next: (value: T) => void,
      error: (error: unknown) => void,
      complete: () => void,
    ) => Teardown,
    options: FireSignalOptions<T> = {},
): FireSignal<T> {
  return createFireSignal((controller) => {
    let unsubscribe: Teardown;
    try {
      unsubscribe = listen(
          (value) => controller.next(value),
          (error) => controller.error(error),
          () => controller.complete(),
      );
    } catch (error) {
      controller.error(error);
    }
    return () => runTeardown(unsubscribe);
  }, options);
}

export function fromAsyncIterableSignal<T>(
    factory: () => AsyncIterable<T>,
    options: FireSignalOptions<T> = {},
): FireSignal<T> {
  return createFireSignal((controller) => {
    let active = true;
    let iterator: AsyncIterator<T> | undefined;

    Promise.resolve().then(async () => {
      iterator = factory()[Symbol.asyncIterator]();
      while (active) {
        const result = await iterator.next();
        if (!active) {
          return;
        }
        if (result.done) {
          controller.complete();
          return;
        }
        controller.next(result.value);
      }
    }).catch((error) => {
      if (active) {
        controller.error(error);
      }
    });

    return () => {
      active = false;
      void iterator?.return?.();
    };
  }, options);
}
