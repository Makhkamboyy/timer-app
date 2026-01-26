import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()

  const games = [
    {
      id: 'snake',
      title: 'Snake O\'yini',
      description: 'Klassik ilon o\'yini - olmani yeying va uzaytiring!',
      icon: '🐍',
      route: '/snake',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 'tetris',
      title: 'Tetris O\'yini',
      description: 'Bloklarni joylashtiring va qatorlarni to\'ldiring!',
      icon: '🧩',
      route: '/tetris',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  ]

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">O'yinlar</h1>
        <p className="home-subtitle">O'zingizni tanlagan o'yinni boshlang</p>
      </div>
      
      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => navigate(game.route)}
            style={{ background: game.gradient }}
          >
            <div className="game-card-icon">{game.icon}</div>
            <h2 className="game-card-title">{game.title}</h2>
            <p className="game-card-description">{game.description}</p>
            <div className="game-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
