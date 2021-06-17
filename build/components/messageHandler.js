"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageHandler = void 0;
var counter_js_1 = require("./counter.js");
function messageHandler(message) {
    var format = message.content.toLowerCase().trim();
    switch (format) {
        case 'bobby':
        case 'bobby kraulen':
            counter_js_1.bobbyCounter()
                .then(function (reply) { message.reply(reply); });
            return;
    }
    if (message.content.toLowerCase().startsWith('aufgeklatscht')) {
        counter_js_1.aufgeklatscht(message)
            .then(function (reply) { message.reply(reply); });
    }
}
exports.messageHandler = messageHandler;
