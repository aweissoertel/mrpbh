"use strict";
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
exports.aufgeklatscht = exports.bobbyCounter = void 0;
const storageHandler_js_1 = require("./storageHandler.js");
const bStorage = new storageHandler_js_1.Storage('bobby');
const aStorage = new storageHandler_js_1.Storage('aufgeklatscht');
function bobbyCounter() {
    return __awaiter(this, void 0, void 0, function* () {
        let counter = yield bStorage.getItem('bobby');
        console.log(counter);
        counter = Number(counter);
        yield bStorage.setItem('bobby', ++counter);
        return (`Bobby gekrault! Bobby wurde schon ${counter} Mal gekrault.`);
    });
}
exports.bobbyCounter = bobbyCounter;
function aufgeklatscht(message) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const tagged = (_b = (_a = message.mentions) === null || _a === void 0 ? void 0 : _a.users) === null || _b === void 0 ? void 0 : _b.first();
        const id = tagged ? tagged.id : message.author.id;
        let counter = 0;
        const value = yield aStorage.getItem(String(id));
        if (value) {
            counter = Number(value);
            yield aStorage.setItem(String(id), ++counter);
        }
        else {
            console.log(`[DEBUG] aufgeklatscht: No entry found for this id: ${id}`);
            yield aStorage.createItem(String(id), ++counter);
        }
        return (`Opfer ${tagged ? tagged : message.author} ist aufgeklatscht. Schon ${counter} Mal aufgeklatscht.`);
    });
}
exports.aufgeklatscht = aufgeklatscht;
