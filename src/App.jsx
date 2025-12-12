import { Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import Favorites from './pages/Favorites'
import Search from './pages/Search'
import Pantry from './pages/Pantry'
import Planner from './pages/Planner'
import Login from './pages/Login'
import SignUp from './pages/SignUp'

function App() {
  useEffect(() => {
    const saved = localStorage.getItem('boxbite_dark_mode')
    const darkMode = saved ? JSON.parse(saved) : true
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
