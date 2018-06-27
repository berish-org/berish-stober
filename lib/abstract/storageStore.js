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
const index_1 = require("../storageAdapters/index");
const berish_serber_1 = require("berish-serber");
class StorageStore {
    constructor() {
        this._storage = null;
        this._storeName = null;
        this._attributes = {};
    }
    get attributes() {
        if (this._attributes == null)
            this._attributes = {};
        return this._attributes;
    }
    get storage() {
        if (this._storage == null)
            this._storage = new index_1.InstanceStorage();
        return this._storage;
    }
    set storage(value) {
        this._storage = value;
    }
    get storeName() {
        if (this._storeName == null)
            this._storeName = this.constructor.name;
        return this._storeName;
    }
    set storeName(value) {
        this._storeName = value;
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            let attributes = this.attributes;
            let temp = {};
            for (let key in attributes) {
                temp[key] = berish_serber_1.default.serialize(attributes[key]);
            }
            let value = null;
            if (this.storage.serialize)
                value = this.storage.serialize(temp);
            else
                value = temp;
            yield this.storage.setItem(`fia-stober/${this.storeName}`, value);
            return this;
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storage.removeItem(`fia-stober/${this.storeName}`);
            return this;
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let attributes = null;
            let value = yield this.storage.getItem(`fia-stober/${this.storeName}`);
            if (this.storage.deserialize)
                attributes = this.storage.deserialize(value);
            else
                attributes = value;
            let temp = {};
            for (let key in attributes) {
                temp[key] = berish_serber_1.default.deserialize(attributes[key]);
            }
            this._attributes = temp;
            return this;
        });
    }
    get(key) {
        return this.attributes[key];
    }
    set(key, value) {
        this.attributes[key] = value;
    }
}
exports.StorageStore = StorageStore;
//# sourceMappingURL=storageStore.js.map