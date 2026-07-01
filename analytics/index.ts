import {
  getAnalytics as _getAnalytics,
  getGoogleAnalyticsClientId as _getGoogleAnalyticsClientId,
  initializeAnalytics as _initializeAnalytics,
  isSupported as _isSupported,
  logEvent as _logEvent,
  setAnalyticsCollectionEnabled as _setAnalyticsCollectionEnabled,
  setConsent as _setConsent,
  setCurrentScreen as _setCurrentScreen,
  setDefaultEventParameters as _setDefaultEventParameters,
  setUserId as _setUserId,
  setUserProperties as _setUserProperties,
  settings as _settings,
} from 'firebase/analytics';
import {FireSignal, FireSignalOptions} from '../core';
import {fromAsyncSignal, fromSyncSignal, fromVoidSignal} from '../signal-helpers';

type Analytics = import('firebase/analytics').Analytics;
type AnalyticsCallOptions = import('firebase/analytics').AnalyticsCallOptions;
type AnalyticsSettings = import('firebase/analytics').AnalyticsSettings;
type ConsentSettings = import('firebase/analytics').ConsentSettings;
type CustomEventName<T> = import('firebase/analytics').CustomEventName<T>;
type CustomParams = import('firebase/analytics').CustomParams;
type EventNameString = import('firebase/analytics').EventNameString;
type EventParams = import('firebase/analytics').EventParams;
type FirebaseApp = import('firebase/app').FirebaseApp;
type SettingsOptions = import('firebase/analytics').SettingsOptions;

export function getAnalyticsSignal(
    app?: FirebaseApp,
    options: FireSignalOptions<Analytics> = {},
): FireSignal<Analytics> {
  return fromSyncSignal(() => _getAnalytics(app), options);
}

export function getGoogleAnalyticsClientIdSignal(
    analytics: Analytics,
    options: FireSignalOptions<string> = {},
): FireSignal<string> {
  return fromAsyncSignal(() => _getGoogleAnalyticsClientId(analytics), options);
}

export function initializeAnalyticsSignal(
    app: FirebaseApp,
    analyticsOptions?: AnalyticsSettings,
    signalOptions: FireSignalOptions<Analytics> = {},
): FireSignal<Analytics> {
  return fromSyncSignal(() => _initializeAnalytics(app, analyticsOptions), signalOptions);
}

export function isSupportedSignal(
    options: FireSignalOptions<boolean> = {},
): FireSignal<boolean> {
  return fromAsyncSignal(() => _isSupported(), options);
}

export function logEventSignal<T extends string>(
    analytics: Analytics,
    eventName: EventNameString | CustomEventName<T>,
    eventParams?: EventParams,
    callOptions?: AnalyticsCallOptions,
    signalOptions: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(
      () => _logEvent(analytics, eventName as string, eventParams, callOptions),
      signalOptions,
  );
}

export function setAnalyticsCollectionEnabledSignal(
    analytics: Analytics,
    enabled: boolean,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _setAnalyticsCollectionEnabled(analytics, enabled), options);
}

export function setConsentSignal(
    consentSettings: ConsentSettings,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _setConsent(consentSettings), options);
}

export function setCurrentScreenSignal(
    analytics: Analytics,
    screenName: string,
    callOptions?: AnalyticsCallOptions,
    signalOptions: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(
      () => _setCurrentScreen(analytics, screenName, callOptions),
      signalOptions,
  );
}

export function setDefaultEventParametersSignal(
    customParams: CustomParams,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _setDefaultEventParameters(customParams), options);
}

export function settingsSignal(
    analyticsSettings: SettingsOptions,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _settings(analyticsSettings), options);
}

export function setUserIdSignal(
    analytics: Analytics,
    id: string | null,
    callOptions?: AnalyticsCallOptions,
    signalOptions: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(() => _setUserId(analytics, id, callOptions), signalOptions);
}

export function setUserPropertiesSignal(
    analytics: Analytics,
    properties: CustomParams,
    callOptions?: AnalyticsCallOptions,
    signalOptions: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromVoidSignal(
      () => _setUserProperties(analytics, properties, callOptions),
      signalOptions,
  );
}
