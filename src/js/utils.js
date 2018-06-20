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
    window.resources.audio.forEach((el) => {
        arr.push(el);
    });
    return arr;
}

export function calculateLevelScale(amount, multiplier, level) {
    if (level === 1) return amount;
    return calculateLevelScale(amount * multiplier, multiplier, level - 1);
}