import { StorageAdapter, StorageStore } from './abstract/index';
import { TypeofSerberPluginAdapter } from 'berish-serber/abstract';
export interface IStorageControllerAddStoreConfig {
    storage?: new () => StorageAdapter;
    store?: typeof StorageStore;
    serberPlugins?: TypeofSerberPluginAdapter | TypeofSerberPluginAdapter[];
}
export default class StorageController<Stores extends {
    [key: string]: StorageStore;
}> {
    stores: Stores;
    private _storageInstances;
    private _listen;
    addStore(key: keyof Stores, config?: IStorageControllerAddStoreConfig): this;
    loadAll(): Promise<this>;
    listen(cb: (compArg: Stores) => void): () => void;
    update<T = void>(cb?: (stores: Stores) => T | Promise<T>): Promise<T>;
    private writeToListen;
}
