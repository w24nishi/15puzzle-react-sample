import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const classNames = ['square'];
  if (props.isHighlighted) classNames.push('highlighted');

  return (
    <button className={classNames.join(' ')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        isHighlighted={this.props.highlightTargets.includes(i)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return <div>{
      [0, 1, 2].map(row => (
        <div key={row} className="board-row">{
          [0, 1, 2].map(col => (
            this.renderSquare(row * 3 + col)
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
        squares: Array(9).fill(null),
        location: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      sortMovesAsc: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const [winner, _] = calculateWinner(squares)
    if (winner || squares[i]) {
      return;
    }
    const col = i % 3;
    const row = (i - col) / 3;
    squares[i] = this.state.xIsNext? 'X': 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: `(${col}, ${row})`,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
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
        'Go to move #' + move + ' ' + step.location:
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

  buildStatus(current, winner) {
    if (winner) {
      return 'Winner: ' + winner;
    }
    if (current.squares.every(s => s)) {
      return 'Draw';
    }
    return 'Next player: ' + (this.state.xIsNext? 'X': 'O');
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const [winner, lines] = calculateWinner(current.squares);

    const status = this.buildStatus(current, winner);
    const moves = this.buildMovesList(history);

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            highlightTargets={lines}
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i=0, len=lines.length; i<len; i++) {
    const [a,b,c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], [a,b,c]];
    }
  }
  return [null, []];
}
