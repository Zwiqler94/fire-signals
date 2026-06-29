import {
  getDownloadURL as _getDownloadURL,
  getMetadata as _getMetadata,
  uploadBytesResumable as _uploadBytesResumable,
  uploadString as _uploadString,
} from 'firebase/storage';
import {createFireSignal, FireSignal, FireSignalOptions, fromPromiseSignal, mapFireSignal} from '../core';

import type {
  FullMetadata,
  UploadTaskSnapshot,
  StorageReference,
  UploadMetadata,
  StringFormat,
  UploadTask,
  UploadResult,
} from 'firebase/storage';

function taskToSignal(
    task: UploadTask,
    options: FireSignalOptions<UploadTaskSnapshot> = {},
    cancelOnDestroy = false,
): FireSignal<UploadTaskSnapshot> {
  return createFireSignal((controller) => {
    let done = false;
    controller.next(task.snapshot);
    const unsubscribe = task.on(
        'state_changed',
        (snapshot) => controller.next(snapshot),
        (error) => {
          done = true;
          controller.error(error);
        },
    );
    task.then(
        (snapshot) => {
          done = true;
          controller.next(snapshot);
          controller.complete();
        },
        (error) => {
          done = true;
          controller.error(error);
        },
    );
    return () => {
      unsubscribe();
      if (cancelOnDestroy && !done) {
        task.cancel();
      }
    };
  }, options);
}

export function fromTaskSignal(
    task: UploadTask,
    options: FireSignalOptions<UploadTaskSnapshot> = {},
): FireSignal<UploadTaskSnapshot> {
  return taskToSignal(task, options);
}

export function getDownloadURLSignal(
    ref: StorageReference,
    options: FireSignalOptions<string> = {},
): FireSignal<string> {
  return fromPromiseSignal(() => _getDownloadURL(ref), options);
}

export function getMetadataSignal(
    ref: StorageReference,
    options: FireSignalOptions<FullMetadata> = {},
): FireSignal<FullMetadata> {
  return fromPromiseSignal(() => _getMetadata(ref), options);
}

export function uploadBytesResumableSignal(
    ref: StorageReference,
    data: Blob | Uint8Array | ArrayBuffer,
    metadata?: UploadMetadata,
    options: FireSignalOptions<UploadTaskSnapshot> = {},
): FireSignal<UploadTaskSnapshot> {
  const task = _uploadBytesResumable(ref, data, metadata);
  return taskToSignal(task, options, true);
}

export function uploadStringSignal(
    ref: StorageReference,
    data: string,
    format?: StringFormat,
    metadata?: UploadMetadata,
    options: FireSignalOptions<UploadResult> = {},
): FireSignal<UploadResult> {
  return fromPromiseSignal(() => _uploadString(ref, data, format, metadata), options);
}

export function percentageSignal(
    task: UploadTask,
    options: FireSignalOptions<{
      progress: number;
      snapshot: UploadTaskSnapshot;
    }> = {},
): FireSignal<{
  progress: number;
  snapshot: UploadTaskSnapshot;
}> {
  return mapFireSignal(
      fromTaskSignal(task, {
        injector: options.injector,
        debugName: options.debugName,
      }),
      (snapshot) => ({
        progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        snapshot,
      }),
      options,
  );
}
