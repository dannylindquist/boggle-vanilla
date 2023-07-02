
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
];

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

const STARTED = 'started';
const IDLE = 'idle';
const COMPLETE = 'complete';
const REVIEW = 'review';

export const Game = class {
  constructor() {
    this.matrix = new Array(16).fill('?');
    this.possibilites = null;
    this.usedIndex = new Set();
    this.state = 'idle';
    this.subscribers = {};
    this.timeRemaining = "";
    this.context = {};
    this.gameTimer = null;
    this.transitions = {
      [IDLE]: {
        on: {
          start: STARTED
        }
      },
      [STARTED]: {
        on: {
          stop: IDLE,
          time: COMPLETE
        }
      },
      [COMPLETE]: {
        on: {
          review: REVIEW
        }
      },
      [REVIEW]: {
        on: {
          reset: IDLE
        }
      }
    }
  }

  shuffle() {
    this.usedIndex.clear();
    for(let cell = 0; cell < 16; cell++) {
      let diceIndex = getRandomNumber(dice.length-this.usedIndex.size);
      while(this.usedIndex.has(diceIndex)) {
        diceIndex++;
      }
      const sideIndex = getRandomNumber(6);
      this.matrix[cell] = dice[diceIndex][sideIndex];
      this.usedIndex.add(diceIndex);
    }
    this._signal('matrix', this.matrix);
    this.possibilites = fetch('https://boggle-solver.fly.dev', {
      body: JSON.stringify(this.matrix),
      method: 'post',
      headers: {
        'content-type': 'application/json'
      }
    })
  }
  /**
   * 
   * @param {{type: string, payload?: string}} event 
   */
  dispatch(event) {
    const currentState = this.state;
    const newState = this.transitions[currentState]?.on[event.type];
    if(newState && currentState !== newState) {
      this.context = {...this.context, ...event.payload};
      this.state = newState;
      this._onTransition()
    }
  }

  _onTransition() {
    this._signal('state', this.state);
    switch(this.state) {
      case STARTED:
        this.shuffle();
        this._startGameTimer(+this.context.param);
        break;
      case COMPLETE:
        this._clearTimer();
        break;
      case IDLE:
        this._clearTimer();
        this._clearCells();
        this._signal('time', null)
        break;
      case REVIEW:
        this._clearTimer();
        break;
      default:
        break;
    }
  }

  _startGameTimer(minutes) {
    const now = Date.now();
    const total = minutes*60;
    this._signal('time', total);
    this.gameTimer = setInterval(() => {
      const past = Math.floor((Date.now()-now)/1000);
      if(past >= total) {
        this._signal('time', null);
        this._clearTimer();
        this.dispatch({ type: 'time' })
      } else {
        const remaining = total - past;
        this._signal('time', remaining);
      }
    },1000);
  }

  _clearTimer() {
    if(this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  _clearCells() {
    this.matrix.fill('?')
    this._signal('matrix', this.matrix);
  }

  /**
   * 
   * @param { 'time' | 'matrix' | 'state' } property 
   * @param { (value:any) => void } cb 
   */
  $on(property, cb) {
    if (!this.subscribers[property]) {
      this.subscribers[property] = []
    }
    this.subscribers[property].push(cb);
    return () => {
      this.subscribers[property] = this.subscribers[property].filter(fn => fn !== cb);
    }
  }

  /**
   * 
   * @param { 'time' | 'matrix' | 'state' } property 
   * @param { any } cb 
   */
  _signal(property, value) {
    this.subscribers[property]?.forEach(fn => fn(value));
  }
}