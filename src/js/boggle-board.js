import { Game } from './game.js'

class BoggleBoard extends HTMLElement {
  constructor() {
    super();
    this.game = new Game();
  }
  connectedCallback() {
    this.root = this.firstElementChild;
    this.tiles = Array.from(this.root.querySelectorAll('[data-tile]'));
    this.buttons = this.querySelectorAll('button[data-trigger]');
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.game.dispatch({ 
          type: e.target.dataset.trigger, 
          payload: {
            param: e.target.dataset.triggerParam
          } 
        });
      })
    })
    this.timeBox = this.querySelector('.time-box');

    this.game.$on('state', (state) => {
      this.dataset.state = state
    })
    this.game.$on('matrix', () => {
      for(let cell = 0; cell < this.tiles.length; cell++) {
        this.tiles[cell].textContent = this.game.matrix[cell];
      }
    })
    this.game.$on('time', (secondsRemaining) => {
      if(secondsRemaining !== null) {
        const minutes = Math.floor(secondsRemaining/60);
        const seconds = secondsRemaining % 60;
        this.timeBox.textContent = `${minutes}:${seconds.toString().padStart(2,'0')}`;;
      } else {
        this.timeBox.textContent = '';
      }
    })
  }
}

window.customElements.define('boggle-board', BoggleBoard)