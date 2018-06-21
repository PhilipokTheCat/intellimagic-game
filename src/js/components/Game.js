import Loader from './Loader.js';
import HttpClient from './HttpClient.js';
import $ from "jquery";
import "jquery.transit";
import Player from './Player.js';
import Enemy from './Enemy.js';
import ParallaxBackground from './ParallaxBackground.js';
import RecordsEngine from './RecordsEngine.js';
import QuestionsEngine from './QuestionsEngine.js';
import Music from './Music.js';
import Sound from './Sound.js';
import {createSoundObj} from './../utils.js';

export default class Game {
    constructor(DOMNode) {        
        this.mainBlock = $(DOMNode);
        this.loader = new Loader;
        this.httpClient = new HttpClient;
        this.questionsEngine;
        this.background;
        this.player;
        this.enemy;
        this.modalLayer = $(`<div class="modal-layer"></div>`);
        this.isPlayerTurn = false;
        this.jsonLoaded = 0;
    }

    load() {
        window.speechSynthesis.getVoices();
        this.loader.onReady(() => {
            const loader = $('.game-block__loader');
            loader.fadeTo(1000, 0, () => {
                loader.remove();
                this.start();
            })
        });
        this.httpClient.get("spells").then(data => {window.resources.spellsList = data; this.jsonLoaded++; if (this.jsonLoaded === 4) this.loader.load();});
        this.httpClient.get("enemyNames").then(data => {window.resources.enemyNames = data; this.jsonLoaded++; if (this.jsonLoaded === 4) this.loader.load();});
        this.httpClient.get("imagesUrl").then(data => {
            this.jsonLoaded++;
            this.background = new ParallaxBackground(data.background);
            window.resources.chars = data.chars; 
            window.resources.background = data.background;
            window.resources.ui = data.ui;
            if (this.jsonLoaded === 4) this.loader.load();
        });
        this.httpClient.get("questions").then(data => window.resources.questions = data);
        this.httpClient.get("audio").then(data => {
            window.resources.audio = data;
            this.jsonLoaded++;
            if (this.jsonLoaded === 4) this.loader.load();
        });
    }

    start() {
        window.resources.music = new Music(window.resources.audio.music.map((el) => {
            return this.loader.get(el);
        }));
        window.resources.sound = new Sound(createSoundObj({"ui": window.resources.audio.ui, "spells": window.resources.audio.spells}, this.loader));
        window.resources.sound.init();
        window.resources.music.play();
        let backgroundMarkup = this.background.init().fadeTo(0, 0);
        let startBlock = $('<div></div>').addClass('start-block').fadeTo(0, 0),
            startBlockLogo = $('<p></p>').addClass('start-block__logo').text("intellimagic"),
            startBlockButton = $('<button></button>').addClass('start-block__button').text('старт').click(()=>{
                window.resources.sound.play("ui", "click");
                startBlock.fadeTo(1000, 0, ()=>{startBlock.remove(); this.showCharSettings()});
                startBlockButton.off("click");
            });
        startBlockButton.css({
            "background-image": `url(./src/images/ui/buttons.png)`
        }).mouseenter(() => window.resources.sound.play("ui", "hover"));
        startBlock.append(startBlockLogo).append(startBlockButton);
        this.mainBlock.append(backgroundMarkup).append(startBlock);
        this.background.animate();
        startBlock.fadeTo(1000, 1, () => {backgroundMarkup.fadeTo(1000, 1)});
    } 

    showCharSettings() {
        let markup = $(`
            <div class="char-block">
                <div class="char-block__container">
                    <p class="char-block__title-text" id="name-title">Введи своё имя:</p>
                    <input type="text" class="char-block__input" id="name-input" required autofocus/>
                    <p class="char-block__title-text char-block__description">Имя может содержать буквы русского и латинского алфавита, тире, нижние подчеркивания и точки. </br>Длина имени: от 2 до 18 символов.</p>
                </div>
                <div class="char-block__container">
                    <p class="char-block__title-text">Выбери персонажа:</p>
                    <div class="char-block__image-wrapper">
                        <button class="char-block__button" id="button-left"></button>
                        <div class="char-block__image" data-image-id="0"></div>
                        <button class="char-block__button" id="button-right"></button>
                    </div>
                </div>
                <div class="char-block__container">
                    <button class="char-block__submit" id="submit">Начать игру</button>
                </div>
            </div>
        `);
        markup.css({"background-image": "url(./src/images/ui/windows.png)"});
        markup.find(`#name-input`).css({"background-image": "url(./src/images/ui/windows.png)"}).focus();
        this.modalLayer.append(markup);
        markup.fadeTo(0, 0);
        this.mainBlock.append(this.modalLayer);
        const image = $(".char-block__image");
        let currentChar = 0;
        image.css({"background-image": `url(${window.resources.chars[currentChar]})`});
        const leftButton = $(`#button-left`).click(() => {
            window.resources.sound.play("ui", "click");
            currentChar--;
            if (currentChar < 0) currentChar = window.resources.chars.length-1;
            image.css({"background-image": `url(${window.resources.chars[currentChar]})`});
        }).css({"background-image": "url(./src/images/ui/buttons.png)"}).mouseenter(() => window.resources.sound.play("ui", "hover"));
        const rightButton = $(`#button-right`).click(() => {
            window.resources.sound.play("ui", "click");
            currentChar++;
            if (currentChar > window.resources.chars.length-1) currentChar = 0;
            image.css({"background-image": `url(${window.resources.chars[currentChar]})`});
        }).css({"background-image": "url(./src/images/ui/buttons.png)"}).mouseenter(() => window.resources.sound.play("ui", "hover"));
        const submitButton = $("#submit");
        submitButton.css({"background-image": "url(./src/images/ui/buttons.png)"})
        submitButton.mouseenter(() => window.resources.sound.play("ui", "hover"));
        submitButton.click(() => {  
            window.resources.sound.play("ui", "click");
            const name = $("#name-input").val();
            if (/^[a-zA-Zа-яА-Я0-9_\-.]{2,18}$/.test(name)) {
                submitButton.off('click'); 
                this.background.changeAnimationType();
                markup.fadeTo(1000, 0, () => {
                    this.player = new Player(name, 1, 100, window.resources.chars[currentChar]);
                    this.enemy = new Enemy(1);
                    markup.remove();
                    this.main();
                });
            }
            else {
                const nameTitle = $("#name-title");
                nameTitle.fadeTo(300, 0, () => {
                    nameTitle.text("Неправильное имя!").addClass("char-block__title-text--err").fadeTo(500, 1);
                })
            }
        });
        markup.find("#name-input").keypress(
            (e) => {if (e.which === 13) submitButton.click();});
        markup.fadeTo(1000, 1);
    }

    main() {
        const gameWindow = $(`<div class="main-window"></div>`);
        gameWindow.append(this.player.init()).append(this.player.addSprite()).append(this.enemy.init()).append(this.enemy.addSprite());
        gameWindow.fadeTo(0, 0);
        this.mainBlock.append(gameWindow);
        gameWindow.fadeTo(1000, 1, () => {this.move()});
    }

    move() {
        this.background.animate(5000);
        this.player.walk();
        this.enemy.getDisplay().transition({"right": "100px"}, 5000, "easeInOutQuad", () => {
            this.enemy.getHpBar().fadeTo(400, 1, () => {this.startBattle()});
        });
    }

    startBattle() {
        this.player.stopWalking();
        const battleStartText = $(`<p class="modal-layer__announce">Бой начинается!</p>`).fadeTo(0, 0);
        this.modalLayer.append(battleStartText);
        battleStartText.fadeTo(500, 1).delay(1000).fadeTo(500, 0, () => {battleStartText.remove(); this.toggleTurn()});
    }

    toggleTurn() {
        let turnText = $(`<p class="modal-layer__announce"></p>`).fadeTo(0, 0);
        this.isPlayerTurn = !this.isPlayerTurn;
        if (this.isPlayerTurn) turnText.addClass("modal-layer__announce--player").text("Твой ход!")
        else turnText.addClass("modal-layer__announce--enemy").text("Ход противника");
        this.modalLayer.append(turnText);
        turnText.delay(500).fadeTo(500, 1).delay(1000).fadeTo(500, 0, () => {
            turnText.remove(); 
            this.isPlayerTurn ? this.startPlayerTurn() : this.startEnemyTurn();
        });
    }

    startPlayerTurn() {
        let modalWindow = $(`
            <div class="modal-layer__window">
                <p class="modal-layer__text modal-layer__title">Выбери заклинание:</p>
            </div>
        `),
            spellsList = $(`<ul class="modal-layer__spells-list"></ul>`);
        modalWindow.css({"background-image": "url(./src/images/ui/windows.png)"});
        this.player.getSpellsData().forEach((el, i) => {
            let spellIconWrapper = $(`
                <li class="modal-layer__spell" data-spell-id="${i}"></li>
            `),
                blockLayer = $(`<div class="modal-layer__block-layer modal-layer__block-layer${el.currentCooldown > 0 ? "--blue" : "--red"}">
                    <p class="modal-layer__block-text">${
                        el.currentCooldown > 0 ? "Ходов осталось:" : "Требуемый уровень:"
                    }</p>
                    <p class="modal-layer__block-text modal-layer__block-text--w">${el.currentCooldown > 0 ? el.currentCooldown : el.requiredLevel}</p>
                </div>`),
                spellIcon = $(`<div class="modal-layer__spell-img"></div>`).css({
                    "background-image": `url(${el.iconUrl})`
            }),
                spellTitle = $(`<p class="modal-layer__spell-title">${el.name}</p>`);
            if ((el.currentCooldown > 0) || (el.requiredLevel > this.player.getLevel())) spellIconWrapper.append(blockLayer);
            spellIconWrapper.append(spellIcon).append(spellTitle);
            spellsList.append(spellIconWrapper);
        })
        spellsList.click((event) => {
            let spellID = $(event.target).attr("data-spell-id") || $(event.target.parentNode).attr("data-spell-id");
            if (spellID) {
                const spell = this.player.spells.getSpellData(spellID);
                if ((spell.requiredLevel > this.player.getLevel()) || (spell.currentCooldown > 0)) return;
                spellsList.off("click");
                $(".modal-layer__title").fadeTo(500, 0);
                spellsList.fadeTo(500, 0, () => {spellsList.remove(); this.showQuestion(modalWindow, spellID)});
            }
        })
        modalWindow.append(spellsList).fadeTo(0, 0);
        this.modalLayer.append(modalWindow);
        modalWindow.fadeTo(500, 1);
    }

    showQuestion(modalWindow, spellID) {
        $(".modal-layer__title").text("Реши задачку").fadeTo(500, 1);
        const questionsEngine = new QuestionsEngine(modalWindow, this.answerQuestion.bind(this, spellID));
        questionsEngine.showModalWindow();
        questionsEngine.getWindow().fadeTo(500, 1);
    }

    answerQuestion(spellID, isRightAnswer){
        if (isRightAnswer) this.player.castSpell(spellID, this.calculateDamage.bind(this));
        else {this.player.spells.triggerGCD(); this.toggleTurn();}
    }
    
    startEnemyTurn() {
        this.enemy.castSpell(this.calculateDamage.bind(this));
    }

    calculateDamage(caster, amountHP, isTargetSelf) {
        this.player.stopCasting();
        this.enemy.stopCasting();
        if (isTargetSelf) {caster.receiveHP(amountHP); this.toggleTurn();}
        else {
            let target = (caster instanceof Player) ? this.enemy : this.player;
            target.receiveHP(amountHP);
            if (target instanceof Enemy) this.player.receiveExp(amountHP);
            if (target.getHP() === 0){
                if (target instanceof Enemy) {
                    target.loose();
                    this.isPlayerTurn = false;
                    this.enemy = new Enemy(this.player.getLevel());
                    $(".main-window").append(this.enemy.init()).append(this.enemy.addSprite());
                    this.receiveWin();
                }
                else {
                    this.gameOver()
                }
            }
            else this.toggleTurn();
        }
    }

    receiveWin() {
        const winText = $(`<p class="modal-layer__announce modal-layer__announce--player">Победа!</p>`).fadeTo(0, 0);
        this.player.receiveWinPoint();
        this.modalLayer.append(winText);
        winText.fadeTo(500, 1).delay(1000).fadeTo(500, 0, () => {winText.remove(); this.move()});
    }

    gameOver() {
        const gameOverText = $(`<p class="modal-layer__announce modal-layer__announce--enemy">Игра окончена</p>`).fadeTo(0, 0);
        this.modalLayer.append(gameOverText);
        gameOverText.delay(500).fadeTo(500, 1).delay(2000).fadeTo(500, 0, () => {
            gameOverText.remove();
            let ratings = new RecordsEngine(this.player.getName(), this.player.getKillsCount(), () => {this.restart()});
            let ratingsMarkup = ratings.init();
            ratingsMarkup.fadeTo(0, 0);
            this.modalLayer.append(ratingsMarkup);
            ratingsMarkup.fadeTo(1000, 1);
        });
        $(`.main-window`).delay(1000).fadeTo(1000, 0, () => {$(`.main-window`).remove()});
    }

    restart() {
        this.player = new Player(this.player.getName(), 1, 100, this.player.charSprite);
        this.enemy = new Enemy(1);
        this.isPlayerTurn = false;
        this.background.changeLayers(() => {this.main();})
    }
}