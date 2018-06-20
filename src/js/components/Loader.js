import {createPathArrayFromResources, createPathAudioArray} from './../utils.js';

export default class Loader {
    constructor() {
        this.resourceCache = {};
        this.loading = [];
        this.readyCallback = null;
    }

    load() {
        const pathArray = createPathArrayFromResources();
        //const audioArray = createPathAudioArray();
        //audioArray.forEach((el) => {this._load(el, true)});
        pathArray.forEach((el) => {this._load(el)});
    }

    _load(url, isAudio) {
        let obj = isAudio ? new Audio() : new Image();
        obj.addEventListener(isAudio ? 'canplay' : 'load', () => {
            this.resourceCache[url] = obj;
            if (this.isReady()) this.readyCallback();
        });
        this.resourceCache[url] = false;
        obj.src = url;
    }

    get(url) {
        return this.resourceCache[url];
    }

    isReady() {
        let ready = true;
        for (let imageNode in this.resourceCache)
            if (this.resourceCache.hasOwnProperty(imageNode) && !this.resourceCache[imageNode]) 
                ready = false;
        return ready;
    }

    onReady(func) {
        this.readyCallback = func;
    }
}