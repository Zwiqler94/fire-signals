import {
  EnvironmentInjector,
  createEnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import {afterEach, describe, expect, expectTypeOf, it} from 'vitest';
import {
  FireSignal,
  createFireSignal,
  fromPromiseSignal,
  mapFireSignal,
} from '../core';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('FireSignal core', () => {
  let injector: EnvironmentInjector | undefined;

  afterEach(() => {
    injector?.destroy();
    injector = undefined;
  });

  function inContext<T>(fn: () => T): T {
    injector = createEnvironmentInjector([]);
    return runInInjectionContext(injector, fn);
  }

  it('wraps a resolving promise with loading and ready state', async () => {
    const state = inContext(() => fromPromiseSignal(() => Promise.resolve('ready')));

    expect(state.value()).toBeUndefined();
    expect(state.loading()).toBe(true);
    expect(state.status()).toBe('loading');
    expect(state.hasValue()).toBe(false);

    await settle();

    expect(state.value()).toBe('ready');
    expect(state.error()).toBeUndefined();
    expect(state.loading()).toBe(false);
    expect(state.status()).toBe('ready');
    expect(state.hasValue()).toBe(true);
  });

  it('wraps a rejecting promise with error state', async () => {
    const error = new Error('nope');
    const state = inContext(() => fromPromiseSignal(() => Promise.reject(error)));

    await settle();

    expect(state.value()).toBeUndefined();
    expect(state.error()).toBe(error);
    expect(state.loading()).toBe(false);
    expect(state.status()).toBe('error');
    expect(state.hasValue()).toBe(false);
  });

  it('supports initial values', () => {
    const state = inContext(() => fromPromiseSignal(
        () => new Promise<string>(() => undefined),
        {initialValue: 'cached'},
    ));

    expect(state.value()).toBe('cached');
    expect(state.loading()).toBe(false);
    expect(state.status()).toBe('ready');
    expect(state.hasValue()).toBe(true);
  });

  it('runs cleanup once and ignores late values after destroy', () => {
    let cleanupCount = 0;
    let next!: (value: string) => void;
    const state = inContext(() => createFireSignal<string>((controller) => {
      next = (value) => controller.next(value);
      return () => cleanupCount++;
    }));

    state.destroy();
    state.destroy();
    next('late');

    expect(cleanupCount).toBe(1);
    expect(state.value()).toBeUndefined();
    expect(state.loading()).toBe(false);
  });

  it('cleans up when the injection context is destroyed', () => {
    let cleanupCount = 0;
    inContext(() => createFireSignal<string>(() => () => cleanupCount++));

    injector?.destroy();
    injector = undefined;

    expect(cleanupCount).toBe(1);
  });

  it('maps source values without losing source status', async () => {
    const state = inContext(() => mapFireSignal(
        fromPromiseSignal(() => Promise.resolve(21)),
        (value) => value * 2,
    ));

    await settle();

    expect(state.value()).toBe(42);
    expect(state.status()).toBe('ready');
  });

  it('keeps public generic shape stable', () => {
    expectTypeOf<FireSignal<string>['value']>().returns.toEqualTypeOf<string | undefined>();
    expectTypeOf<FireSignal<string>['error']>().returns.toEqualTypeOf<unknown | undefined>();
    expectTypeOf<FireSignal<string>['loading']>().returns.toEqualTypeOf<boolean>();
    expectTypeOf<FireSignal<string>['status']>().returns.toEqualTypeOf<'loading' | 'ready' | 'error'>();
    expectTypeOf<FireSignal<string>['hasValue']>().returns.toEqualTypeOf<boolean>();
  });
});
