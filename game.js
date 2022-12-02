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
  }
  connectedCallback() {
    this.root = this.firstElementChild;
    this.tiles = Array.from(this.root.querySelectorAll('[data-tile]'));
    this.button = this.querySelector('button');
    this.button.addEventListener('click', () => {
      this.render();
    })
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