import {imagesFolderPath} from './constants.js'

export function createPathArrayFromResources() {
    const arr = [];
    window.resources.background.forEach((el) => {
        el.forEach((elem) => {arr.push(elem)});
    });
    window.resources.chars.forEach((el) => arr.push(el));
    window.resources.spellsList.forEach((el) => {
        arr.push(el.iconUrl, el.image.url);
    });
    window.resources.ui.forEach((el) => {
        arr.push(el);
    })
    return arr;
}

export function createPathAudioArray() {
    const arr = [];
    window.resources.audio.music.forEach((el) => {
        arr.push(el);
    });
    for (let i of Object.values(window.resources.audio.ui)) arr.push(i);
    for (let i of Object.values(window.resources.audio.spells)) arr.push(i.start, i.end);
    return arr;
}

export function createSoundObj(obj, loader) {
    for (let i in obj.ui) {
        obj.ui[i] = loader.get(obj.ui[i]);
    }
    for (let i in obj.spells) {
        obj.spells[i].start = loader.get(obj.spells[i].start);
        obj.spells[i].end = loader.get(obj.spells[i].end);
    }
    return obj;
}

export function calculateLevelScale(amount, multiplier, level) {
    if (level === 1) return amount;
    return calculateLevelScale(amount * multiplier, multiplier, level - 1);
}