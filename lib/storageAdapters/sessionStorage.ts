import { StorageAdapter } from '../abstract/index';

export class SessionStorage implements StorageAdapter {
  async getItem(key: string) {
    return sessionStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return sessionStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return sessionStorage.removeItem(key);
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
