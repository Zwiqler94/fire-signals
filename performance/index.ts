import {effect} from '@angular/core';
import {createFireSignal, FireSignal, FireSignalOptions, fromPromiseSignal} from '../core';

type FirebaseApp = import('firebase/app').FirebaseApp;
type FirebasePerformance = import('firebase/performance').FirebasePerformance;

interface TraceSignalOptions<T> extends FireSignalOptions<T> {
  orComplete?: boolean;
}

/**
 * Lazy loads Firebase Performance monitoring and returns the instance as a FireSignal.
 * @param app
 * @returns FireSignal<FirebasePerformance>
 */
export const getPerformanceSignal = (
    app: FirebaseApp,
    options: FireSignalOptions<FirebasePerformance> = {},
) => fromPromiseSignal(
    () => import('firebase/performance').then((module) => module.getPerformance(app)),
    options,
);

function startTrace(traceId: string): () => void {
  if (typeof window === 'undefined' || !window.performance) {
    return () => undefined;
  }
  const entries = window.performance.getEntriesByName(traceId, 'measure') || [];
  const startMarkName = `_${traceId}Start[${entries.length}]`;
  const endMarkName = `_${traceId}End[${entries.length}]`;
  let ended = false;
  window.performance.mark(startMarkName);
  return () => {
    if (ended) {
      return;
    }
    ended = true;
    window.performance.mark(endMarkName);
    window.performance.measure(traceId, startMarkName, endMarkName);
  };
}

function mirrorTraceSignal<T>(
    source: FireSignal<T>,
    options: FireSignalOptions<T>,
    handleValue: (value: T) => void,
    handleReady: () => void = () => undefined,
    handleCleanup: () => void = () => undefined,
): FireSignal<T> {
  return createFireSignal<T>((controller) => {
    const stopEffect = effect(() => {
      if (source.status() === 'error') {
        controller.error(source.error());
        return;
      }
      if (source.hasValue()) {
        const value = source.value() as T;
        controller.next(value);
        handleValue(value);
      }
      if (!source.loading()) {
        handleReady();
      }
    }, {injector: options.injector});

    return () => {
      handleCleanup();
      stopEffect.destroy();
      source.destroy();
    };
  }, options);
}

/**
 * Begins a trace and ends it when the source signal first has a value.
 */
export const traceSignal = <T = unknown>(
    name: string,
    source: FireSignal<T>,
    options: FireSignalOptions<T> = {},
): FireSignal<T> => {
  const endTrace = startTrace(name);
  return mirrorTraceSignal(source, options, () => endTrace(), undefined, endTrace);
};

/**
 * Begins a trace and ends it when the test resolves to true.
 */
export const traceUntilSignal = <T = unknown>(
    name: string,
    source: FireSignal<T>,
    test: (value: T) => boolean,
    options: TraceSignalOptions<T> = {},
): FireSignal<T> => {
  const endTrace = startTrace(name);
  return mirrorTraceSignal(
      source,
      options,
      (value) => {
        if (test(value)) {
          endTrace();
        }
      },
      () => {
        if (options.orComplete) {
          endTrace();
        }
      },
      endTrace,
  );
};

/**
 * Begins a trace while the test resolves to true, and ends it once the test fails.
 */
export const traceWhileSignal = <T = unknown>(
    name: string,
    source: FireSignal<T>,
    test: (value: T) => boolean,
    options: TraceSignalOptions<T> = {},
): FireSignal<T> => {
  let endTrace: (() => void) | undefined;
  const stopTrace = () => {
    endTrace?.();
    endTrace = undefined;
  };
  return mirrorTraceSignal(
      source,
      options,
      (value) => {
        if (test(value)) {
          endTrace = endTrace ?? startTrace(name);
        } else {
          stopTrace();
        }
      },
      () => {
        if (options.orComplete) {
          stopTrace();
        }
      },
      stopTrace,
  );
};

/**
 * Begins a trace and ends it when the source is no longer loading.
 */
export const traceUntilCompleteSignal = <T = unknown>(
    name: string,
    source: FireSignal<T>,
    options: FireSignalOptions<T> = {},
): FireSignal<T> => {
  const endTrace = startTrace(name);
  return mirrorTraceSignal(source, options, () => undefined, () => endTrace(), endTrace);
};

/**
 * Begins a trace and ends it when the source signal first has a value.
 */
export const traceUntilFirstSignal = traceSignal;
