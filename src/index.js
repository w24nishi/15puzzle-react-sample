import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const classNames = ['square'];

  return (
    <button className={classNames.join(' ')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(row, col, val) {
    return (
      <Square
        key={`${row}-${col}`}
        value={val}
        onClick={() => this.props.onClick(row, col)}
      />
    );
  }

  render() {
    return <div>{
      this.props.squares.map((rowVals, row)=> (
        <div key={row} className="board-row">{
          rowVals.map((val, col) => (
            this.renderSquare(row, col, val)
          ))
        }</div>
      ))
    }</div>
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: getRandomInitSquares(),
        movedSquare: null,
      }],
      stepNumber: 0,
      sortMovesAsc: true,
    };
  }

  handleClick(row, col) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = JSON.parse(JSON.stringify(current.squares));
    if (isGameCompleted(squares)) {
      return;
    }
    const clickedVal = squares[row][col];
    this.moveIfPossible(squares, row, col);
    const hasMoved = (clickedVal !== squares[row][col]);
    if (!hasMoved) {
      return;
    }
    this.setState({
      history: history.concat([{
        squares: squares,
        movedSquare: clickedVal,
      }]),
      stepNumber: history.length,
    });
  }

  moveIfPossible(squares, row, col) {
    for (const rowDelta of [-1,1]) {
      const neighborRow = row + rowDelta;
      if (neighborRow < 0 || 3 < neighborRow) continue;
      if (squares[neighborRow][col] === null) {
        squares[neighborRow][col] = squares[row][col];
        squares[row][col] = null;
        return;
      }
    }
    for (const colDelta of [-1,1]) {
      const neighborCol = col + colDelta;
      if (neighborCol < 0 || 3 < neighborCol) continue;
      if (squares[row][neighborCol] === null) {
        squares[row][neighborCol] = squares[row][col];
        squares[row][col] = null;
        return;
      }
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
    });
  }

  reverseMovesList() {
    this.setState({
      sortMovesAsc: !this.state.sortMovesAsc
    });
  }

  buildMovesList(history) {
    const moves = history.map((step, move) => {
      const descText = move ?
        `Go to move #${move} (${step.movedSquare})`:
        'Go to game start';
      const desc = (this.state.stepNumber === move) ?
        <b>{descText}</b>:
        descText;
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    });
    return this.state.sortMovesAsc?
      moves:
      moves.reverse();
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const status = isGameCompleted(current.squares)? 'Completed!!!': '';
    const moves = this.buildMovesList(history);

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(row, col) => this.handleClick(row, col)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.reverseMovesList()}>sort moves</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function isGameCompleted(squares) {
  const rightPlaces = [
    [1,2,3,4],
    [5,6,7,8],
    [9,10,11,12],
    [13,14,15,null],
  ];
  return JSON.stringify(rightPlaces) === JSON.stringify(squares);
}

function getRandomInitSquares(scrambles = 100) {
  const squares = [
    [1,2,3,4],
    [5,6,7,8],
    [9,10,11,12],
    [13,14,15,null],
  ];
  let [nullRow, nullCol] = [3, 3];
  const deltas = [[-1,0], [1,0], [0,-1], [0,1]];

  let scrambleCount = 0;
  const moveNull = ([rowDelta, colDelta]) => {
    const neighborRow = nullRow + rowDelta;
    const neighborCol = nullCol + colDelta;
    if (neighborRow < 0 || 3 < neighborRow) return;
    if (neighborCol < 0 || 3 < neighborCol) return;
    squares[nullRow][nullCol] = squares[neighborRow][neighborCol];
    squares[neighborRow][neighborCol] = null;
    [nullRow, nullCol] = [neighborRow, neighborCol];
    scrambleCount++;
  }
  const randomDelta = () => {
    return deltas[Math.floor(Math.random() * deltas.length)];
  };
  while (scrambleCount < scrambles) {
    moveNull(randomDelta());
  }
  return squares;
}
