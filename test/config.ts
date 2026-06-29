import fetch from 'cross-fetch';

export default {
  apiKey: 'demo-fire-signals-api-key',
  authDomain: 'demo-fire-signals.firebaseapp.com',
  databaseURL: 'https://demo-fire-signals-default-rtdb.firebaseio.com',
  projectId: 'demo-fire-signals',
  storageBucket: 'demo-fire-signals.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:demofiresignals0001',
  measurementId: 'G-DEMOFIRESIG',
};

const resolvedEmulatorHubResponse = (async () => {
  await new Promise((resolve) => setTimeout(resolve, 1_000));
  if (!process.env.FIREBASE_EMULATOR_HUB) throw new Error('$FIREBASE_EMULATOR_HUB not found');
  const response = await fetch(`http://${process.env.FIREBASE_EMULATOR_HUB}/emulators`);
  if (!response.ok) throw new Error('Unable to fetch emulator hub REST api.');
  return await response.json();
})();

export const resolvedAuthEmulatorPort = resolvedEmulatorHubResponse.then((it) => it.auth.port);
export const resolvedDatabaseEmulatorPort = resolvedEmulatorHubResponse.then((it) => it.database.port);
export const resolvedFirestoreEmulatorPort = resolvedEmulatorHubResponse.then((it) => it.firestore.port);
export const resolvedStorageEmulatorPort = resolvedEmulatorHubResponse.then((it) => it.storage.port);
export const resolvedFunctionsEmulatorPort = resolvedEmulatorHubResponse.then((it) => it.functions.port);
