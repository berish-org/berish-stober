import { StorageAdapter } from '../abstract/index';
export declare class InstanceStorage implements StorageAdapter {
    getItem(key: string): Promise<string>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<void>;
}
