import { bobbyCounter, aufgeklatscht } from './counter.js';

export function messageHandler(message){
    const format = message.content.toLowerCase().trim();
    switch (format) {
        case 'bobby':
        case 'bobby kraulen':
            bobbyCounter()
                .then(reply => { message.reply(reply) })
            return;
    }
    if (message.content.toLowerCase().startsWith('aufgeklatscht')) {
        aufgeklatscht(message)
            .then(reply => { message.reply(reply) });
    }
}
