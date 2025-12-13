
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  FileText, 
  Tag, 
  DollarSign, 
  Settings, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  Menu, 
  X,
  Monitor,
  Zap,
  ShoppingCart,
  User,
  LogOut,
  Building2
} from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar menu mobile ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Painéis', href: '/paineis', icon: Monitor },
    { name: 'Ações', href: '/acoes', icon: Zap },
    { name: 'Usuários', href: '/usuarios', icon: Users },
    { name: 'Departamentos', href: '/departamentos', icon: Building2 },
    { name: 'Açougue Admin', href: '/acougue-admin', icon: ShoppingCart },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center group transition-transform hover:scale-105"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 shadow-lg group-hover:shadow-xl transition-shadow">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Painéis TV
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Sistema de Gestão
                </div>
              </div>
              <span className="sm:hidden text-lg font-bold text-gray-900 dark:text-white">
                PTV
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications - Hidden on mobile */}
            <button className="hidden sm:flex p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {user?.name || 'Usuário'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user?.name || 'Usuário'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Meu Perfil
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Configurações
                  </Link>
                  
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sair
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              aria-label="Menu de navegação"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-in-down">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                      }
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{item.name}</span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile Notifications */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 mr-3" />
                Notificações
                <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
