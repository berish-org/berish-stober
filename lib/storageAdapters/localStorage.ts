import { StorageAdapter } from '../abstract/index';

export class LocalStorage implements StorageAdapter {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return localStorage.removeItem(key);
  }
  serialize(value: any) {
    let json = JSON.stringify(value);
    return json;
  }

  deserialize(json: string) {
    let value = JSON.parse(json);
    return value;
  }
}
