import $ from "jquery";
import SpellEngine from "./SpellEngine.js";
import {calculateLevelScale} from './../utils.js';
import {HPScale, EnemyHPScatter, EnemyLevelScatter} from './../constants.js';

export default class Enemy {
    constructor(level) {
        this.level = level;
        this.name;
        this.maxHP;
        this.currentHP;
        this.spells = new SpellEngine(this);
    }

    init() {
        this.generateName();
        this.generateStats();
        const markup = $(`
        <div class="enemy-bar" id="enemy-bar">
            <div class="enemy-bar__level-block">
                <p class="enemy-bar__text enemy-bar__level-title">Уровень:</p>
                <p class="enemy-bar__text enemy-bar__level">${this.level}</p>
            </div>
            <div class="enemy-bar__hp-block-wrapper">
                <p class="enemy-bar__text enemy-bar__enemy-name">${this.name}</p>
                <div class="enemy-bar__hp-block">
                    <div class="enemy-bar__hp-bar" id="enemy-hp-bar"></div>
                    <p class="enemy-bar__text enemy-bar__hp-text" id="enemy-hp-text">${this.currentHP + ' / ' + this.maxHP}</p>
                </div>
            </div>
        </div>`);
        markup.find(".enemy-bar__level-block").css({"background-image": "url(./src/images/ui/windows.png)"});
        markup.find(".enemy-bar__hp-block").css({"background-image": "url(./src/images/ui/bar-wrapper.png)"});
        markup.find("#enemy-hp-bar").css({"background-image": "url(./src/images/ui/hp-bar.png)"});
        return markup;
    }

    addSprite() {
        const sprite = $(`<div class="enemy" id="enemy"></div>`);
        sprite.css({"background-image": `url(${window.resources.chars[Math.floor(window.resources.chars.length * Math.random())]})`});
        return sprite;
    }

    generateName() {
        this.name = "";
        window.resources.enemyNames.forEach((el) => {
            this.name += el[Math.floor(el.length * Math.random())] + " ";
        });
        this.name.trimRight();
    }

    generateStats() {
        this.level = this.level - Math.round(EnemyLevelScatter * Math.random());
        this.level = this.level < 1 ? 1 : this.level;
        const scaledHP = calculateLevelScale(100, HPScale, this.level);
        this.maxHP = parseInt(scaledHP - (scaledHP * EnemyHPScatter) + parseInt((scaledHP * (EnemyHPScatter * 2)) * Math.random(), 10), 10);
        this.currentHP = this.maxHP;
    }

    receiveHP(amount) {
        this.currentHP += amount;
        this.currentHP = this.currentHP < 0 ? 0 : this.currentHP > this.maxHP ? this.maxHP : this.currentHP;
        const note = $(`<p class="note note--${amount < 0 ? "damage" : "heal"}">${amount < 0 ? ("- " + (-amount)) : ("+ " + amount)}</p>`).fadeTo(0, 0);
        $(`#enemy`).append(note);
        note.fadeTo(500, 1).delay(1000).fadeTo(500, 0, () => {note.remove()});
        $("#enemy-hp-bar").css({"width": `${(this.currentHP / this.maxHP) * 100}%`, "margin-left": `${100 - (this.currentHP / this.maxHP) * 100}%`});
        $("#enemy-hp-text").text(this.currentHP + ' / ' + this.maxHP);
    }  

    castSpell(callback) {
        this.getDisplay().addClass("enemy--cast");
        let availableSpells = this.spells.getSpellsData(true).reduce((acc, el) => {if ((el.requiredLevel <= this.level) && (el.currentCooldown === 0)) acc.push(el); return acc}, []);
        const hpRestorePriority = (1 - this.currentHP / this.maxHP) * 0.6;
        let choosenSpell = null;
        const healingSpellsCount = availableSpells.reduce((acc, el) => {if (el.HPValue > 0) acc++; return acc;}, 0);
        if ((Math.random() <= hpRestorePriority) && (healingSpellsCount))
            availableSpells = availableSpells.reduce((acc, el) => {if (el.HPValue > 0) acc.push(el); return acc;}, []);
        else availableSpells = availableSpells.reduce((acc, el) => {if (el.HPValue < 0) acc.push(el); return acc;}, []);
        let index = Math.floor(availableSpells.length * Math.random());
        choosenSpell = availableSpells[index >= availableSpells.length ? index-1 : index];
        this.spells.useSpell(this.spells.getSpellsData(true).indexOf(choosenSpell), this.level, callback);
    }

    stopCasting() {
        this.getDisplay().removeClass("enemy--cast");
    }

    loose() {
        [this.getDisplay(), this.getHpBar()].forEach((el) => {
            el.delay(1000).fadeTo(500, 0, () => {el.remove()});
        });
    }

    getHP() {
        return this.currentHP;
    }

    getDisplay() {
        return $("#enemy");
    }

    getHpBar() {
        return $("#enemy-bar");
    }
}