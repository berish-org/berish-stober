import { StorageAdapter } from '../abstract/index';
export declare class SessionStorage implements StorageAdapter {
    getItem(key: string): Promise<string>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    serialize(value: any): string;
    deserialize(json: string): any;
}
