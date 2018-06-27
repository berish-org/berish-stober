"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const ringle = require("berish-ringle");
const Adapters = require("./lib/storageAdapters");
exports.Adapters = Adapters;
const storageController_1 = require("./lib/storageController");
exports.StorageController = ringle.getSingleton(storageController_1.default);
__export(require("./lib/abstract/index"));
//# sourceMappingURL=index.js.map