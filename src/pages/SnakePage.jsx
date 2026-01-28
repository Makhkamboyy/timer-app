import React from 'react'
import { useNavigate } from 'react-router-dom'
import SnakeGame from '../components/SnakeGame'
import '../styles/SnakePage.css'

const SnakePage = () => {
  const navigate = useNavigate()

  return (
    <div className="snake-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Bosh sahifagaa
      </button>
      <SnakeGame />
    </div>
  )
}

export default SnakePage
