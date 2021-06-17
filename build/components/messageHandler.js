"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageHandler = void 0;
const counter_js_1 = require("./counter.js");
function messageHandler(message) {
    const format = message.content.toLowerCase().trim();
    switch (format) {
        case 'bobby':
        case 'bobby kraulen':
            counter_js_1.bobbyCounter()
                .then(reply => { message.reply(reply); });
            return;
    }
    if (message.content.toLowerCase().startsWith('aufgeklatscht')) {
        counter_js_1.aufgeklatscht(message)
            .then(reply => { message.reply(reply); });
    }
}
exports.messageHandler = messageHandler;
