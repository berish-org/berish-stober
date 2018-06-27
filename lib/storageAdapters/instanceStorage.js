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
class InstanceStorageSingleton {
    constructor() {
        this.items = {};
    }
    static get instance() {
        if (this._instance == null)
            this._instance = new InstanceStorageSingleton();
        return this._instance;
    }
    getItem(key) {
        return this.items[key];
    }
    setItem(key, value) {
        this.items[key] = value;
    }
    removeItem(key) {
        delete this.items[key];
    }
}
InstanceStorageSingleton._instance = null;
class InstanceStorage {
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return InstanceStorageSingleton.instance.getItem(key);
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return InstanceStorageSingleton.instance.setItem(key, value);
        });
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return InstanceStorageSingleton.instance.removeItem(key);
        });
    }
}
exports.InstanceStorage = InstanceStorage;
//# sourceMappingURL=instanceStorage.js.map