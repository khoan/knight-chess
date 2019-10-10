'use strict';

const el = React.createElement;

class Game extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentPos: this.randomPos(),
      targetPos: this.randomPos()
    };

    // caches a series of moves that leads to good triumphing over evil
    this.hintMoves = [];

    this.newGame = this.newGame.bind(this);
    this.hint = this.hint.bind(this);
    this.move = this.move.bind(this);
  }

  get isGameOver () {
    return this.state.currentPos == this.state.targetPos;
  }

  // move white knight
  move (i) {
    if (this.isGameOver) {
      return alert('White Knight: I need a new game');
    }

    //console.log('move', this.state.currentPos, '->', i);

    if (! Knight.isValidMove(this.state.currentPos, i)) {
      return alert('White Knight: I cannot move there!');
    }

    this.setState({currentPos: i});

    if (i == this.state.targetPos) {
      setTimeout(() => alert('White Knight: Good always triumphs over Evil!'), 200);
    }
  }

  randomPos () {
    return Math.floor(Math.random() * 64);
  }

  newGame () {
    let currentPos = this.randomPos();
    let targetPos = this.randomPos();

    while (currentPos == targetPos) {
      targetPos = this.randomPos();
    }

    this.setState({currentPos, targetPos});
  }

  async hint () {
    if (this.isGameOver) {
      return alert('White Knight: I need a new game');
    }

    let validNextMoves = Knight.nextMovesFrom(this.state.currentPos);
    let nextMove;

    do {
      nextMove = this.hintMoves.shift();
    } while(nextMove && nextMove > -1 && !validNextMoves.includes(nextMove));
    
    if (nextMove === undefined) {
      const url = new URL('/hints.json', location.origin);
      url.search = new URLSearchParams(this.state);
      this.hintMoves = await fetch(url).then(r => r.json());

      nextMove = this.hintMoves.shift();
    }

    if (nextMove === undefined) {
      alert('White Knight: I cannot vanquish the evil King. Start a new game.');
    } else {
      this.move(nextMove);
    }
  }

  render () {
    const boardProps = Object.assign({moveFn: this.move}, this.state);

    return el('div', {},
      el('header', {className: 'center measure'},
        el('h1', {}, 'Will Good triumph over Evil? White Knight, your move!'),
        el('a', {onClick: this.newGame, className: 'link dim ph3 pv2 ba mr1 bg-light-green black', href: 'javascript:void(0)'}, 'New Game'),
        el('a', {onClick: this.hint, className: 'link dim ph3 pv2 ba bg-light-blue black', href: 'javascript:void(0)'}, 'Hint')
      ),
      el(Board, boardProps)
    );
  }
}

class Board extends React.Component {
  // convert tile index into cartesian coordinate
  static xy (tileIndex) {
    let x = parseInt(tileIndex / 8);
    let y = tileIndex % 8;
    return {x, y};
  }

  // convert cartesian coordinate into square number
  static tileIndex (xy) {
    return xy.x * 8 + xy.y;
  }

  constructor(props) {
    super(props);
  }

  render() {
    const tiles = [];

    for (let i=0; i < 64; ++i) {
      let row = parseInt(i/8);
      let className = row % 2 ? (i % 2 ? 'pa2 bg-dark-tile' : 'pa2 bg-light-tile') : (i % 2 ? 'pa2 bg-light-tile' : 'pa2 bg-dark-tile');
      let piece;

      if (i == this.props.currentPos) {
        piece = 'white-knight';
      } else if (i == this.props.targetPos) {
        piece = 'black-king';
      }

      tiles.push({
        key: i,
        index: i,
        className,
        piece,
        moveFn: this.props.moveFn
      });
    }

    return el('div', {className: 'center board ba ma3', style: {width: '60vw', height: '60vw'}},
      tiles.map(spec => el(Tile, spec))
    );
  }
}

class Tile extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    let {piece, className} = this.props;

    if (piece) {
      className += ' ' + piece;
    }

    return el('a', {onClick: () => this.props.moveFn(this.props.index), href: 'javascript:void(0)', className});
  }
}

class Knight {
  static isValidMove (i, j) {
    return this.nextMovesFrom(i).includes(j);
  }

  static nextMovesFrom (i) {
    let from = Board.xy(i);

    //console.log('next move from', from);

    let possibleMoves = [
      {x: from.x - 2, y: from.y + 1},
      {x: from.x - 2, y: from.y - 1},
      {x: from.x + 2, y: from.y + 1},
      {x: from.x + 2, y: from.y - 1},

      {x: from.x + 1, y: from.y + 2},
      {x: from.x - 1, y: from.y + 2},
      {x: from.x + 1, y: from.y - 2},
      {x: from.x - 1, y: from.y - 2}
    ];

    //console.log('possibleMoves', possibleMoves);

    return possibleMoves.filter(move =>
      -1 < move.x && move.x < 8 &&
        -1 < move.y && move.y < 8
    ).map(Board.tileIndex)
  }
}

const domContainer = document.querySelector('#js-app');
ReactDOM.render(el(Game), domContainer);
