import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Tetris.css'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00F0F0',
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: '#F0F000',
  },
  T: {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: '#A000F0',
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: '#00F000',
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: '#F00000',
  },
  J: {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: '#0000F0',
  },
  L: {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: '#F0A000',
  },
}

const Tetris = () => {
  const navigate = useNavigate()
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState(null)
  const [nextPiece, setNextPiece] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [dropTime, setDropTime] = useState(1000)
  const boardRef = useRef(board)
  const positionRef = useRef(position)
  const currentPieceRef = useRef(currentPiece)

  useEffect(() => {
    boardRef.current = board
  }, [board])

  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    currentPieceRef.current = currentPiece
  }, [currentPiece])

  function createEmptyBoard() {
    return Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0))
  }

  const randomTetromino = useCallback(() => {
    const pieces = Object.keys(TETROMINOES)
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    return {
      type: randomPiece,
      shape: TETROMINOES[randomPiece].shape,
      color: TETROMINOES[randomPiece].color,
    }
  }, [])

  const spawnPiece = useCallback(() => {
    const newPiece = randomTetromino()
    const startX = Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2)
    return {
      ...newPiece,
      x: startX,
      y: 0,
    }
  }, [randomTetromino])

  const checkCollision = useCallback(
    (piece, x, y, board) => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const newX = x + col
            const newY = y + row

            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
              return true
            }

            if (newY >= 0 && board[newY][newX] !== 0) {
              return true
            }
          }
        }
      }
      return false
    },
    []
  )

  const mergePieceToBoard = useCallback((piece, x, y, currentBoard) => {
    const newBoard = currentBoard.map((row) => [...row])
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const boardY = y + row
          const boardX = x + col
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color
          }
        }
      }
    }
    return newBoard
  }, [])

  const clearLines = useCallback((currentBoard) => {
    let linesCleared = 0
    const newBoard = currentBoard.filter((row) => {
      const isFull = row.every((cell) => cell !== 0)
      if (isFull) linesCleared++
      return !isFull
    })

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }

    return { board: newBoard, linesCleared }
  }, [])

  const rotatePiece = useCallback((piece) => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map((row) => row[index]).reverse()
    )
    return { ...piece, shape: rotated }
  }, [])

  useEffect(() => {
    if (gameOver || isPaused || currentPiece) return

    const piece = spawnPiece()
    setCurrentPiece(piece)
    setNextPiece(spawnPiece())
    setPosition({ x: piece.x, y: piece.y })
  }, [gameOver, isPaused, spawnPiece])

  useEffect(() => {
    if (!currentPiece || gameOver || isPaused) return

    const drop = () => {
      const currentPos = positionRef.current
      const currentPieceVal = currentPieceRef.current
      const currentBoard = boardRef.current
      const newY = currentPos.y + 1

      if (!checkCollision(currentPieceVal, currentPos.x, newY, currentBoard)) {
        setPosition({ ...currentPos, y: newY })
      } else {
        const newBoard = mergePieceToBoard(currentPieceVal, currentPos.x, currentPos.y, currentBoard)
        
        if (currentPos.y <= 0) {
          setGameOver(true)
          return
        }

        const { board: clearedBoard, linesCleared } = clearLines(newBoard)
        setBoard(clearedBoard)
        
        if (linesCleared > 0) {
          setLines((prevLines) => {
            const newLines = prevLines + linesCleared
            const newLevel = Math.floor(newLines / 10) + 1
            setLevel(newLevel)
            setScore((prevScore) => prevScore + linesCleared * 100 * newLevel)
            return newLines
          })
        }

        setNextPiece((prevNext) => {
          const next = prevNext || spawnPiece()
          setCurrentPiece(next)
          setPosition({ x: next.x, y: next.y })
          return spawnPiece()
        })
      }
    }

    const timer = setTimeout(drop, dropTime / level)
    return () => clearTimeout(timer)
  }, [currentPiece, position, gameOver, isPaused, level, dropTime, checkCollision, mergePieceToBoard, clearLines, spawnPiece])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return

      if (e.key === ' ') {
        e.preventDefault()
        setIsPaused(!isPaused)
        return
      }

      if (isPaused) return

      if (!currentPiece) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (!checkCollision(currentPiece, position.x - 1, position.y, board)) {
            setPosition({ ...position, x: position.x - 1 })
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (!checkCollision(currentPiece, position.x + 1, position.y, board)) {
            setPosition({ ...position, x: position.x + 1 })
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          if (!checkCollision(currentPiece, position.x, position.y + 1, board)) {
            setPosition({ ...position, y: position.y + 1 })
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          const rotated = rotatePiece(currentPiece)
          if (!checkCollision(rotated, position.x, position.y, board)) {
            setCurrentPiece(rotated)
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPiece, position, board, gameOver, isPaused, checkCollision, rotatePiece])

  const getDisplayBoard = () => {
    const displayBoard = board.map((row) => [...row])

    if (currentPiece) {
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const boardY = position.y + row
            const boardX = position.x + col
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color
            }
          }
        }
      }
    }

    return displayBoard
  }

  const restartGame = () => {
    setBoard(createEmptyBoard())
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    const piece = spawnPiece()
    setCurrentPiece(piece)
    setNextPiece(spawnPiece())
    setPosition({ x: piece.x, y: piece.y })
  }

  return (
    <div className="tetris-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Bosh sahifaga
      </button>

      <div className="tetris-game-wrapper">
        <div className="game-board-container">
          <div className="tetris-board">
            {getDisplayBoard().map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`tetris-cell ${cell ? 'filled' : ''}`}
                  style={{ backgroundColor: cell || '#2a2a2a' }}
                >
                  {cell && <div className="block-glow"></div>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="info-panel">
          <div className="next-piece-section">
            <h3 className="panel-label">KEYINGI BLOK</h3>
            <div className="next-piece-display">
              {nextPiece &&
                nextPiece.shape.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`next-${rowIndex}-${colIndex}`}
                      className={`next-cell ${cell ? 'filled' : ''}`}
                      style={{
                        backgroundColor: cell ? nextPiece.color : 'transparent',
                      }}
                    >
                      {cell && <div className="block-glow"></div>}
                    </div>
                  ))
                )}
            </div>
          </div>

          <div className="score-section">
            <div className="score-item">
              <h3 className="panel-label">SCORE</h3>
              <div className="score-value">{score}</div>
            </div>
            <div className="score-item">
              <h3 className="panel-label">LINE</h3>
              <div className="score-value">{lines}</div>
            </div>
            <div className="score-item">
              <h3 className="panel-label">LEVEL</h3>
              <div className="score-value">{level}</div>
            </div>
          </div>

          <button
            className="pause-button"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? 'DAVOM ET' : 'PAUSE'}
          </button>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>O'yin Tugadi!</h2>
            <p>Hisob: {score}</p>
            <p>Qatorlar: {lines}</p>
            <button className="restart-button" onClick={restartGame}>
              Qayta Boshlash
            </button>
          </div>
        </div>
      )}

      {isPaused && !gameOver && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>To'xtatildi</h2>
            <p>Davom etish uchun Space yoki PAUSE tugmasini bosing</p>
          </div>
        </div>
      )}

      <div className="game-instructions">
        <p>←→ - Harakat qilish | ↑ - Aylantirish | ↓ - Tezroq tushirish | Space - To'xtatish</p>
      </div>
    </div>
  )
}

export default Tetris
