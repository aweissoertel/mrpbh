import pkg from 'node-localstorage';
const { LocalStorage } = pkg;
let localStorage = new LocalStorage('./storage');

export function bobbyCounter() {
    let counter = localStorage.getItem('bobby');
    localStorage.setItem('bobby', ++counter);
    return(
        `Bobby gekrault! Bobby wurde schon ${counter} Mal gekrault.`
    );
}

export function aufgeklatscht(message) {
    const tagged = message.mentions?.users?.first();
    const id = tagged ? tagged.id : message.author.id;
    let counter = 0;
    if (localStorage.getItem(`aufg-${id}`)) {
        counter = localStorage.getItem(`aufg-${id}`);
    } else {
        console.log(`[DEBUG] aufgeklatscht: No entry found for this id: ${id}`);
    }
    localStorage.setItem(`aufg-${id}`, ++counter);
    return (
        `Opfer ${tagged ? tagged : message.author} ist aufgeklatscht. Schon ${counter} Mal aufgeklatscht.`
    );
}
