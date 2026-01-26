import React, { useState, useEffect, useCallback } from 'react'
import '../styles/SnakeGame.css'

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const GAME_SPEED = 150

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0')
  })
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Generate random food position
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
    // Make sure food doesn't spawn on snake
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood()
    }
    return newFood
  }, [snake])

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return

    setSnake(prevSnake => {
      const newSnake = [...prevSnake]
      const head = { ...newSnake[0] }
      
      head.x += direction.x
      head.y += direction.y

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true)
        return prevSnake
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        return prevSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 1
          if (newScore > highScore) {
            const newHighScore = newScore
            setHighScore(newHighScore)
            localStorage.setItem('snakeHighScore', newHighScore.toString())
          }
          return newScore
        })
        setFood(generateFood())
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameOver, isPaused, generateFood, highScore])

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED)
    return () => clearInterval(gameInterval)
  }, [moveSnake])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          restartGame()
        }
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          if (direction.y === 0) setDirection({ x: 0, y: -1 })
          break
        case 'ArrowDown':
          e.preventDefault()
          if (direction.y === 0) setDirection({ x: 0, y: 1 })
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (direction.x === 0) setDirection({ x: -1, y: 0 })
          break
        case 'ArrowRight':
          e.preventDefault()
          if (direction.x === 0) setDirection({ x: 1, y: 0 })
          break
        case ' ':
          e.preventDefault()
          setIsPaused(prev => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [direction, gameOver])

  const restartGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood(generateFood())
    setScore(0)
    setGameOver(false)
    setIsPaused(false)
  }

  const getSnakeColor = (index) => {
    if (index === 0) return '#4A90E2' // Blue head
    const colors = ['#9B59B6', '#E91E63', '#F44336', '#FF9800', '#FFEB3B']
    return colors[(index - 1) % colors.length]
  }

  const renderCell = (x, y) => {
    const snakeSegment = snake.findIndex(segment => segment.x === x && segment.y === y)
    const isHead = snakeSegment === 0
    const isFood = food.x === x && food.y === y
    const isEven = (x + y) % 2 === 0

    return (
      <div
        key={`${x}-${y}`}
        className={`cell ${isEven ? 'cell-even' : 'cell-odd'}`}
      >
        {snakeSegment !== -1 && (
          <div
            className={`snake-segment ${isHead ? 'snake-head' : ''}`}
            style={{ backgroundColor: getSnakeColor(snakeSegment) }}
          >
            {isHead && (
              <div className="snake-eyes">
                <div className="eye"></div>
                <div className="eye"></div>
              </div>
            )}
          </div>
        )}
        {isFood && (
          <div className="food">
            <div className="apple">
              <div className="apple-top"></div>
              <div className="apple-leaf"></div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="snake-game-container">
      <div className="game-header">
        <div className="score-section">
          <div className="score-item">
            <span className="score-icon">🍎</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-item">
            <span className="score-icon">🏆</span>
            <span className="score-value">{highScore}</span>
          </div>
        </div>
        <button
          className="sound-toggle"
          onClick={() => setIsMuted(!isMuted)}
          aria-label="Toggle sound"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="game-board-wrapper">
        <div className="game-board">
          {Array.from({ length: GRID_SIZE }).map((_, y) =>
            Array.from({ length: GRID_SIZE }).map((_, x) => renderCell(x, y))
          )}
        </div>

        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-content">
              <h2>O'yin Tugadi!</h2>
              <p>Hisob: {score}</p>
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
              <p>Davom etish uchun Space tugmasini bosing</p>
            </div>
          </div>
        )}
      </div>

      <div className="game-instructions">
        <p>←↑→↓ - Harakat qilish | Space - To'xtatish</p>
      </div>
    </div>
  )
}

export default SnakeGame
