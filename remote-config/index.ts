import {FireSignal, FireSignalOptions, fromPromiseSignal} from '../core';

type RemoteConfig = import('firebase/remote-config').RemoteConfig;
type RemoteConfigValue = import('firebase/remote-config').Value;

import {
  ensureInitialized,
  getValue as baseGetValue,
  getString as baseGetString,
  getNumber as baseGetNumber,
  getBoolean as baseGetBoolean,
  getAll as baseGetAll,
} from 'firebase/remote-config';

export type AllParameters = {
  [key: string]: RemoteConfigValue;
};

interface ParameterSettings<T> {
  remoteConfig: RemoteConfig;
  key: string;
  getter: (remoteConfig: RemoteConfig, key: string) => T;
}

function parameterSignal<T>(
    {remoteConfig, key, getter}: ParameterSettings<T>,
    options: FireSignalOptions<T> = {},
): FireSignal<T> {
  return fromPromiseSignal(async () => {
    await ensureInitialized(remoteConfig);
    return getter(remoteConfig, key);
  }, options);
}

export function getValueSignal(
    remoteConfig: RemoteConfig,
    key: string,
    options: FireSignalOptions<RemoteConfigValue> = {},
): FireSignal<RemoteConfigValue> {
  return parameterSignal({remoteConfig, key, getter: baseGetValue}, options);
}

export function getStringSignal(
    remoteConfig: RemoteConfig,
    key: string,
    options: FireSignalOptions<string> = {},
): FireSignal<string> {
  return parameterSignal({remoteConfig, key, getter: baseGetString}, options);
}

export function getNumberSignal(
    remoteConfig: RemoteConfig,
    key: string,
    options: FireSignalOptions<number> = {},
): FireSignal<number> {
  return parameterSignal({remoteConfig, key, getter: baseGetNumber}, options);
}

export function getBooleanSignal(
    remoteConfig: RemoteConfig,
    key: string,
    options: FireSignalOptions<boolean> = {},
): FireSignal<boolean> {
  return parameterSignal({remoteConfig, key, getter: baseGetBoolean}, options);
}

export function getAllSignal(
    remoteConfig: RemoteConfig,
    options: FireSignalOptions<AllParameters> = {},
): FireSignal<AllParameters> {
  return parameterSignal({
    remoteConfig,
    key: '',
    getter: (config) => baseGetAll(config),
  }, options);
}
