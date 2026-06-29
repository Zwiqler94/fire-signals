import {expectTypeOf, it} from 'vitest';
import {authStateSignal, idTokenSignal, userSignal} from '../auth/index';
import {listValSignal, objectValSignal} from '../database/index';
import {
  collectionCountSignal,
  collectionDataSignal,
  docDataSignal,
} from '../firestore/index';
import {
  collectionCountSignal as liteCollectionCountSignal,
  collectionDataSignal as liteCollectionDataSignal,
  docDataSignal as liteDocDataSignal,
} from '../firestore/lite/index';
import {httpsCallableSignal} from '../functions/index';
import {getPerformanceSignal, traceSignal} from '../performance/index';
import {getBooleanSignal, getStringSignal} from '../remote-config/index';
import {getDownloadURLSignal, uploadStringSignal} from '../storage/index';
import {FireSignal} from '../core';

type Auth = import('firebase/auth').Auth;
type User = import('firebase/auth').User;
type DatabaseQuery = import('firebase/database').Query;
type FirestoreDocumentReference<T> = import('firebase/firestore').DocumentReference<T>;
type FirestoreQuery<T> = import('firebase/firestore').Query<T>;
type LiteDocumentReference<T> = import('firebase/firestore/lite').DocumentReference<T>;
type LiteQuery<T> = import('firebase/firestore/lite').Query<T>;
type Functions = import('firebase/functions').Functions;
type FirebaseApp = import('firebase/app').FirebaseApp;
type RemoteConfig = import('firebase/remote-config').RemoteConfig;
type StorageReference = import('firebase/storage').StorageReference;

interface Item {
  name: string;
}

it('exposes signal-first product APIs', () => {
  expectTypeOf<ReturnType<typeof authStateSignal>>().toEqualTypeOf<FireSignal<User | null>>();
  expectTypeOf<ReturnType<typeof userSignal>>().toEqualTypeOf<FireSignal<User | null>>();
  expectTypeOf<ReturnType<typeof idTokenSignal>>().toEqualTypeOf<FireSignal<string | null>>();

  if (false) {
    const auth = undefined as unknown as Auth;
    const dbQuery = undefined as unknown as DatabaseQuery;
    const docRef = undefined as unknown as FirestoreDocumentReference<Item>;
    const query = undefined as unknown as FirestoreQuery<Item>;
    const liteDocRef = undefined as unknown as LiteDocumentReference<Item>;
    const liteQuery = undefined as unknown as LiteQuery<Item>;
    const functions = undefined as unknown as Functions;
    const app = undefined as unknown as FirebaseApp;
    const remoteConfig = undefined as unknown as RemoteConfig;
    const storageRef = undefined as unknown as StorageReference;

    expectTypeOf(authStateSignal(auth)).toEqualTypeOf<FireSignal<User | null>>();
    expectTypeOf(docDataSignal<Item>(docRef)).toEqualTypeOf<FireSignal<Item | undefined>>();
    expectTypeOf(collectionDataSignal<Item>(query)).toEqualTypeOf<FireSignal<Item[]>>();
    expectTypeOf(collectionCountSignal(query)).toEqualTypeOf<FireSignal<number>>();
    expectTypeOf(liteDocDataSignal<Item>(liteDocRef)).toEqualTypeOf<FireSignal<Item | undefined>>();
    expectTypeOf(liteCollectionDataSignal<Item>(liteQuery)).toEqualTypeOf<FireSignal<Item[]>>();
    expectTypeOf(liteCollectionCountSignal(liteQuery)).toEqualTypeOf<FireSignal<number>>();
    expectTypeOf(listValSignal<Item>(dbQuery)).toEqualTypeOf<FireSignal<Item[]>>();
    expectTypeOf(objectValSignal<Item>(dbQuery)).toEqualTypeOf<FireSignal<Item>>();
    expectTypeOf(httpsCallableSignal<{input: string}, {output: string}>(
        functions,
        'echo',
    )({input: 'x'})).toEqualTypeOf<FireSignal<{output: string}>>();
    expectTypeOf(getPerformanceSignal(app)).toEqualTypeOf<FireSignal<import('firebase/performance').FirebasePerformance>>();
    expectTypeOf(traceSignal('load', collectionCountSignal(query))).toEqualTypeOf<FireSignal<number>>();
    expectTypeOf(getStringSignal(remoteConfig, 'name')).toEqualTypeOf<FireSignal<string>>();
    expectTypeOf(getBooleanSignal(remoteConfig, 'enabled')).toEqualTypeOf<FireSignal<boolean>>();
    expectTypeOf(getDownloadURLSignal(storageRef)).toEqualTypeOf<FireSignal<string>>();
    expectTypeOf(uploadStringSignal(storageRef, 'body')).toEqualTypeOf<FireSignal<import('firebase/storage').UploadResult>>();
  }
});
