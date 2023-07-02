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
    this.possibleResults = this.querySelector('#possibilies');
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

    this.game.$on('state', async (state) => {
      this.dataset.state = state;
      if(state === 'complete') {
        const results = await (await this.game.possibilites)?.json();
        this.possibleResults.innerHTML = `
        <div>Possible Words</div>
          ${Object.keys(results).map(length => (`
            <div class="possibility">
              <div>${length} letters:</div>
              <div>${results[length].length}</div>
            </div>
          `)).join('')}
        `
      }
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