import {Howler, Howl} from "howler";

export default class Music {
    constructor(tracks) {
        this.volume = 0.14;
        this.tracksArr = tracks;
        this.tracksArr.forEach(el => {
            el.on("end", () => this.play());
            el.on("fade", el.stop());
        });
        this.currentTrack;
    }

    play() {
        this.currentTrack = this.tracksArr[Math.floor(this.tracksArr.length * Math.random())];
        this.currentTrack.volume(this.volume);
        this.currentTrack.play();
    }

    stop() {
        this.currentTrack.fade(this.volume, 0, 1000);
        setTimeout(() => {this.currentTrack.stop()}, 500);
    }
}