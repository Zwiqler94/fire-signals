import {
  deleteToken as _deleteToken,
  getMessaging as _getMessaging,
  getToken as _getToken,
  isSupported as _isSupported,
  onMessage as _onMessage,
  onRegistered as _onRegistered,
  onUnregistered as _onUnregistered,
  register as _register,
  unregister as _unregister,
} from 'firebase/messaging';
import {FireSignal, FireSignalOptions} from '../core';
import {
  fromAsyncSignal,
  fromListenerSignal,
  fromSyncSignal,
} from '../signal-helpers';

type FirebaseApp = import('firebase/app').FirebaseApp;
type GetTokenOptions = import('firebase/messaging').GetTokenOptions;
type MessagePayload = import('firebase/messaging').MessagePayload;
type Messaging = import('firebase/messaging').Messaging;
type RegisterOptions = import('firebase/messaging').RegisterOptions;

export function deleteTokenSignal(
    messaging: Messaging,
    options: FireSignalOptions<boolean> = {},
): FireSignal<boolean> {
  return fromAsyncSignal(() => _deleteToken(messaging), options);
}

export function getMessagingSignal(
    app?: FirebaseApp,
    options: FireSignalOptions<Messaging> = {},
): FireSignal<Messaging> {
  return fromSyncSignal(() => _getMessaging(app), options);
}

export function getTokenSignal(
    messaging: Messaging,
    tokenOptions?: GetTokenOptions,
    signalOptions: FireSignalOptions<string> = {},
): FireSignal<string> {
  return fromAsyncSignal(() => _getToken(messaging, tokenOptions), signalOptions);
}

export function isSupportedSignal(
    options: FireSignalOptions<boolean> = {},
): FireSignal<boolean> {
  return fromAsyncSignal(() => _isSupported(), options);
}

export function onMessageSignal(
    messaging: Messaging,
    options: FireSignalOptions<MessagePayload> = {},
): FireSignal<MessagePayload> {
  return fromListenerSignal((next) => _onMessage(messaging, next), options);
}

export function onRegisteredSignal(
    messaging: Messaging,
    options: FireSignalOptions<string> = {},
): FireSignal<string> {
  return fromListenerSignal((next) => _onRegistered(messaging, next), options);
}

export function onUnregisteredSignal(
    messaging: Messaging,
    options: FireSignalOptions<string> = {},
): FireSignal<string> {
  return fromListenerSignal((next) => _onUnregistered(messaging, next), options);
}

export function registerSignal(
    messaging: Messaging,
    registerOptions?: RegisterOptions,
    signalOptions: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => _register(messaging, registerOptions), signalOptions);
}

export function unregisterSignal(
    messaging: Messaging,
    options: FireSignalOptions<void> = {},
): FireSignal<void> {
  return fromAsyncSignal(() => _unregister(messaging), options);
}
