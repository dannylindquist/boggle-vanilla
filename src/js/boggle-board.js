import { Game } from './game.js'
import { dom } from './helpers.js';

class BoggleBoard extends HTMLElement {
  constructor() {
    super();
    this.game = new Game();
  }

  async renderPossibleResults() {
    this.results = await (await this.game.possibilites)?.json();
        this.possibleResults.innerHTML = `
          ${Object.keys(this.results).map(length => (`
            <div class="possibility">
                <button class="button-link" data-letter-length="${length}">${length} letters:</button>
                <span>${this.results[length].length}</span>
            </div>
          `)).join('')}
        `
  }

  async renderLetterModal(letterLength) {
    const list = this.results[+letterLength];
    const common = Math.floor((list.filter(word => word.common).length / list.length)*100);
    const heading = dom('h3', el => { el.textContent = `${letterLength} letter words` });
    const summary = dom('div', el => { 
      el.textContent = `${common}% common` 
      el.style.textAlign = 'center';
      el.style.paddingBottom = '8px';
    });
    const wordList = dom('div', el => {
      const sorted = list.sort((a,b) => a.word.localeCompare(b.word));
      el.classList.add('words')
      el.append(...sorted.map(word => dom('div', wordEl => wordEl.textContent = word.word)));
    });
    this.letterDialog.firstElementChild.replaceChildren(heading, summary, wordList)
    this.letterDialog.showModal();
  }

  connectedCallback() {
    this.root = this.firstElementChild;
    /** @type {HTMLDialogElement} */
    this.letterDialog = this.querySelector('#word-dialog');
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
    this.possibleResults.addEventListener('click', e => {
      const letterButton = e.target.closest('[data-letter-length]');
      if(letterButton) {
        this.renderLetterModal(letterButton.dataset.letterLength);
      }
    })

    this.game.$on('state', (state) => {
      this.dataset.state = state;
      if(state === 'complete') {
        this.renderPossibleResults();
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