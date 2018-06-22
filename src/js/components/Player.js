import $ from "jquery";
import SpellEngine from "./SpellEngine.js";
import {HPScale, ExpScale, HPscale} from './../constants.js';

export default class Player {
    constructor(name, level, maxHP, charSprite) {
        this.name = name;
        this.level = level;
        this.maxHP = maxHP;
        this.currentHP = this.maxHP;
        this.maxExp = 75;
        this.currentExp = 0;
        this.killsCount = 0;
        this.spells = new SpellEngine(this);
        this.isPlayer = true;
        this.charSprite = charSprite;
    }

    init() {
        const markup = $(`
        <div class="player-bar">
            <div class="player-bar__level-block">
                <p class="player-bar__text player-bar__level-title">Уровень:</p>
                <p class="player-bar__text player-bar__level" id="level">${this.level}</p>
            </div>
            <div class="player-bar__hp-block-wrapper">
                <p class="player-bar__text player-bar__player-name">${this.name}</p>
                <duv class="player-bar__bars-wrapper">
                    <div class="player-bar__hp-block">
                        <div class="player-bar__hp-bar" id="player-hp-bar"></div>
                        <p class="player-bar__text player-bar__hp-text" id="player-hp-text">${this.currentHP + ' / ' + this.maxHP}</p>
                    </div>
                    <div class="player-bar__exp-block">
                        <div class="player-bar__exp-bar" id="player-exp-bar"></div>
                        <p class="player-bar__text player-bar__hp-text" id="player-exp-text">${this.currentExp + ' / ' + this.maxExp}</p>
                    </div>
                </div>
            </div>
        </div>`);
        markup.find(".player-bar__level-block").css({"background-image": "url(./src/images/ui/windows.png)"});
        markup.find("#player-hp-bar").css({"background-image": "url(./src/images/ui/hp-bar.png)"});
        markup.find("#player-exp-bar").css({"background-image": "url(./src/images/ui/exp-bar.png)"});
        markup.find(".player-bar__hp-block").css({"background-image": "url(./src/images/ui/bar-wrapper.png)"});
        markup.find(".player-bar__exp-block").css({"background-image": "url(./src/images/ui/bar-wrapper.png)"});
        return markup;
    }

    addSprite() {
        const sprite = $(`<div class="player" id="player"></div>`);
        sprite.css({"background-image": `url(${this.charSprite})`});
        return sprite;
    }

    receiveHP(amount, isLeveledUp) {
        this.currentHP += amount;
        if ((amount > 0) && !isLeveledUp) this.receiveExp(amount);
        this.currentHP = this.currentHP < 0 ? 0 : this.currentHP > this.maxHP ? this.maxHP : this.currentHP;
        if (!isLeveledUp){
            const note = $(`<p class="note note--${amount < 0 ? "damage" : "heal"}">${amount < 0 ? ("- " + (-amount)) : ("+ " + amount)}</p>`).fadeTo(0, 0);
            $(`#player`).append(note);
            note.fadeTo(500, 1).delay(1000).fadeTo(500, 0, () => {note.remove()});
        };
        if (amount < 0) this.getDisplay().addClass("player--damage").fadeTo(0 ,1).delay(300).fadeTo(0, 1, () => {this.getDisplay().removeClass("player--damage")});
        $("#player-hp-bar").css({"width": `${(this.currentHP / this.maxHP) * 100}%`});
        $("#player-hp-text").text(this.currentHP + ' / ' + this.maxHP);
    }

    getHP() {
        return this.currentHP;
    }

    levelUp(enoughExp) {
        this.level++;
        this.maxHP = Math.ceil(this.maxHP * HPScale);
        this.maxExp = Math.ceil(this.maxExp * ExpScale);
        this.currentExp = 0;
        $(`#level`).fadeTo(500, 0, () => {$(`#level`).text(this.level).fadeTo(500, 1)});
        this.receiveHP(this.maxHP, true);
        this.receiveExp(enoughExp, true);
    }

    receiveExp(value, isRecalled) {
        const receivedExp = isRecalled ? value : value < 0 ? -value : parseInt(value / 2, 10);
        const summaryExp = this.currentExp + receivedExp;
        this.currentExp = summaryExp > this.maxExp ? this.maxExp : summaryExp;
        $("#player-exp-bar").css({"background-image": "url(./src/images/ui/exp-bar.png)"}).animate({"width": `${(this.currentExp / this.maxExp) * 100}%`}, 300, () => {
            if (summaryExp >= this.maxExp) {
                this.resetExpBar(); 
                this.levelUp(summaryExp - this.maxExp);
            }
        });
        $("#player-exp-text").text(this.currentExp + ' / ' + this.maxExp);
    }

    resetExpBar() {
        $("#player-exp-bar").remove();
        $(".player-bar__exp-block").prepend($(`<div class="player-bar__exp-bar" id="player-exp-bar"></div>`));
    }

    castSpell(spellID, callback) {
        this.getDisplay().addClass("player--cast");
        this.spells.useSpell(spellID, this.level, callback);
    }

    stopCasting() {
        this.getDisplay().removeClass("player--cast");
    }

    walk() {
        this.getDisplay().addClass("player--walk");
    }

    stopWalking() {
        this.getDisplay().removeClass("player--walk");
    }

    getSpellsData() {
        return this.spells.getSpellsData();
    }

    getLevel() {
        return this.level;
    }

    receiveWinPoint() {
        this.killsCount++;
    }

    getKillsCount() {
        return this.killsCount;
    }

    getName() {
        return this.name;
    }

    getDisplay() {
        return $(`#player`);
    }
}