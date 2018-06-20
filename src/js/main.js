import './../scss/main.scss';
import Game from './components/Game.js';

window.resources = {};
const game = new Game(document.querySelector('.game-block'));
game.load();
