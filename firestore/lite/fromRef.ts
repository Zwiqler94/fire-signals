import {getDoc, getDocs} from 'firebase/firestore/lite';
import {FireSignal, FireSignalOptions, fromPromiseSignal} from '../../core';
import {DocumentReference, DocumentData, Query, DocumentSnapshot, QuerySnapshot} from './interfaces';

type LiteReference<T> = DocumentReference<T> | Query<T>;

export function fromRefSignal<T=DocumentData>(
    ref: DocumentReference<T>,
    options?: FireSignalOptions<DocumentSnapshot<T>>,
): FireSignal<DocumentSnapshot<T>>;
export function fromRefSignal<T=DocumentData>(
    ref: Query<T>,
    options?: FireSignalOptions<QuerySnapshot<T>>,
): FireSignal<QuerySnapshot<T>>;
export function fromRefSignal<T=DocumentData>(
    ref: LiteReference<T>,
    options: FireSignalOptions<DocumentSnapshot<T>> | FireSignalOptions<QuerySnapshot<T>> = {},
): FireSignal<DocumentSnapshot<T> | QuerySnapshot<T>> {
  if (ref.type === 'document') {
    return fromPromiseSignal(
        () => getDoc<T, DocumentData>(ref),
        options as FireSignalOptions<DocumentSnapshot<T>>,
    );
  }
  return fromPromiseSignal(
      () => getDocs<T, DocumentData>(ref),
      options as FireSignalOptions<QuerySnapshot<T>>,
  );
}
