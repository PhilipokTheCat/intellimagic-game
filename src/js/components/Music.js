import {Howler, Howl} from "howler";

export default class Music {
    constructor(tracks) {
        this.volume = 0.5;
        this.tracksArr = tracks;
        this.tracksArr.forEach(el => {
            el.volume(this.volume);
            el.on("end", () => this.play());
        });
        this.currentTrack;
    }

    play() {
        this.currentTrack = this.tracksArr[Math.floor(this.tracksArr.length * Math.random())];
        this.currentTrack.play();
    }
}