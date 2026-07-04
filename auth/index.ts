/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {Auth} from 'firebase/auth';
import {onAuthStateChanged, onIdTokenChanged, getIdToken} from 'firebase/auth';
import {createFireSignal, FireSignal, FireSignalOptions} from '../core';

type User = import('firebase/auth').User;

/**
 * Create a FireSignal of authentication state. The listener is only
 * triggered on sign-in or sign-out.
 * @param auth firebase.auth.Auth
 */
export function authStateSignal(
    auth: Auth,
    options: FireSignalOptions<User | null> = {},
): FireSignal<User | null> {
  return createFireSignal((controller) => {
    return onAuthStateChanged(
        auth,
        (user) => controller.next(user),
        (error) => controller.error(error),
        () => controller.complete(),
    );
  }, options);
}

/**
 * Create a FireSignal of user state. The listener is triggered for sign-in,
 * sign-out, and token refresh events
 * @param auth firebase.auth.Auth
 */
export function userSignal(
    auth: Auth,
    options: FireSignalOptions<User | null> = {},
): FireSignal<User | null> {
  return createFireSignal((controller) => {
    return onIdTokenChanged(auth,
        (user) => controller.next(user),
        (error) => controller.error(error),
        () => controller.complete(),
    );
  }, options);
}

/**
 * Create a FireSignal of idToken state. The listener is triggered for sign-in,
 * sign-out, and token refresh events
 * @param auth firebase.auth.Auth
 */
export function idTokenSignal(
    auth: Auth,
    options: FireSignalOptions<string | null> = {},
): FireSignal<string | null> {
  return createFireSignal((controller) => {
    let sequence = 0;
    return onIdTokenChanged(auth,
        (user) => {
          sequence++;
          const current = sequence;
          if (!user) {
            controller.next(null);
            return;
          }
          controller.loading();
          getIdToken(user).then(
              (token) => {
                if (current === sequence) {
                  controller.next(token);
                }
              },
              (error) => {
                if (current === sequence) {
                  controller.error(error);
                }
              },
          );
        },
        (error) => controller.error(error),
        () => controller.complete(),
    );
  }, options);
}
