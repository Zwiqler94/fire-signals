import {getDoc, getDocs} from 'firebase/firestore/lite';
import {FireSignal, FireSignalOptions, fromPromiseSignal} from '../../core';
import {DocumentReference, DocumentData, Query, DocumentSnapshot, QuerySnapshot} from './interfaces';

export function fromRefSignal<T=DocumentData>(
    ref: DocumentReference<T>,
    options?: FireSignalOptions<DocumentSnapshot<T>>,
): FireSignal<DocumentSnapshot<T>>;
export function fromRefSignal<T=DocumentData>(
    ref: Query<T>,
    options?: FireSignalOptions<QuerySnapshot<T>>,
): FireSignal<QuerySnapshot<T>>;
/* eslint-disable @typescript-eslint/no-explicit-any */
export function fromRefSignal<T=DocumentData>(
    ref: DocumentReference<T>|Query<T>,
    options: FireSignalOptions<any> = {},
): FireSignal<DocumentSnapshot<T> | QuerySnapshot<T>> {
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return fromPromiseSignal(() => {
    if (ref.type === 'document') {
      return getDoc<T, DocumentData>(ref);
    }
    return getDocs<T, DocumentData>(ref);
  }, options);
}
