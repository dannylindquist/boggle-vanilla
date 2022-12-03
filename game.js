const dice = [
  ["R","I","F","O","B","X"],
  ["I","F","E","H","E","Y"],
  ["D","E","N","O","W","S"],
  ["U","T","O","K","N","D"],
  ["H","M","S","R","A","O"],
  ["L","U","P","E","T","S"],
  ["A","C","I","T","O","A"],
  ["Y","L","G","K","U","E"],
  ["Qu","B","M","J","O","A"],
  ["E","H","I","S","P","N"],
  ["V","E","T","I","G","N"],
  ["B","A","L","I","Y","T"],
  ["E","Z","A","V","N","D"],
  ["R","A","L","E","S","C"],
  ["U","W","I","L","R","G"],
  ["P","A","C","E","M","D"],
]

function createMatrix() {
  const matrix = new Array(4);
  for (let i = 0; i < 4; i++) {
    matrix[i] = new Array(4).fill('')
  }
  return matrix;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

class Game {
  constructor() {
    this.matrix = createMatrix();
    this.usedIndex = new Set();
  }

  shuffle() {
    this.usedIndex.clear();
    for(let cell = 0; cell < 16; cell++) {
      const row = Math.floor(cell/4);
      const column = cell%4;
      let diceIndex = getRandomNumber(0, dice.length-this.usedIndex.size);
      while(this.usedIndex.has(diceIndex)) {
        diceIndex++;
      }
      const sideIndex = getRandomNumber(0, 6);
      this.matrix[row][column] = dice[diceIndex][sideIndex];
      this.usedIndex.add(diceIndex);
    }
  }
}

class BoggleBoard extends HTMLElement {
  constructor() {
    super();
    this.game = new Game();
    this.timer = null;
  }
  connectedCallback() {
    this.root = this.firstElementChild;
    this.tiles = Array.from(this.root.querySelectorAll('[data-tile]'));
    this.buttons = this.querySelectorAll('button[data-minutes]');
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.startGame(+e.currentTarget.dataset.minutes);
      })
    })
    this.stopButton = this.querySelector('button[data-stop]');
    this.stopButton.addEventListener('click', e => {
      this.stopGame()
    })
    this.timeBox = this.querySelector('.time-box');
  }
  stopGame() {
    if(this.timer) {
      clearInterval(this.timer);
    }
    this.buttons.forEach(button => button.classList.remove('hidden'));
    this.stopButton.classList.add('hidden');
    this.timeBox.textContent = '';
  }
  startGame(minutes) {
    this.buttons.forEach(button => button.classList.add('hidden'));
    this.stopButton.classList.remove('hidden')
    this.render();
    const now = Date.now();
    const total = minutes*60;
    this.renderTime(0, total);
    this.timer = setInterval(() => {
      const past = Math.floor((Date.now()-now)/1000);
      this.renderTime(past, total);
      if(past >= total) {
        clearInterval(this.timer)
      }
    },1000);
  }
  renderTime(elapsedSeconds, total) {
    const remaining = total - elapsedSeconds;
    const minutes = Math.floor(remaining/60);
    const seconds = remaining % 60;
    this.timeBox.textContent = `${minutes}:${seconds.toString().padStart(2,'0')}`;
  }
  render() {
    this.game.shuffle();
    for(let cell = 0; cell < this.tiles.length; cell++) {
      const row = Math.floor(cell/4);
      const column = cell%4;
      this.tiles[cell].textContent = this.game.matrix[row][column];
    }
  }
}

window.customElements.define('boggle-board', BoggleBoard)