import {
  EnvironmentInjector,
  createEnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {sortedChangesSignal} from '../firestore/collection';
import {
  DocumentChange,
  DocumentChangeType,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from '../firestore/interfaces';

interface Item {
  name: string;
}

interface MockRef {
  path: string;
}

interface SnapshotObserver {
  next(snapshot: QuerySnapshot<unknown>): void;
  error(error: unknown): void;
  complete(): void;
}

const firestoreMock = vi.hoisted(() => {
  const observers: SnapshotObserver[] = [];
  return {
    observers,
    getCountFromServer: vi.fn(() => Promise.resolve({
      data: () => ({count: 0}),
    })),
    onSnapshot: vi.fn((
        _query: unknown,
        _options: unknown,
        observer: SnapshotObserver,
    ) => {
      observers.push(observer);
      return vi.fn();
    }),
    refEqual: vi.fn((left: MockRef, right: MockRef) => left.path === right.path),
  };
});

vi.mock('firebase/firestore', () => ({
  getCountFromServer: firestoreMock.getCountFromServer,
  onSnapshot: firestoreMock.onSnapshot,
  refEqual: firestoreMock.refEqual,
}));

const metadata = {
  fromCache: false,
  hasPendingWrites: false,
};

function makeDoc(path: string, data: Item): QueryDocumentSnapshot<Item> {
  return {
    id: path.split('/').pop() || path,
    metadata,
    ref: {path} as MockRef,
    data: () => data,
  } as QueryDocumentSnapshot<Item>;
}

function makeChange(
    type: DocumentChangeType,
    doc: QueryDocumentSnapshot<Item>,
    oldIndex: number,
    newIndex: number,
): DocumentChange<Item> {
  return {
    type,
    doc,
    oldIndex,
    newIndex,
  } as DocumentChange<Item>;
}

function makeSnapshot(
    docs: QueryDocumentSnapshot<Item>[],
    changes: DocumentChange<Item>[],
): QuerySnapshot<Item> {
  return {
    docs,
    metadata,
    docChanges: () => changes,
  } as QuerySnapshot<Item>;
}

describe('Firestore collection signals', () => {
  let injector: EnvironmentInjector | undefined;

  beforeEach(() => {
    firestoreMock.observers.length = 0;
    firestoreMock.getCountFromServer.mockClear();
    firestoreMock.onSnapshot.mockClear();
    firestoreMock.refEqual.mockClear();
  });

  afterEach(() => {
    injector?.destroy();
    injector = undefined;
  });

  function inContext<T>(fn: () => T): T {
    injector = createEnvironmentInjector([]);
    return runInInjectionContext(injector, fn);
  }

  function emit(snapshot: QuerySnapshot<Item>): void {
    firestoreMock.observers[0].next(snapshot as QuerySnapshot<unknown>);
  }

  it('keeps duplicate added changes for the same ref and index idempotent', () => {
    const query = {} as Query<Item>;
    const first = makeDoc('cities/one', {name: 'One'});
    const state = inContext(() => sortedChangesSignal(query));

    emit(makeSnapshot([first], [
      makeChange('added', first, -1, 0),
      makeChange('added', first, -1, 0),
    ]));

    expect(state.value()?.map((change) => change.doc.data())).toEqual([
      {name: 'One'},
    ]);
  });

  it('still inserts distinct added changes', () => {
    const query = {} as Query<Item>;
    const first = makeDoc('cities/one', {name: 'One'});
    const second = makeDoc('cities/two', {name: 'Two'});
    const state = inContext(() => sortedChangesSignal(query));

    emit(makeSnapshot([first, second], [
      makeChange('added', first, -1, 0),
      makeChange('added', second, -1, 1),
    ]));

    expect(state.value()?.map((change) => change.doc.data())).toEqual([
      {name: 'One'},
      {name: 'Two'},
    ]);
  });
});
