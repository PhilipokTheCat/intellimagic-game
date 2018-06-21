import {createPathArrayFromResources, createPathAudioArray} from './../utils.js';
import $ from "jquery";
import {Howler, Howl} from 'howler';

export default class Loader {
    constructor() {
        this.resourceCache = {};
        this.readyCallback = null;
        this.maxLoadCount = 2;
        this.currentLoadCount = 0;
    }

    load(){
        const imagesArray = createPathArrayFromResources();
        imagesArray.forEach((el) => {this._loadImage(el)});
        const audioArray = createPathAudioArray();
        audioArray.forEach((el) => {this._loadAudio(el)});
    }

    get(url) {
        return this.resourceCache[url];
    }

    _loadImage(url) {
        let img = new Image();
        img.addEventListener('load', () => {
            this.resourceCache[url] = img;
            if (this.isReady()) this.readyCallback()
        });
        this.resourceCache[url] = false;
        img.src = url;
    }

    _loadAudio(url) {
        let audio = new Howl({
            src: url,
            onload: () => {
                this.resourceCache[url] = audio;
                if (this.isReady()) this.readyCallback();
            }
        });
        this.resourceCache[url] = false;
    }

    isReady() {
        let ready = true;
        for (let node in this.resourceCache)
            if (this.resourceCache.hasOwnProperty(node) && !this.resourceCache[node]) 
                ready = false;
        return ready;
    }

    onReady(func) {
        this.readyCallback = func;
    }
}