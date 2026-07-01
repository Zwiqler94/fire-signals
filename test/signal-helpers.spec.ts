import {
  EnvironmentInjector,
  createEnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import {afterEach, describe, expect, it} from 'vitest';
import {
  fromAsyncIterableSignal,
  fromAsyncSignal,
  fromListenerSignal,
  fromSyncSignal,
  fromVoidSignal,
} from '../signal-helpers';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('signal helpers', () => {
  let injector: EnvironmentInjector | undefined;

  afterEach(() => {
    injector?.destroy();
    injector = undefined;
  });

  function inContext<T>(fn: () => T): T {
    injector = createEnvironmentInjector([]);
    return runInInjectionContext(injector, fn);
  }

  it('wraps sync values and sync errors', () => {
    const value = inContext(() => fromSyncSignal(() => 'ready'));
    const error = new Error('boom');
    const failed = inContext(() => fromSyncSignal(() => {
      throw error;
    }));

    expect(value.value()).toBe('ready');
    expect(value.status()).toBe('ready');
    expect(failed.error()).toBe(error);
    expect(failed.status()).toBe('error');
  });

  it('wraps void commands as ready signals', () => {
    let called = false;
    const state = inContext(() => fromVoidSignal(() => {
      called = true;
    }));

    expect(called).toBe(true);
    expect(state.loading()).toBe(false);
    expect(state.status()).toBe('ready');
  });

  it('wraps async factories and catches sync factory errors', async () => {
    const error = new Error('nope');
    const failed = inContext(() => fromAsyncSignal<string>(() => {
      throw error;
    }));

    await settle();

    expect(failed.error()).toBe(error);
    expect(failed.status()).toBe('error');
  });

  it('cleans up listener subscriptions', () => {
    let cleanupCount = 0;
    let emit!: (value: string) => void;
    const state = inContext(() => fromListenerSignal<string>((next) => {
      emit = next;
      return () => cleanupCount++;
    }));

    emit('first');
    state.destroy();
    emit('late');

    expect(state.value()).toBe('first');
    expect(cleanupCount).toBe(1);
  });

  it('emits async iterable values until completion', async () => {
    async function* values() {
      yield 'first';
      yield 'second';
    }

    const state = inContext(() => fromAsyncIterableSignal(values));

    await settle();
    await settle();

    expect(state.value()).toBe('second');
    expect(state.status()).toBe('ready');
  });
});
