export declare class StorageAdapter {
    getItem: (key: string) => Promise<any>;
    setItem: (key: string, value: any) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    serialize?: (value: any) => string;
    deserialize?: (json: any) => any;
}
