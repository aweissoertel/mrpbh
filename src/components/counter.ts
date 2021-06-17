import { Storage } from './storageHandler.js';

const bStorage = new Storage('bobby');
const aStorage = new Storage('aufgeklatscht');

export async function bobbyCounter() {
    let counter = await bStorage.getItem('bobby');
    console.log(counter);
    counter = Number(counter);
    await bStorage.setItem('bobby', ++counter);
    return(
        `Bobby gekrault! Bobby wurde schon ${counter} Mal gekrault.`
    );
}

export async function aufgeklatscht(message) {
    const tagged = message.mentions?.users?.first();
    const id = tagged ? tagged.id : message.author.id;
    let counter = 0;
    const value = await aStorage.getItem(String(id));
    if (value) {
        counter = Number(value);
        await aStorage.setItem(String(id), ++counter);
    } else {
        console.log(`[DEBUG] aufgeklatscht: No entry found for this id: ${id}`);
        await aStorage.createItem(String(id), ++counter);
    }
    return (
        `Opfer ${tagged ? tagged : message.author} ist aufgeklatscht. Schon ${counter} Mal aufgeklatscht.`
    );
}
