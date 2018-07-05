"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const collection = require("berish-collection");
const ringle = require("berish-ringle");
const berish_linq_1 = require("berish-linq");
const index_1 = require("./abstract/index");
const storageAdapters_1 = require("./storageAdapters/");
const berish_serber_1 = require("berish-serber");
class StorageController {
    constructor() {
        this.stores = {};
        this._storageInstances = new collection.Dictionary();
        this._listen = new collection.Dictionary();
    }
    type() {
        return this;
    }
    scope(scope) {
        return ringle.getSingleton(StorageController, scope);
    }
    addStore(key, config) {
        config = config || {};
        let storageInstance = null;
        config.storage = config.storage || storageAdapters_1.InstanceStorage;
        if (this._storageInstances.containsKey(config.storage))
            storageInstance = this._storageInstances.get(config.storage);
        else {
            storageInstance = new config.storage();
            this._storageInstances.add(config.storage, storageInstance);
        }
        if (this.stores[key] == null) {
            let store = new (config.store || index_1.StorageStore)();
            store.storeName = key;
            store.storage = storageInstance;
            this.stores[key] = store;
        }
        if (config.serberPlugins) {
            berish_serber_1.default.plugin(config.serberPlugins);
        }
        return this;
    }
    loadAll() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let key in this.stores) {
                let store = this.stores[key];
                store = yield store.load();
            }
            return this;
        });
    }
    listen(store, cb) {
        let name = typeof store == 'string' ? store : 'default';
        let listenArgument = typeof store == 'string' ? cb : store;
        if (!this._listen.containsKey(name))
            this._listen.add(name, []);
        this._listen.get(name).push(listenArgument);
        return () => {
            if (this._listen.containsKey(name)) {
                let all = berish_linq_1.LINQ.fromArray(this._listen.get(name))
                    .except([listenArgument])
                    .toArray();
                this._listen.remove(name);
                this._listen.add(name, all);
            }
        };
    }
    update(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = null;
            let oldAttrs = berish_linq_1.LINQ.fromArray(Object.keys(this.stores)).select(key => {
                let attr = this.stores[key].attributes;
                return {
                    key,
                    attributes: berish_linq_1.LINQ.fromArray(Object.keys(attr))
                        .orderBy(m => m)
                        .select(m => ({ key: m, value: attr[m] }))
                        .toArray()
                };
            });
            if (cb)
                res = yield cb(this.stores);
            yield this.writeToListen(oldAttrs, this.stores);
            return res;
        });
    }
    writeToListen(oldAttrs, newStores) {
        return __awaiter(this, void 0, void 0, function* () {
            let newAttrs = berish_linq_1.LINQ.fromArray(Object.keys(this.stores)).select((key) => {
                let attr = this.stores[key].attributes;
                return {
                    key,
                    store: this.stores[key],
                    attributes: berish_linq_1.LINQ.fromArray(Object.keys(attr))
                        .orderBy(m => m)
                        .select(m => ({ key: m, value: attr[m] }))
                        .toArray()
                };
            });
            for (let oldAttr of oldAttrs.toArray()) {
                let newAttr = newAttrs.firstOrNull(m => m.key == oldAttr.key);
                if (!newAttr)
                    continue;
                let o1 = oldAttr.attributes;
                let o2 = newAttr.attributes;
                let j1 = JSON.stringify(o1);
                let j2 = JSON.stringify(o2);
                if (j1 != j2) {
                    yield newAttr.store.save();
                }
            }
            let keys = newAttrs.select(m => m.key).toArray();
            for (let key of keys) {
                if (this._listen.containsKey(key)) {
                    let listeners = this._listen.get(key);
                    for (let listener of listeners) {
                        setTimeout(() => listener(this.stores), 0);
                    }
                }
            }
            if (this._listen.containsKey('default')) {
                let listeners = this._listen.get('default');
                for (let listener of listeners) {
                    setTimeout(() => listener(this.stores), 0);
                }
            }
        });
    }
}
exports.default = ringle.getSingleton(StorageController);
//# sourceMappingURL=storageController.js.map