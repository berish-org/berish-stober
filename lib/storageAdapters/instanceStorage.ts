import { StorageAdapter } from '../abstract/index';

class InstanceStorageSingleton {
  private static _instance: InstanceStorageSingleton = null;

  public static get instance() {
    if (this._instance == null) this._instance = new InstanceStorageSingleton();
    return this._instance;
  }

  private items: { [key: string]: string } = {};

  getItem(key: string) {
    return this.items[key];
  }

  setItem(key: string, value: any) {
    this.items[key] = value;
  }

  removeItem(key: string) {
    delete this.items[key];
  }
}

export class InstanceStorage implements StorageAdapter {
  async getItem(key: string) {
    return InstanceStorageSingleton.instance.getItem(key);
  }
  async setItem(key: string, value: any) {
    return InstanceStorageSingleton.instance.setItem(key, value);
  }
  async removeItem(key: string) {
    return InstanceStorageSingleton.instance.removeItem(key);
  }
}
