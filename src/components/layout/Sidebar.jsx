import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  Newspaper, 
  Tv,
  Settings, 
  Shield,
  LogOut,
  Clock,
  Bell
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: location.pathname === '/'
    },
    {
      name: 'Matches',
      href: '/matches',
      icon: Calendar,
      current: location.pathname === '/matches'
    },
    {
      name: 'News',
      href: '/news',
      icon: Newspaper,
      current: location.pathname === '/news'
    },
    {
      name: 'Channels',
      href: '/channels',
      icon: Tv,
      current: location.pathname === '/channels'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings'
    },
    {
      name: 'Cron Jobs',
      href: '/cron-jobs',
      icon: Clock,
      current: location.pathname === '/cron-jobs'
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      current: location.pathname === '/notifications'
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
        <div className="flex items-center">
        <img src="/icon.png" alt="NFL Logo" className="w-16 h-16" />
        <span className="text-xl font-bold text-white">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.current
                  ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar 