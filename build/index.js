"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = __importDefault(require("discord.js"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var messageHandler_js_1 = require("./components/messageHandler.js");
var client = new discord_js_1.default.Client();
client.login(process.env.TOKEN);
client.once('ready', function () {
    var _a;
    console.log('Bot started up');
    (_a = client.user) === null || _a === void 0 ? void 0 : _a.setPresence({ status: 'dnd', activity: { name: 'you 👀', type: 'WATCHING' } }).catch(console.error);
});
client.on('message', function (message) {
    if (message.author.bot)
        return;
    messageHandler_js_1.messageHandler(message);
});
