import $ from "jquery";
import {damageScale} from './../constants.js';

export default class RecordsEngine {
    constructor(name, winsCount, callback) {
        this.playerName = name;
        this.playerWinsCount = winsCount;
        this.callback = callback;
    }

    init() {
        this.updateRecordsTable();
        let position = this.getPosition();
        let table = JSON.parse(window.localStorage.getItem('recordsTable'));
        let modalMarkup = $(`
            <div class="records">
                <div class="records__header">
                    <p class="records__text records__header-text">игра окончена</p>
                </div>
                <div class="records__blocks-wrapper">
                    <div class="records__block">
                        <p class="records__text records__name">${this.playerName}</p>
                        <div class="records__text-block-wrapper">
                            <p class="records__text">Побед:</p>
                            <p class="records__text records__count">${this.playerWinsCount}</p>
                        </div>
                        <div class="records__text-block-wrapper">
                            <p class="records__text">Место:</p>
                            <p class="records__text records__count">${position}</p>
                        </div>
                    </div>
                    <div class="records__block records__block--w">
                    </div>
                </div>
                <button class="records__text records__button">Начать заново</button>
            </div>
        `);
        modalMarkup.css({"background-image": "url(./src/images/ui/windows.png)"});
        modalMarkup.find(".records__name").css({"background-image": "url(./src/images/ui/header.png)"});
        const header = modalMarkup.find(".records__header").css({"background-image": "url(./src/images/ui/windows.png)"})
        const listWrapper = $(`<div class="records__list-wrapper"></div>`);
        const list = $(`<ul class="records__list"></ul>`);
        listWrapper.css({"background-image": "url(./src/images/ui/window-score.png)"});
        table.forEach((el, i) => {
            list.append($(`
            <li class="records__list-item">
                <p class="records__text records__list-item-text">${i+1}.</p>
                <p class="records__text records__list-item-text">${el.name}</p>
                <p class="records__text records__list-item-text">${el.winsCount}</p>
            </li>`));
        });
        listWrapper.append($(`<p class="records__text records__rating-title">Рейтинг игроков:</p>`)).append(list);
        modalMarkup.find(".records__block--w").append(listWrapper);
        const button = modalMarkup.find(".records__button");
        button.css({"background-image": "url(./src/images/ui/buttons.png)"});
        button.click(() => {
            window.resources.sound.play("ui", "click");
            window.resources.sound.play("ui", "start-game");
            button.off('click');
            modalMarkup.fadeTo(500, 0, () => modalMarkup.remove());
            this.callback();
        }).mouseenter(() => window.resources.sound.play("ui", "hover"));
        return modalMarkup;
    }

    updateRecordsTable() {
        let table = JSON.parse(window.localStorage.getItem('recordsTable')) || [];
        table.push({
            "name": this.playerName,
            "winsCount": this.playerWinsCount
        });
        table = table.sort((a, b) => b.winsCount - a.winsCount);
        window.localStorage.setItem('recordsTable', JSON.stringify(table));
    }

    getPosition() {
        let table = JSON.parse(window.localStorage.getItem('recordsTable'));
        for (let i = 0; i < table.length; i++) 
            if ((table[i].name === this.playerName) && (table[i].winsCount === this.playerWinsCount))
                return i + 1;
    }
}