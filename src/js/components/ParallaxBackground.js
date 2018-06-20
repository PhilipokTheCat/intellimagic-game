import $ from "jquery";
import "jquery.transit";

export default class ParallaxBackground {
    constructor(pathArray) {
        this.pathArray = pathArray;
        this.currentBackground = this.pathArray[Math.floor(this.pathArray.length * Math.random())];
        this.mainFrame;
    }

    init() {
        this.mainFrame = $(`<div class="parallax-background" id="parallax"></div>`);
        this.addLayers();
        return this.mainFrame;
    }

    addLayers() {
        this.currentBackground.forEach((el) => {
            this.mainFrame.append(
                $(`<div class="parallax-background__layer"></div>`).css({
                    "background-image": `url(${el})`
                })
            )
        });
    }

    changeLayers(callback) {
        this.mainFrame.fadeTo(1000, 0, () => {
            Array.from(this.mainFrame.children("*")).forEach((el) => {el.remove()});
            this.currentBackground = this.pathArray[Math.floor(this.pathArray.length * Math.random())];
            this.addLayers();
            this.mainFrame.fadeTo(1000, 1, callback);
        });
    }
    
    animate(time) {
        const array = this.mainFrame.children('*');
        Array.from(array).forEach((el, i, arr) => {
            if (time) {
                const elem = $(el);
                const calcLeft = parseInt(elem.css('translate')) - this._ease(arr.length, i);
                elem.transition({x: `${calcLeft}px`}, 5000, "easeInOutQuad", () => {
                    elem.css({"transform": `translate(${(calcLeft < -2730 ? calcLeft + 2730 : calcLeft < -1365 ? calcLeft + 1365 : calcLeft)}px, 0px)`});
                });
            } 
            else {
                if (i === 0) return;
                $(el).css({"animation": `parallax-infinite ${this._ease(arr.length, i, true)}s infinite linear`});
            }
        });
    }

    changeAnimationType() {
        this.mainFrame.fadeTo(1000, 0, () => {
            let array = this.mainFrame.children('*');
            Array.from(array).forEach((el) => {
                $(el).css({"animation": "none"});
            });
            this.mainFrame.fadeTo(1000, 1);
        })
    }

    _ease(length, i, isCSSAnimation) {
        return isCSSAnimation ? (150 * ((Math.pow(length-i-1, 2)) / (Math.pow(length-1, 2))) + 5) :
            (1366 * ((Math.pow(i, 2)) / (Math.pow(length-1, 2))));
    }
}