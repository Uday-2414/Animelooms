import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Shell Layout
import AppLayout from './layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Search from './pages/Search'
import AnimeDetails from './pages/AnimeDetails'
import Watchlist from './pages/Watchlist'
import Profile from './pages/Profile'
import Rankings from './pages/Rankings'
import News from './pages/News'
import Login from './pages/Login'

// Styling
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Main Application Shell Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="anime/:id" element={<AnimeDetails />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="profile" element={<Profile />} />
          <Route path="rankings" element={<Rankings />} />
          <Route path="news" element={<News />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
