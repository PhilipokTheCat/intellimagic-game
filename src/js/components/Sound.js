export default class Sound {
    constructor (obj) {
        this.soundPathObj = obj;
        this.soundPathArr = [];
        this.volume = 0.5;
    }

    init() {
        for (let i of Object.values(this.soundPathObj.ui)) this.soundPathArr.push(i);
        for (let i of Object.values(this.soundPathObj.spells)) this.soundPathArr.push(i.start, i.end);
        this.soundPathArr.forEach(el => el.volume(this.volume));
    }

    play(...args) {
        const argsArr = Array.from(args);
        if (argsArr.length === 3) {
            this.soundPathObj[argsArr[0]][argsArr[1]][argsArr[2]].play();
        }
        else {
            this.soundPathObj[argsArr[0]][argsArr[1]].play();
        }
    }
} 