import $ from "jquery";
import "jquery.transit";
import {calculateLevelScale} from './../utils.js';
import { damageScale } from "../constants.js";
import Spell from "./Spell.js";

export default class SpellEngine {
    constructor(user) {
        this.spells = window.resources.spellsList.map((el) => new Spell(el));
        this.user = user;
    }

    getSpellData(id) {
        return {
            "currentCooldown": this.spells[id].currentCooldown,
            "requiredLevel": this.spells[id].requiredLevel
        }
    }

    getSpellsData(isAllData) {
        if (isAllData) return this.spells;
        return this.spells.map((el) => {
            return {
                "name": el.name,
                "currentCooldown": el.currentCooldown,
                "requiredLevel": el.requiredLevel,
                "iconUrl": el.iconUrl,
            };
        });
    }

    triggerGCD() {
        this.spells.forEach((el) => el.triggerCD());
    }

    useSpell(i, level, callback) {
        const spell = this.spells[i];
        switch(spell.direction) {
            case "target-front": this.castFront(spell, callback, this.calculateHP(spell, level)); break;
            case "self": this.castSelf(spell, callback, this.calculateHP(spell, level)); break;
            case "target-above": this.castAbove(spell, callback, this.calculateHP(spell, level)); break;
        }
        this.triggerGCD();
        spell.use();
    }

    calculateHP(spell, level) {
        const calculatedHPValue = calculateLevelScale(spell.HPValue, damageScale, level);
        const amount = parseInt(calculatedHPValue - (calculatedHPValue * spell.scatter) + 
            (calculatedHPValue * spell.scatter) * Math.random() * 2, 10);
        return amount;
    }

    castFront(spell, callback, amountHP) {
        const display = this.user.getDisplay(),
            {top, left} = display.position();
        const calcTop = top + (display.height() - spell.imageHeight) / 2 ,
            calcLeft = left + ((this.user.isPlayer) ? display.width() : -spell.imageWidth);
        let spellDisplay = $(`<div class="spell"></div>`).css({
            "top": `${calcTop}px`,
            "left": `${calcLeft}px`,
            "width": `${spell.imageWidth}px`,
            "height": `${spell.imageHeight}px`,
            "background-image": `url(${spell.imageUrl})`,
        });
        if (!this.user.isPlayer) spellDisplay.css({"transform": "scaleX(-1)"});
        $(".main-window").append(spellDisplay);
        spellDisplay.fadeTo(200, 1).transition({
            "left": `${calcLeft + ((this.user.isPlayer) ? 800 : -800)}px`
        }, 1000, "easeInQuad").fadeTo(100, 0, () => {
            spellDisplay.remove();
            callback(this.user, amountHP);
        });
    }

    castSelf(spell, callback, amountHP) {
        const display = this.user.getDisplay();
        let spellDisplay = $(`<div class="spell"></div>`).css({
            "width": `${spell.imageWidth}px`,
            "height": `${spell.imageHeight}px`,
            "background-image": `url(${spell.imageUrl})`,
        });
        display.append(spellDisplay);
        spellDisplay.fadeTo(500, 1).delay(750).fadeTo(500, 0, () => {
            spellDisplay.remove();
            callback(this.user, amountHP, true);
        })
    }

    castAbove(spell, callback, amountHP) {
        const display = this.user.getDisplay(),
            {top, left} = display.position();
        const spellDisplay = $(`<div class="spell"></div>`).css({
            "width": `${spell.imageWidth}px`,
            "height": `${spell.imageHeight}px`,
            "background-image": `url(${spell.imageUrl})`,
            "bottom": "20px",
            "left": `${this.user.isPlayer ? left + 965 - 50 : left - 765 - 150}px` 
        });
        if (!this.user.isPlayer) spellDisplay.css({"transform": "scaleX(-1)"});
        $(".main-window").append(spellDisplay);
        spellDisplay.fadeTo(100, 1).delay(400).fadeTo(1000, 0, () => {
            spellDisplay.remove();
            callback(this.user, amountHP);
        })
    }
}