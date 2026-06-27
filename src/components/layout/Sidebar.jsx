import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Compass, Search, Bookmark, Trophy, FileText, User, LogOut, LogIn, Users } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import LogoName from '../../assets/Logo-name.png'
import NotificationDropdown from '../gamification/NotificationDropdown'

export default function Sidebar() {
  const navigate = useNavigate()
  const { signOut, user } = useContext(AuthContext)

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Discover', path: '/discover', icon: <Compass className="h-5 w-5" /> },
    { name: 'Search', path: '/search', icon: <Search className="h-5 w-5" /> },
    { name: 'Community', path: '/community', icon: <Users className="h-5 w-5" /> },
    { name: 'Watchlist', path: '/watchlist', icon: <Bookmark className="h-5 w-5" /> },
    { name: 'Rankings', path: '/rankings', icon: <Trophy className="h-5 w-5" /> },
    { name: 'News', path: '/news', icon: <FileText className="h-5 w-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> }
  ]

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="w-[280px] h-screen fixed top-0 left-0 bg-surface-chrome border-r border-white/5 flex flex-col justify-between py-8 z-30 select-none">
      <div className="space-y-8">
        {/* Brand Logo Wordmark */}
        <div
          onClick={() => navigate('/')}
          className="px-8 flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={LogoName}
            alt="AnimeLoom Logo"
            className="w-auto h-20 object-contain"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-4 py-4 px-8 text-sm font-ui font-semibold transition-all duration-300 select-none ${
                  isActive 
                    ? 'text-white bg-white/5' 
                    : 'text-gray-400 hover:text-white hover:bg-white/2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Crimson Pill indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand shadow-[0_0_10px_rgba(192,57,43,0.8)]" />
                  )}
                  <div className={`${isActive ? 'text-brand' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Auth Bottom Trigger & Notification Bell */}
      <div className="px-8 flex items-center gap-2">
        {user ? (
          <>
            <button
              onClick={handleLogout}
              className="flex-grow flex items-center gap-3 py-3.5 px-4 rounded-xl text-sm font-ui font-semibold text-gray-400 hover:text-white hover:bg-brand/10 hover:text-brand-light transition-all duration-300 cursor-pointer"
            >
              <LogOut className="h-5 w-5 text-gray-500" />
              <span>Logout</span>
            </button>
            <NotificationDropdown />
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-4 py-3.5 px-4 rounded-xl text-sm font-ui font-semibold text-gray-400 hover:text-white hover:bg-brand/10 hover:text-brand-light transition-all duration-300 cursor-pointer"
          >
            <LogIn className="h-5 w-5 text-gray-500" />
            <span>Login</span>
          </button>
        )}
      </div>
    </aside>
  )
}

