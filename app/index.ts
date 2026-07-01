import {
  deleteApp as _deleteApp,
  getApp as _getApp,
  getApps as _getApps,
  initializeApp as _initializeApp,
  initializeServerApp as _initializeServerApp,
  onLog as _onLog,
  registerVersion as _registerVersion,
  setLogLevel as _setLogLevel,
} from 'firebase/app';
import {FireSignal, FireSignalOptions} from '../core';
import {
  fromAsyncSignal,
  fromListenerSignal,
  fromSyncSignal,
  fromVoidSignal,
} from '../signal-helpers';

type FirebaseApp = import('firebase/app').FirebaseApp;
type FirebaseAppSettings = import('firebase/app').FirebaseAppSettings;
type FirebaseOptions = import('firebase/app').FirebaseOptions;
type FirebaseServerApp = import('firebase/app').FirebaseServerApp;
type FirebaseServerAppSettings = import('firebase/app').FirebaseServerAppSettings;
export type FirebaseLogCallbackParams = Parameters<Exclude<Parameters<typeof _onLog>[0], null>>[0];

export function deleteAppSignal(
    app: FirebaseApp,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => _deleteApp(app), options);
}

export function getAppSignal(
    name?: string,
    options: FireSignalOptions<FirebaseApp> = {},
): FireSignal<FirebaseApp> {
  return fromSyncSignal(() => _getApp(name), options);
}

export function getAppsSignal(
    options: FireSignalOptions<FirebaseApp[]> = {},
): FireSignal<FirebaseApp[]> {
  return fromSyncSignal(() => _getApps(), options);
}

export function initializeAppSignal(
    options?: FirebaseOptions,
    nameOrConfig?: string | FirebaseAppSettings,
    signalOptions: FireSignalOptions<FirebaseApp> = {},
): FireSignal<FirebaseApp> {
  return fromSyncSignal(() => {
    if (options === undefined) {
      return _initializeApp();
    }
    if (nameOrConfig === undefined) {
      return _initializeApp(options);
    }
    return _initializeApp(options, nameOrConfig as string);
  }, signalOptions);
}

export function initializeServerAppSignal(
    optionsOrApp?: FirebaseOptions | FirebaseApp,
    config?: FirebaseServerAppSettings,
    signalOptions: FireSignalOptions<FirebaseServerApp> = {},
): FireSignal<FirebaseServerApp> {
  return fromSyncSignal(() => {
    if (optionsOrApp === undefined) {
      return _initializeServerApp(config);
    }
    return _initializeServerApp(optionsOrApp, config);
  }, signalOptions);
}

export function onLogSignal(
    logOptions?: Parameters<typeof _onLog>[1],
    signalOptions: FireSignalOptions<FirebaseLogCallbackParams> = {},
): FireSignal<FirebaseLogCallbackParams> {
  return fromListenerSignal((next) => {
    _onLog(next, logOptions);
    return () => _onLog(null);
  }, signalOptions);
}

export function registerVersionSignal(
    libraryKeyOrName: string,
    version: string,
    variant?: string,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _registerVersion(libraryKeyOrName, version, variant), options);
}

export function setLogLevelSignal(
    logLevel: Parameters<typeof _setLogLevel>[0],
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _setLogLevel(logLevel), options);
}
