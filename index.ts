import * as ringle from 'berish-ringle';
import * as Adapters from './lib/storageAdapters'
import StorageControllerClass from './lib/storageController';
export const StorageController = ringle.getSingleton(StorageControllerClass);

export * from './lib/abstract/index';
export {
    Adapters
}
