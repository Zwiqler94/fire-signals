import {
  getLimitedUseToken as _getLimitedUseToken,
  getToken as _getToken,
  initializeAppCheck as _initializeAppCheck,
  onTokenChanged as _onTokenChanged,
  setTokenAutoRefreshEnabled as _setTokenAutoRefreshEnabled,
} from 'firebase/app-check';
import {FireSignal, FireSignalOptions} from '../core';
import {
  fromAsyncSignal,
  fromListenerSignal,
  fromSyncSignal,
  fromVoidSignal,
} from '../signal-helpers';

type AppCheck = import('firebase/app-check').AppCheck;
type AppCheckOptions = import('firebase/app-check').AppCheckOptions;
type AppCheckTokenResult = import('firebase/app-check').AppCheckTokenResult;
type FirebaseApp = import('firebase/app').FirebaseApp;

export function getLimitedUseTokenSignal(
    appCheck: AppCheck,
    options: FireSignalOptions<AppCheckTokenResult> = {},
): FireSignal<AppCheckTokenResult> {
  return fromAsyncSignal(() => _getLimitedUseToken(appCheck), options);
}

export function getTokenSignal(
    appCheck: AppCheck,
    forceRefresh?: boolean,
    options: FireSignalOptions<AppCheckTokenResult> = {},
): FireSignal<AppCheckTokenResult> {
  return fromAsyncSignal(() => _getToken(appCheck, forceRefresh), options);
}

export function initializeAppCheckSignal(
    app?: FirebaseApp,
    options?: AppCheckOptions,
    signalOptions: FireSignalOptions<AppCheck> = {},
): FireSignal<AppCheck> {
  return fromSyncSignal(() => _initializeAppCheck(app, options), signalOptions);
}

export function onTokenChangedSignal(
    appCheck: AppCheck,
    options: FireSignalOptions<AppCheckTokenResult> = {},
): FireSignal<AppCheckTokenResult> {
  return fromListenerSignal(
      (next, error, complete) => _onTokenChanged(appCheck, next, error as (error: Error) => void, complete),
      options,
  );
}

export function setTokenAutoRefreshEnabledSignal(
    appCheck: AppCheck,
    isTokenAutoRefreshEnabled: boolean,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(
      () => _setTokenAutoRefreshEnabled(appCheck, isTokenAutoRefreshEnabled),
      options,
  );
}
