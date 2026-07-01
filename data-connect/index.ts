import {
  connectDataConnectEmulator as _connectDataConnectEmulator,
  executeMutation as _executeMutation,
  executeQuery as _executeQuery,
  getDataConnect as _getDataConnect,
  makeMemoryCacheProvider as _makeMemoryCacheProvider,
  mutationRef as _mutationRef,
  queryRef as _queryRef,
  setLogLevel as _setLogLevel,
  subscribe as _subscribe,
  terminate as _terminate,
  toQueryRef as _toQueryRef,
} from 'firebase/data-connect';
import {FireSignal, FireSignalOptions} from '../core';
import {
  fromAsyncSignal,
  fromListenerSignal,
  fromSyncSignal,
  fromVoidSignal,
} from '../signal-helpers';

type CacheProvider<T extends StorageType> = import('firebase/data-connect').CacheProvider<T>;
type ConnectorConfig = import('firebase/data-connect').ConnectorConfig;
type DataConnect = import('firebase/data-connect').DataConnect;
type DataConnectSettings = import('firebase/data-connect').DataConnectSettings;
type ExecuteQueryOptions = import('firebase/data-connect').ExecuteQueryOptions;
type FirebaseApp = import('firebase/app').FirebaseApp;
type LogLevelString = Parameters<typeof _setLogLevel>[0];
type MutationRef<Data, Variables> = import('firebase/data-connect').MutationRef<Data, Variables>;
type MutationResult<Data, Variables> = import('firebase/data-connect').MutationResult<Data, Variables>;
type QueryRef<Data, Variables> = import('firebase/data-connect').QueryRef<Data, Variables>;
type QueryResult<Data, Variables> = import('firebase/data-connect').QueryResult<Data, Variables>;
type SerializedRef<Data, Variables> = import('firebase/data-connect').SerializedRef<Data, Variables>;
type StorageType = import('firebase/data-connect').StorageType;

export function connectDataConnectEmulatorSignal(
    dataConnect: DataConnect,
    host: string,
    port?: number,
    sslEnabled?: boolean,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(
      () => _connectDataConnectEmulator(dataConnect, host, port, sslEnabled),
      options,
  );
}

export function executeMutationSignal<Data, Variables>(
    mutation: MutationRef<Data, Variables>,
    options: FireSignalOptions<MutationResult<Data, Variables>> = {},
): FireSignal<MutationResult<Data, Variables>> {
  return fromAsyncSignal(() => _executeMutation(mutation), options);
}

export function executeQuerySignal<Data, Variables>(
    query: QueryRef<Data, Variables>,
    queryOptions?: ExecuteQueryOptions,
    signalOptions: FireSignalOptions<QueryResult<Data, Variables>> = {},
): FireSignal<QueryResult<Data, Variables>> {
  return fromAsyncSignal(() => _executeQuery(query, queryOptions), signalOptions);
}

export function getDataConnectSignal(
    options: ConnectorConfig,
    settings?: DataConnectSettings,
    signalOptions?: FireSignalOptions<DataConnect>,
): FireSignal<DataConnect>;
export function getDataConnectSignal(
    app: FirebaseApp,
    connectorConfig: ConnectorConfig,
    settings?: DataConnectSettings,
    signalOptions?: FireSignalOptions<DataConnect>,
): FireSignal<DataConnect>;
export function getDataConnectSignal(
    optionsOrApp: ConnectorConfig | FirebaseApp,
    configOrSettings?: ConnectorConfig | DataConnectSettings,
    settingsOrSignalOptions?: DataConnectSettings | FireSignalOptions<DataConnect>,
    maybeSignalOptions: FireSignalOptions<DataConnect> = {},
): FireSignal<DataConnect> {
  const hasApp = 'automaticDataCollectionEnabled' in optionsOrApp;
  const signalOptions = hasApp ? maybeSignalOptions : settingsOrSignalOptions as FireSignalOptions<DataConnect> | undefined;
  return fromSyncSignal(() => {
    if (hasApp) {
      const app = optionsOrApp as FirebaseApp;
      const connectorConfig = configOrSettings as ConnectorConfig;
      const settings = settingsOrSignalOptions as DataConnectSettings | undefined;
      return settings === undefined ?
        _getDataConnect(app, connectorConfig) :
        _getDataConnect(app, connectorConfig, settings);
    }
    const connectorConfig = optionsOrApp as ConnectorConfig;
    const settings = configOrSettings as DataConnectSettings | undefined;
    return settings === undefined ?
      _getDataConnect(connectorConfig) :
      _getDataConnect(connectorConfig, settings);
  }, signalOptions ?? {});
}

export function makeMemoryCacheProviderSignal(
    options: FireSignalOptions<CacheProvider<'MEMORY'>> = {},
): FireSignal<CacheProvider<'MEMORY'>> {
  return fromSyncSignal(() => _makeMemoryCacheProvider(), options);
}

export function mutationRefSignal<Data>(
    dataConnect: DataConnect,
    mutationName: string,
    variables?: undefined,
    options?: FireSignalOptions<MutationRef<Data, undefined>>,
): FireSignal<MutationRef<Data, undefined>>;
export function mutationRefSignal<Data, Variables>(
    dataConnect: DataConnect,
    mutationName: string,
    variables: Variables,
    options?: FireSignalOptions<MutationRef<Data, Variables>>,
): FireSignal<MutationRef<Data, Variables>>;
export function mutationRefSignal<Data, Variables>(
    dataConnect: DataConnect,
    mutationName: string,
    variables?: Variables,
    options: FireSignalOptions<MutationRef<Data, Variables>> = {},
): FireSignal<any> {
  return fromSyncSignal(() => {
    if (variables === undefined) {
      return _mutationRef<Data>(dataConnect, mutationName);
    }
    return _mutationRef<Data, Variables>(dataConnect, mutationName, variables);
  }, options as FireSignalOptions<any>);
}

export function queryRefSignal<Data>(
    dataConnect: DataConnect,
    queryName: string,
    variables?: undefined,
    options?: FireSignalOptions<QueryRef<Data, undefined>>,
): FireSignal<QueryRef<Data, undefined>>;
export function queryRefSignal<Data, Variables>(
    dataConnect: DataConnect,
    queryName: string,
    variables: Variables,
    options?: FireSignalOptions<QueryRef<Data, Variables>>,
): FireSignal<QueryRef<Data, Variables>>;
export function queryRefSignal<Data, Variables>(
    dataConnect: DataConnect,
    queryName: string,
    variables?: Variables,
    options: FireSignalOptions<QueryRef<Data, Variables>> = {},
): FireSignal<any> {
  return fromSyncSignal(() => {
    if (variables === undefined) {
      return _queryRef<Data>(dataConnect, queryName);
    }
    return _queryRef<Data, Variables>(dataConnect, queryName, variables);
  }, options as FireSignalOptions<any>);
}

export function setLogLevelSignal(
    logLevel: LogLevelString,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _setLogLevel(logLevel), options);
}

export function subscribeSignal<Data, Variables>(
    queryOrResult: QueryRef<Data, Variables> | SerializedRef<Data, Variables>,
    options: FireSignalOptions<QueryResult<Data, Variables>> = {},
): FireSignal<QueryResult<Data, Variables>> {
  return fromListenerSignal(
      (next, error, complete) => _subscribe(queryOrResult, next, error, complete),
      options,
  );
}

export function terminateSignal(
    dataConnect: DataConnect,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => _terminate(dataConnect), options);
}

export function toQueryRefSignal<Data, Variables>(
    serializedRef: SerializedRef<Data, Variables>,
    options: FireSignalOptions<QueryRef<Data, Variables>> = {},
): FireSignal<QueryRef<Data, Variables>> {
  return fromSyncSignal(() => _toQueryRef(serializedRef), options);
}
