import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SnakePage from './pages/SnakePage'
import Tetris from './components/Tetris'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/snake" element={<SnakePage />} />
          <Route path="/tetris" element={<Tetris />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
