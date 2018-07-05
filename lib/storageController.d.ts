import { StorageAdapter, StorageStore } from './abstract/index';
import { TypeofSerberPluginAdapter } from 'berish-serber/abstract';
export interface IStorageControllerAddStoreConfig {
    storage?: new () => StorageAdapter;
    store?: typeof StorageStore;
    serberPlugins?: TypeofSerberPluginAdapter | TypeofSerberPluginAdapter[];
}
declare class StorageController<Stores extends {
    [key: string]: StorageStore;
}> {
    stores: Stores;
    private _storageInstances;
    private _listen;
    type<Stores extends {
        [key: string]: StorageStore;
    }>(): StorageController<Stores>;
    scope(scope: string): StorageController<{
        [key: string]: StorageStore;
    }>;
    addStore(key: keyof Stores, config?: IStorageControllerAddStoreConfig): this;
    loadAll(): Promise<this>;
    listen(cb: (compArg: Stores) => void): any;
    listen(store: keyof Stores, cb: (compArg: Stores) => void): any;
    update<T = void>(cb?: (stores: Stores) => T | Promise<T>): Promise<T>;
    private writeToListen;
}
declare const _default: StorageController<{
    [key: string]: StorageStore;
}>;
export default _default;
