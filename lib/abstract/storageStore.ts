import { InstanceStorage } from '../storageAdapters/index';
import { StorageAdapter } from './index';
import Serber from 'berish-serber';

export class StorageStore {
  private _storage: StorageAdapter = null;
  private _storeName: string = null;
  private _attributes: {
    [key: string]: any;
  } = {};

  get attributes() {
    if (this._attributes == null) this._attributes = {};
    return this._attributes;
  }

  get storage() {
    if (this._storage == null) this._storage = new InstanceStorage();
    return this._storage;
  }

  set storage(value: StorageAdapter) {
    this._storage = value;
  }

  get storeName() {
    if (this._storeName == null) this._storeName = this.constructor.name;
    return this._storeName;
  }

  set storeName(value: string) {
    this._storeName = value;
  }

  async save() {
    let attributes: { [key: string]: any } = this.attributes;
    let temp: { [key: string]: any } = {};
    for (let key in attributes) {
      temp[key] = Serber.serialize(attributes[key]);
    }
    let value: string | { [key: string]: any } = null;
    if (this.storage.serialize) value = this.storage.serialize(temp);
    else value = temp;

    await this.storage.setItem(`fia-stober/${this.storeName}`, value);
    return this;
  }

  async destroy() {
    await this.storage.removeItem(`fia-stober/${this.storeName}`);
    return this;
  }

  async load() {
    let attributes: { [key: string]: any } = null;
    let value: string | { [key: string]: any } = await this.storage.getItem(`fia-stober/${this.storeName}`);

    if (this.storage.deserialize) attributes = this.storage.deserialize(value);
    else attributes = value as { [key: string]: any };

    let temp: { [key: string]: any } = {};
    for (let key in attributes) {
      temp[key] = Serber.deserialize(attributes[key]);
    }

    this._attributes = temp;
    return this;
  }

  get(key: string) {
    return this.attributes[key];
  }

  set(key: string, value: any) {
    this.attributes[key] = value;
  }
}
