import { Serber as SerberClass } from 'berish-serber/dist/lib/serber';

const STORAGEPREFIX = 'BERISH-SERBER';

export interface IStorageAdapter {
  getItem: (key: string) => Promise<any>;
  setItem: (key: string, value: any) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export class Storage {
  protected storageName: string = null;
  protected storageAdapter: IStorageAdapter = null;
  protected serber: SerberClass = null;

  constructor(storageAdapter: IStorageAdapter) {
    this.storageAdapter = storageAdapter;
  }

  public setSerber(serber: SerberClass) {
    this.serber = serber;
    return this;
  }

  public setStorageName(value: string) {
    this.storageName = value;
    return this;
  }

  public async save(state: any) {
    const newState = (this.serber && (await this.serber.serializeAsync(state))) || state;
    const newStateStringify = JSON.stringify(newState);
    return this.storageAdapter.setItem(this.storageName, newStateStringify);
  }

  public async load() {
    const stateStringify = await this.storageAdapter.getItem(this.storageName);
    const newState = JSON.parse(stateStringify);
    return (this.serber && this.serber.deserialize(newState)) || newState;
  }

  public async clear() {
    await this.storageAdapter.removeItem(this.storageName);
  }
}
