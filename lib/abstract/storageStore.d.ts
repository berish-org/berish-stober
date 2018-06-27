import { StorageAdapter } from './index';
export declare class StorageStore {
    private _storage;
    private _storeName;
    private _attributes;
    readonly attributes: {
        [key: string]: any;
    };
    storage: StorageAdapter;
    storeName: string;
    save(): Promise<this>;
    destroy(): Promise<this>;
    load(): Promise<this>;
    get(key: string): any;
    set(key: string, value: any): void;
}
