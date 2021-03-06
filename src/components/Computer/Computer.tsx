import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import ChessBoard from 'chessboardjsx'
import './Computer.css'
import Thumbnail from '../UIComponents/Thumbnail/Thumbnail'
import { API_ROOT } from '../../constants'
const Chess = require('chess.js')
interface pieceValues {
  'p': number,
  'n': number,
  'b': number,
  'r': number,
  'q': number,
  'k': number,
}

interface pieces {
  'type': keyof pieceValues,
  'color': string,
}

const Computer = ({ userName }: any) => {

  const history = useHistory();
  const [chess] = useState<any>(
    new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  )
  const [fen, setFen] = useState<string>(chess.fen())
  const [playerTurn, setPlayerTurn] = useState<boolean>(true)
  const [gameOver, setGameOver] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      makeAIMove()
    }, 1000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetGame = (fen: string) => {
    setTimeout(() => {
      chess.load(fen)
      setFen(fen)
      setPlayerTurn(false)
      setGameOver(false)
      makeAIMove()
    }, 2000)
  }

  const checkEndGame = async () => {
    if (chess.game_over()) {
      setGameOver(true)
      setPlayerTurn(false)
      try {
        const params = {
          fen: chess.fen(),
        }
        let token = "Bearer " + localStorage.getItem('jwt')
        const response = await fetch(`${API_ROOT}/api/v1/wash`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify(params),
          mode: 'cors'
        })
        const data = await response.json()
        resetGame(data.data)
      } catch (e) {
        console.log(e)
      }
      //make a fetch here for a washed board and start the game over with an AI move
    }
  }

  const makeAIMove = () => {
    let newMove = calcBestMove(3, chess, chess.turn())[1];
    chess.move(newMove);
    setFen(chess.fen());
    checkEndGame()
    setPlayerTurn(true)
  }

  const handleMove = async (move: object) => {
    if (chess.move(move)) {
      setFen(chess.fen())
      setPlayerTurn(false)
      if (chess.game_over()) {
        setGameOver(true)
        setPlayerTurn(false)
      } else {
        setTimeout(() => {
          makeAIMove()
        }, 1000)
      }
    }
  }

  const calcBestMove = (depth: any, game: any, playerColor: any,
    alpha = Number.NEGATIVE_INFINITY,
    beta = Number.POSITIVE_INFINITY,
    isMaximizingPlayer = true) => {
    // Base case: evaluate board
    if (depth === 0) {
      let value = evaluateBoard(game.board(), playerColor);
      return [value, null]
    }

    // Recursive case: search possible moves
    let bestMove = null; // best move not set yet
    let possibleMoves = game.moves();
    // Set random order for possible moves
    possibleMoves.sort((a: any, b: any) => 0.5 - Math.random());
    // Set a default best move value
    let bestMoveValue = isMaximizingPlayer ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;
    // Search through all possible moves
    for (let i = 0; i < possibleMoves.length; i++) {
      let move = possibleMoves[i];
      // Make the move, but undo before exiting loop
      game.move(move);
      // Recursively get the value from this move
      let value = calcBestMove(depth - 1, game, playerColor, alpha, beta, !isMaximizingPlayer)[0];

      if (isMaximizingPlayer) {
        // Look for moves that maximize position
        if (value > bestMoveValue) {
          bestMoveValue = value;
          bestMove = move;
        }
        alpha = Math.max(alpha, value);
      } else {
        // Look for moves that minimize position
        if (value < bestMoveValue) {
          bestMoveValue = value;
          bestMove = move;
        }
        beta = Math.min(beta, value);
      }
      // Undo previous move
      game.undo();
      // Check for alpha beta pruning
      if (beta <= alpha) {
        break;
      }
    }
    return [bestMoveValue, bestMove || possibleMoves[0]];
  }

  const evaluateBoard = (board: any, color: string) => {
    // Sets the value for each piece using standard piece value
    let pieceValue: pieceValues = {
      'p': 100,
      'n': 350,
      'b': 350,
      'r': 525,
      'q': 1000,
      'k': 10000
    };

    let value: number = 0;
    board.forEach(function (row: any) {
      row.forEach(function (piece: pieces) {
        if (piece) {
          value += pieceValue[piece['type']]
            * (piece['color'] === color ? 1 : -1);
        }
      })
    })

    return value;
  }

  const handleLeave = () => {
    history.push(`/dashboard`)
  }

  return (
    <>
      <div className="game-screen-lower-third">
        {<Thumbnail text={!playerTurn && !gameOver ? 'Thinking ...' : 'Computer'} />}
      </div>
      {gameOver && <p className='thumbnail-text'>Game Over!</p>}
      <div className="center">
        <ChessBoard
          orientation={'black'}
          draggable={playerTurn}
          onDrop={(move: any) =>
            handleMove({
              from: move.sourceSquare,
              to: move.targetSquare,
              promotion: "q",
            })
          }

          position={fen}
        />
      </div>
      <div className="game-screen-lower-third">
        {<Thumbnail text={userName} />}
        <button className="leave-game button-lt-bg" onClick={handleLeave}>Back to Dashboard</button>
      </div>
    </>
  )
}

export default Computer;