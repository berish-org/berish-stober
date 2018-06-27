import * as collection from 'berish-collection';
import { LINQ } from 'berish-linq';
import { StorageAdapter, StorageStore } from './abstract/index';
import { InstanceStorage } from './storageAdapters/';
import Serber from 'berish-serber';
import { TypeofSerberPluginAdapter } from 'berish-serber/abstract';

export interface IStorageControllerAddStoreConfig {
  storage?: new () => StorageAdapter;
  store?: typeof StorageStore;
  serberPlugins?: TypeofSerberPluginAdapter | TypeofSerberPluginAdapter[];
}

export default class StorageController<Stores extends { [key: string]: StorageStore }> {
  public stores: Stores = {} as any;
  private _storageInstances = new collection.Dictionary<typeof StorageAdapter, StorageAdapter>();
  private _listen: ((stores: Stores) => void)[] = [];

  addStore(key: keyof Stores, config?: IStorageControllerAddStoreConfig) {
    config = config || {};
    let storageInstance: StorageAdapter = null;
    config.storage = config.storage || InstanceStorage;
    if (this._storageInstances.containsKey(config.storage)) storageInstance = this._storageInstances.get(config.storage);
    else {
      storageInstance = new config.storage();
      this._storageInstances.add(config.storage, storageInstance);
    }

    if (this.stores[key] == null) {
      let store = new (config.store || StorageStore)();
      store.storeName = key as string;
      store.storage = storageInstance;
      this.stores[key] = store;
    }

    if (config.serberPlugins) {
      Serber.plugin(config.serberPlugins);
    }

    return this;
  }

  async loadAll() {
    for (let key in this.stores) {
      let store = this.stores[key];
      store = await store.load();
    }
    return this;
  }

  public listen(cb: (compArg: Stores) => void) {
    this._listen.push(cb);
    return () => {
      let indexOf = this._listen.indexOf(cb);
      if (indexOf >= 0) this._listen.splice(indexOf, 1);
    };
  }

  async update<T = void>(cb?: (stores: Stores) => T | Promise<T>) {
    let res: T = null;
    let oldAttrs = LINQ.fromArray(Object.keys(this.stores)).select(key => {
      let attr = this.stores[key].attributes;
      return {
        key,
        attributes: LINQ.fromArray(Object.keys(attr))
          .orderBy(m => m)
          .select(m => ({ key: m, value: attr[m] }))
          .toArray()
      };
    });
    if (cb) res = await cb(this.stores);
    await this.writeToListen(oldAttrs, this.stores);
    return res;
  }

  private async writeToListen(
    oldAttrs: LINQ<{
      key: string;
      attributes: {
        key: string;
        value: string;
      }[];
    }>,
    newStores: Stores
  ) {
    let newAttrs = LINQ.fromArray(Object.keys(this.stores)).select(key => {
      let attr = this.stores[key].attributes;
      return {
        key,
        store: this.stores[key],
        attributes: LINQ.fromArray(Object.keys(attr))
          .orderBy(m => m)
          .select(m => ({ key: m, value: attr[m] }))
          .toArray()
      };
    });
    for (let oldAttr of oldAttrs.toArray()) {
      let newAttr = newAttrs.firstOrNull(m => m.key == oldAttr.key);
      if (!newAttr) continue;
      let o1 = oldAttr.attributes;
      let o2 = newAttr.attributes;
      let j1 = JSON.stringify(o1);
      let j2 = JSON.stringify(o2);
      if (j1 != j2) {
        await newAttr.store.save();
      }
    }
    // setImmediate(() => GlobalComponentArgs.save(this.componentArgs.global));
    for (let l of this._listen) setImmediate(() => l(this.stores));
  }
}
