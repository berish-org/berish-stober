import { Serber as SerberClass } from 'berish-serber/dist/lib/serber';

const SYMBOL_STORAGE_NAME = Symbol('storage name');
const STORAGEPREFIX = 'BERISH-STOBER';

export interface IStorageAdapter {
  getItem: (key: string) => Promise<any>;
  setItem: (key: string, value: any) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  onChange?: (cb: (key: string, value: any) => void) => (() => void);
}

export class Storage {
  protected storageAdapter: IStorageAdapter = null;
  protected serber: SerberClass = null;
  private [SYMBOL_STORAGE_NAME]: string = null;

  constructor(storageAdapter: IStorageAdapter) {
    this.storageAdapter = storageAdapter;
  }

  public setSerber(serber: SerberClass) {
    this.serber = serber;
    return this;
  }

  public setStorageName(value: string) {
    this[SYMBOL_STORAGE_NAME] = value;
    return this;
  }

  public getStorageName() {
    return this[SYMBOL_STORAGE_NAME] || STORAGEPREFIX;
  }

  public async save(state: any) {
    const newState = (this.serber && (await this.serber.serializeAsync(state))) || state;
    const newStateStringify = JSON.stringify(newState);
    return this.storageAdapter.setItem(this.getStorageName(), newStateStringify);
  }

  public async load() {
    const stateStringify = await this.storageAdapter.getItem(this.getStorageName());
    const newState = JSON.parse(stateStringify);
    return (this.serber && (await this.serber.deserializeAsync(newState))) || newState;
  }

  public async clear() {
    await this.storageAdapter.removeItem(this.getStorageName());
  }

  public onChange(cb: (state: any) => void) {
    if (this.storageAdapter.onChange) {
      this.storageAdapter.onChange((key, value) => {
        if (key === this.getStorageName()) {
          const newState = JSON.parse(value);
          const state = (this.serber && this.serber.deserialize(newState)) || newState;
          cb(state);
        }
      });
    }
  }
}
