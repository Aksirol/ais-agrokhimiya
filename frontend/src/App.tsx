import { useState, useEffect, useRef } from 'react';
import { 
  Bell, User, LayoutDashboard, ShoppingCart, 
  Package, Map, BarChart2, LogOut, ChevronDown 
} from 'lucide-react';

import Purchases from './pages/Purchases';
import InventoryPage from './pages/Inventory';
import Fields from './pages/Fields';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

type PageType = 'dashboard' | 'purchases' | 'inventory' | 'fields' | 'applications' | 'analytics';

function App() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Стан для випадаючого меню профілю
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('agro_token');
    const user = localStorage.getItem('agro_user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }

    // Закриття меню при кліку в будь-якому іншому місці
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (token: string, user: any) => {
    localStorage.setItem('agro_token', token);
    localStorage.setItem('agro_user', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
    // Примусово перекидаємо на дашборд при новому вході
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsProfileOpen(false);
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  // Зручна змінна для перевірки доступу
  const canSeeAdvanced = currentUser?.role === 'admin' || currentUser?.role === 'agronomist';

  return (
    <div className="flex h-screen bg-[#f5f5f2] font-sans text-gray-800">
      
      {/* Sidebar */}
      <aside className="w-[200px] bg-[#1e4d35] text-white flex flex-col shrink-0">
        <div className="h-[52px] flex items-center px-4 border-b border-[#2a6045] gap-2.5">
          <div className="w-7 h-7 bg-[#2d7a50] rounded-md flex items-center justify-center">
            <svg width="16" height="16" fill="#7ecba0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
          </div>
          <span className="text-[13px] font-medium text-[#e8f5ee]">АІС «Агрохімія»</span>
        </div>

        <nav className="flex-1 py-3 flex flex-col">
          {/* Доступно всім */}
          <button onClick={() => setActivePage('dashboard')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'dashboard' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
            <LayoutDashboard size={16} /> Дашборд
          </button>
          <button onClick={() => setActivePage('purchases')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'purchases' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
            <ShoppingCart size={16} /> Закупівлі
          </button>
          <button onClick={() => setActivePage('inventory')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'inventory' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
            <Package size={16} /> Склад
          </button>

          {/* Приховані пункти для Оператора */}
          {canSeeAdvanced && (
            <>
              <button onClick={() => setActivePage('applications')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'applications' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
                <div className="w-4 h-4 flex items-center justify-center text-current">🌱</div> Використання
              </button>
              <button onClick={() => setActivePage('fields')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'fields' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
                <Map size={16} /> Поля
              </button>
              <button onClick={() => setActivePage('analytics')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'analytics' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
                <BarChart2 size={16} /> Аналітика
              </button>
            </>
          )}
        </nav>

        {/* Кнопка виходу в сайдбарі */}
        <div className="p-4 border-t border-[#2a6045]">
          <button onClick={handleLogout} className="flex items-center gap-2.5 text-[13px] text-[#7ecba0] hover:text-white transition-colors w-full">
            <LogOut size={16} /> Вихід
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-[52px] bg-white border-b border-[#e0e0db] px-5 flex items-center justify-between shrink-0">
          <input className="w-[280px] h-8 bg-[#f8f8f6] border border-[#d0d0cc] rounded-lg px-3 pl-8 text-[13px] focus:outline-none focus:border-[#2d7a50]" placeholder="Пошук..." />
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-[#d0d0cc] rounded-md flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors">
              <Bell size={14} className="text-[#666]" />
            </div>

            {/* Профіль з випадаючим меню */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 px-2 rounded-md transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#2d7a50] text-white text-[11px] font-medium flex items-center justify-center shadow-sm">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'ІІ'}
                </div>
                <span className="text-[13px] text-[#444] font-medium">{currentUser?.name || 'Іван Іванов'}</span>
                <ChevronDown size={12} className={`text-[#666] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e0e0db] rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#f0f0ee]">
                    <p className="text-[12px] font-semibold text-gray-800">{currentUser?.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{currentUser?.email}</p>
                    <p className="text-[10px] text-[#2d7a50] mt-0.5 font-medium uppercase tracking-wider">{currentUser?.role}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <User size={14} /> Мій профіль
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} /> Вийти
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'purchases' && <Purchases />}
        {activePage === 'inventory' && <InventoryPage />}
        
        {/* Захищений рендер сторінок */}
        {canSeeAdvanced && (
          <>
            {activePage === 'fields' && <Fields />}
            {activePage === 'applications' && <Applications />}
            {activePage === 'analytics' && <Analytics />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;