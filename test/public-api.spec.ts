import {expectTypeOf, it} from 'vitest';
import {
  generateContentSignal,
  getAISignal,
  getGenerativeModelSignal,
} from '../ai/index';
import {
  getAnalyticsSignal,
  getGoogleAnalyticsClientIdSignal,
  logEventSignal,
} from '../analytics/index';
import {
  getAppSignal,
  getAppsSignal,
  initializeAppSignal,
} from '../app/index';
import {
  getTokenSignal as getAppCheckTokenSignal,
  initializeAppCheckSignal,
  onTokenChangedSignal,
} from '../app-check/index';
import {authStateSignal, idTokenSignal, userSignal} from '../auth/index';
import {
  executeMutationSignal,
  executeQuerySignal,
  getDataConnectSignal,
  queryRefSignal,
  subscribeSignal,
} from '../data-connect/index';
import {listValSignal, objectValSignal} from '../database/index';
import {
  collectionCountSignal,
  collectionDataSignal,
  docDataSignal,
  fromRefSignal as firestoreFromRefSignal,
} from '../firestore/index';
import {
  collectionCountSignal as liteCollectionCountSignal,
  collectionDataSignal as liteCollectionDataSignal,
  docDataSignal as liteDocDataSignal,
  fromRefSignal as liteFromRefSignal,
} from '../firestore/lite/index';
import {httpsCallableSignal} from '../functions/index';
import {
  getMessagingSignal,
  getTokenSignal as getMessagingTokenSignal,
  onMessageSignal,
} from '../messaging/index';
import {getPerformanceSignal, traceSignal} from '../performance/index';
import {getBooleanSignal, getStringSignal} from '../remote-config/index';
import {getDownloadURLSignal, uploadStringSignal} from '../storage/index';
import {FireSignal} from '../core';

type Auth = import('firebase/auth').Auth;
type User = import('firebase/auth').User;
type DatabaseQuery = import('firebase/database').Query;
type FirestoreDocumentReference<T> = import('firebase/firestore').DocumentReference<T>;
type FirestoreDocumentSnapshot<T> = import('firebase/firestore').DocumentSnapshot<T>;
type FirestoreQuery<T> = import('firebase/firestore').Query<T>;
type FirestoreQuerySnapshot<T> = import('firebase/firestore').QuerySnapshot<T>;
type LiteDocumentReference<T> = import('firebase/firestore/lite').DocumentReference<T>;
type LiteDocumentSnapshot<T> = import('firebase/firestore/lite').DocumentSnapshot<T>;
type LiteQuery<T> = import('firebase/firestore/lite').Query<T>;
type LiteQuerySnapshot<T> = import('firebase/firestore/lite').QuerySnapshot<T>;
type Functions = import('firebase/functions').Functions;
type FirebaseApp = import('firebase/app').FirebaseApp;
type FirebaseOptions = import('firebase/app').FirebaseOptions;
type RemoteConfig = import('firebase/remote-config').RemoteConfig;
type StorageReference = import('firebase/storage').StorageReference;
type AI = import('firebase/ai').AI;
type GenerativeModel = import('firebase/ai').GenerativeModel;
type Analytics = import('firebase/analytics').Analytics;
type AppCheck = import('firebase/app-check').AppCheck;
type AppCheckTokenResult = import('firebase/app-check').AppCheckTokenResult;
type ConnectorConfig = import('firebase/data-connect').ConnectorConfig;
type DataConnect = import('firebase/data-connect').DataConnect;
type MutationRef<T, V> = import('firebase/data-connect').MutationRef<T, V>;
type MutationResult<T, V> = import('firebase/data-connect').MutationResult<T, V>;
type QueryRef<T, V> = import('firebase/data-connect').QueryRef<T, V>;
type QueryResult<T, V> = import('firebase/data-connect').QueryResult<T, V>;
type MessagePayload = import('firebase/messaging').MessagePayload;
type Messaging = import('firebase/messaging').Messaging;

interface Item {
  name: string;
}

type ItemWithId = Item & {id: string};

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
    const appOptions = undefined as unknown as FirebaseOptions;
    const remoteConfig = undefined as unknown as RemoteConfig;
    const storageRef = undefined as unknown as StorageReference;
    const ai = undefined as unknown as AI;
    const model = undefined as unknown as GenerativeModel;
    const analytics = undefined as unknown as Analytics;
    const appCheck = undefined as unknown as AppCheck;
    const connectorConfig = undefined as unknown as ConnectorConfig;
    const dataConnect = undefined as unknown as DataConnect;
    const mutation = undefined as unknown as MutationRef<Item, {id: string}>;
    const queryRef = undefined as unknown as QueryRef<Item, {id: string}>;
    const messaging = undefined as unknown as Messaging;

    expectTypeOf(getAISignal(app)).toEqualTypeOf<FireSignal<AI>>();
    expectTypeOf(getGenerativeModelSignal(ai, {
      model: 'gemini-test',
    })).toEqualTypeOf<FireSignal<GenerativeModel>>();
    expectTypeOf(generateContentSignal(model, 'hello')).toEqualTypeOf<FireSignal<import('firebase/ai').GenerateContentResult>>();
    expectTypeOf(getAnalyticsSignal(app)).toEqualTypeOf<FireSignal<Analytics>>();
    expectTypeOf(getGoogleAnalyticsClientIdSignal(analytics)).toEqualTypeOf<FireSignal<string>>();
    expectTypeOf(logEventSignal(analytics, 'page_view')).toEqualTypeOf<FireSignal<void>>();
    expectTypeOf(getAppSignal()).toEqualTypeOf<FireSignal<FirebaseApp>>();
    expectTypeOf(getAppsSignal()).toEqualTypeOf<FireSignal<FirebaseApp[]>>();
    expectTypeOf(initializeAppSignal(appOptions)).toEqualTypeOf<FireSignal<FirebaseApp>>();
    expectTypeOf(initializeAppCheckSignal(app)).toEqualTypeOf<FireSignal<AppCheck>>();
    expectTypeOf(getAppCheckTokenSignal(appCheck)).toEqualTypeOf<FireSignal<AppCheckTokenResult>>();
    expectTypeOf(onTokenChangedSignal(appCheck)).toEqualTypeOf<FireSignal<AppCheckTokenResult>>();
    expectTypeOf(authStateSignal(auth)).toEqualTypeOf<FireSignal<User | null>>();
    expectTypeOf(firestoreFromRefSignal(docRef)).toEqualTypeOf<FireSignal<FirestoreDocumentSnapshot<Item>>>();
    expectTypeOf(firestoreFromRefSignal(query)).toEqualTypeOf<FireSignal<FirestoreQuerySnapshot<Item>>>();
    expectTypeOf(docDataSignal<Item>(docRef)).toEqualTypeOf<FireSignal<Item | undefined>>();
    expectTypeOf(docDataSignal<Item, ItemWithId>(docRef, {
      idField: 'id',
    })).toEqualTypeOf<FireSignal<Item | ItemWithId | undefined>>();
    expectTypeOf(collectionDataSignal<Item>(query)).toEqualTypeOf<FireSignal<Item[]>>();
    expectTypeOf(collectionDataSignal<Item, 'id'>(query, {
      idField: 'id',
    })).toEqualTypeOf<FireSignal<(Item | ItemWithId)[]>>();
    expectTypeOf(collectionCountSignal(query)).toEqualTypeOf<FireSignal<number>>();
    expectTypeOf(liteFromRefSignal(liteDocRef)).toEqualTypeOf<FireSignal<LiteDocumentSnapshot<Item>>>();
    expectTypeOf(liteFromRefSignal(liteQuery)).toEqualTypeOf<FireSignal<LiteQuerySnapshot<Item>>>();
    expectTypeOf(liteDocDataSignal<Item>(liteDocRef)).toEqualTypeOf<FireSignal<Item | undefined>>();
    expectTypeOf(liteDocDataSignal<Item, 'id'>(liteDocRef, {
      idField: 'id',
    })).toEqualTypeOf<FireSignal<Item | ItemWithId | undefined>>();
    expectTypeOf(liteCollectionDataSignal<Item>(liteQuery)).toEqualTypeOf<FireSignal<Item[]>>();
    expectTypeOf(liteCollectionDataSignal<Item, 'id'>(liteQuery, {
      idField: 'id',
    })).toEqualTypeOf<FireSignal<(Item | ItemWithId)[]>>();
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
    expectTypeOf(getDataConnectSignal(connectorConfig)).toEqualTypeOf<FireSignal<DataConnect>>();
    expectTypeOf(queryRefSignal<Item, {id: string}>(
        dataConnect,
        'GetItem',
        {id: 'a'},
    )).toEqualTypeOf<FireSignal<QueryRef<Item, {id: string}>>>();
    expectTypeOf(executeQuerySignal(queryRef)).toEqualTypeOf<FireSignal<QueryResult<Item, {id: string}>>>();
    expectTypeOf(executeMutationSignal(mutation)).toEqualTypeOf<FireSignal<MutationResult<Item, {id: string}>>>();
    expectTypeOf(subscribeSignal(queryRef)).toEqualTypeOf<FireSignal<QueryResult<Item, {id: string}>>>();
    expectTypeOf(getMessagingSignal(app)).toEqualTypeOf<FireSignal<Messaging>>();
    expectTypeOf(getMessagingTokenSignal(messaging)).toEqualTypeOf<FireSignal<string>>();
    expectTypeOf(onMessageSignal(messaging)).toEqualTypeOf<FireSignal<MessagePayload>>();
  }
});
