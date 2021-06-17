"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
// @ts-ignore
const G = __importStar(require("grud"));
const Grud = G.default;
class Storage {
    constructor(file) {
        this.config = {
            protocol: "https",
            host: "api.github.com",
            pathPrefix: "",
            owner: process.env.GH_OWNER,
            repo: "mrpbh-store",
            personalAccessToken: process.env.GH_TOKEN,
            path: ""
        };
        this.config.path = `storage/${file}.json`;
        this.db = new Grud(this.config);
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const ans = yield this.db.find({ "id": key });
            return yield (ans === null || ans === void 0 ? void 0 : ans.count);
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = { id: String(key), count: String(value), };
            return yield this.db.update({ id: key }, data);
        });
    }
    createItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = { id: key, count: String(value), };
            return yield this.db.save(data);
        });
    }
}
exports.Storage = Storage;
