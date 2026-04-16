import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Bell, User, LayoutDashboard, ShoppingCart,
  Package, Map, BarChart2, LogOut, ChevronDown, Search
} from 'lucide-react';
import { Database } from 'lucide-react'; // Додаємо іконку бази даних
import Dictionaries from './pages/Dictionaries'; // Імпорт нової сторінки

import Purchases from './pages/Purchases';
import InventoryPage from './pages/Inventory';
import Fields from './pages/Fields';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

type PageType = 'dashboard' | 'purchases' | 'inventory' | 'fields' | 'applications' | 'analytics' | 'dictionaries';

function App() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- НОВІ СТАНИ ДЛЯ ШАПКИ ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Ініціалізація та завантаження даних
  useEffect(() => {
    const token = localStorage.getItem('agro_token');
    const user = localStorage.getItem('agro_user');

    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
      fetchGlobalNotifications(); // Завантажуємо сповіщення
    }

    // Закриття всіх випадаючих меню при кліку в іншому місці
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setIsNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setIsSearchFocused(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAuthenticated]);

  // Функція завантаження глобальних сповіщень
  const fetchGlobalNotifications = async () => {
    try {
      const res = await axios.get('/api/analytics/home');
      setNotifications(res.data.alerts || []);
    } catch (error) {
      console.error('Помилка завантаження сповіщень');
    }
  };

  const handleLogin = (token: string, user: any) => {
    localStorage.setItem('agro_token', token);
    localStorage.setItem('agro_user', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsProfileOpen(false);
  };

  // Логіка швидкого пошуку (Навігація)
  const handleSearchNavigate = (page: PageType) => {
    setActivePage(page);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  const canSeeAdvanced = currentUser?.role === 'admin' || currentUser?.role === 'agronomist';

  return (
    <div className="flex h-screen bg-[#f5f5f2] font-sans text-gray-800">

      {/* Sidebar */}
      <aside className="w-[200px] bg-[#1e4d35] text-white flex flex-col shrink-0 z-20">
        <div className="h-[52px] flex items-center px-4 border-b border-[#2a6045] gap-2.5">
          <div className="w-7 h-7 bg-[#2d7a50] rounded-md flex items-center justify-center">
            <svg width="16" height="16" fill="#7ecba0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg>
          </div>
          <span className="text-[13px] font-medium text-[#e8f5ee]">АІС «Агрохімія»</span>
        </div>

        <nav className="flex-1 py-3 flex flex-col">
          <button onClick={() => setActivePage('dashboard')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'dashboard' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
            <LayoutDashboard size={16} /> Дашборд
          </button>
          <button onClick={() => setActivePage('purchases')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'purchases' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
            <ShoppingCart size={16} /> Закупівлі
          </button>
          <button onClick={() => setActivePage('inventory')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors ${activePage === 'inventory' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
            <Package size={16} /> Склад
          </button>

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
          {currentUser?.role === 'admin' && (
            <button onClick={() => setActivePage('dictionaries')} className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-colors mt-auto mb-2 ${activePage === 'dictionaries' ? 'bg-[#2d7a50] text-[#e8f5ee]' : 'text-[#b0d4be] hover:bg-[#2a5e42]'}`}>
              <Database size={16} /> Довідники
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-[#2a6045]">
          <button onClick={handleLogout} className="flex items-center gap-2.5 text-[13px] text-[#7ecba0] hover:text-white transition-colors w-full">
            <LogOut size={16} /> Вихід
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-[52px] bg-white border-b border-[#e0e0db] px-5 flex items-center justify-between shrink-0 z-10">

          {/* РОЗУМНИЙ ПОШУК */}
          <div className="relative" ref={searchRef}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-[280px] h-8 bg-[#f8f8f6] border border-[#d0d0cc] rounded-lg px-3 pl-8 text-[13px] focus:outline-none focus:border-[#2d7a50] transition-all focus:w-[320px]"
              placeholder="Швидкий пошук..."
            />

            {/* Випадаюче вікно пошуку */}
            {isSearchFocused && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#e0e0db] rounded-lg shadow-lg py-2">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Шукати "{searchQuery}" в:</div>
                <button onClick={() => handleSearchNavigate('inventory')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 flex items-center gap-2">
                  <Package size={14} className="text-[#2d7a50]" /> На складі
                </button>
                <button onClick={() => handleSearchNavigate('purchases')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 flex items-center gap-2">
                  <ShoppingCart size={14} className="text-[#2d7a50]" /> В закупівлях
                </button>
                {canSeeAdvanced && (
                  <button onClick={() => handleSearchNavigate('applications')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 flex items-center gap-2">
                    <span className="text-[14px]">🌱</span> В журналі використання
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">

            {/* СПОВІЩЕННЯ (Дзвіночок) */}
            <div className="relative" ref={notifRef}>
              <div
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-8 h-8 border border-[#d0d0cc] rounded-md flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors relative"
              >
                <Bell size={15} className="text-[#555]" />
                {/* Червона крапка, якщо є сповіщення */}
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Випадаюче вікно сповіщень */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-[320px] bg-white border border-[#e0e0db] rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-[#f0f0ee] bg-[#f8f8f6] flex justify-between items-center">
                    <span className="text-[13px] font-medium text-[#1a1a18]">Сповіщення</span>
                    <span className="text-[11px] bg-[#e0e0db] px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>

                  <div className="max-h-[300px] overflow-auto flex flex-col">
                    {notifications.length > 0 ? notifications.map((alert: any) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 border-b border-[#f0f0ee] hover:bg-[#fafaf8] cursor-pointer" onClick={() => handleSearchNavigate(alert.id.startsWith('inv') ? 'inventory' : 'purchases')}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.color}`}></div>
                        <div>
                          <div className="text-[12px] font-medium text-[#1a1a18] leading-tight">{alert.title}</div>
                          <div className="text-[11px] text-[#777] mt-1">{alert.subtitle}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-[12px] text-gray-500">
                        <div className="text-2xl mb-2">🎉</div>
                        Нових сповіщень немає
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <button onClick={() => handleSearchNavigate('dashboard')} className="p-2 text-center text-[11px] font-medium text-[#2d7a50] bg-[#f8f8f6] hover:bg-[#e8f5ee] transition-colors border-t border-[#f0f0ee]">
                      Перейти на Дашборд
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ПРОФІЛЬ */}
            <div className="h-5 w-[1px] bg-[#d0d0cc]"></div>

            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 pr-2 rounded-md transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#2d7a50] text-white text-[11px] font-medium flex items-center justify-center shadow-sm">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'ІІ'}
                </div>
                <span className="text-[13px] text-[#444] font-medium">{currentUser?.name || 'Користувач'}</span>
                <ChevronDown size={14} className={`text-[#888] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Випадаюче вікно профілю */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-[200px] bg-white border border-[#e0e0db] rounded-lg shadow-lg py-1">
                  <div className="px-4 py-3 border-b border-[#f0f0ee] bg-[#fafaf8]">
                    <p className="text-[13px] font-medium text-[#1a1a18]">{currentUser?.name}</p>
                    <p className="text-[11px] text-[#666] truncate mt-0.5">{currentUser?.email}</p>
                    <p className="text-[10px] text-[#2d7a50] mt-1.5 font-bold uppercase tracking-wider">{currentUser?.role}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-[12px] text-[#444] hover:bg-[#f8f8f6] transition-colors flex items-center gap-2">
                      <User size={14} className="text-[#888]" /> Налаштування
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[12px] text-[#c0392b] hover:bg-[#fce8e8] transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} /> Вийти з системи
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content Area */}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'purchases' && <Purchases />}
        {activePage === 'inventory' && <InventoryPage />}

        {canSeeAdvanced && (
          <>
            {activePage === 'fields' && <Fields />}
            {activePage === 'applications' && <Applications />}
            {activePage === 'analytics' && <Analytics />}
          </>
        )}
        {currentUser?.role === 'admin' && activePage === 'dictionaries' && <Dictionaries />}
      </main>
    </div>
  );
}

export default App;