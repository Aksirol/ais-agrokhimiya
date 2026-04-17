import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Bell, LayoutDashboard, ShoppingCart,
  Package, Map, BarChart2, LogOut, ChevronDown, Search
} from 'lucide-react';

// ... (імпорти сторінок залишаються без змін)
import Purchases from './pages/Purchases';
import InventoryPage from './pages/Inventory';
import Fields from './pages/Fields';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Dictionaries from './pages/Dictionaries';

import type { AuthUser, AlertNotification } from './types';

type PageType = 'dashboard' | 'purchases' | 'inventory' | 'fields' | 'applications' | 'analytics' | 'dictionaries';

function App() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ТЕПЕР TS ЗНАЄ, ЯКІ ПОЛЯ Є У КОРИСТУВАЧА
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null); 
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false); // Стан для червоної крапки
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('agro_token');
    const user = localStorage.getItem('agro_user');

    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
      fetchGlobalNotifications();
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setIsNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setIsSearchFocused(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAuthenticated]);

  const fetchGlobalNotifications = async () => {
    try {
      const res = await axios.get('/api/analytics/home');
      const alerts = res.data.alerts || [];
      setNotifications(alerts);
      // Якщо є хоча б одне сповіщення — ставимо позначку
      if (alerts.length > 0) setHasUnread(true);
    } catch (error) {
      console.error('Помилка завантаження сповіщень');
    }
  };

  // Обробник відкриття сповіщень
  const handleToggleNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
      setHasUnread(false); // Прибираємо позначку при відкритті
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleSearchNavigate = (page: PageType) => {
    setActivePage(page);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  if (!isAuthenticated) return <Login onLogin={(token, user) => {
    localStorage.setItem('agro_token', token);
    localStorage.setItem('agro_user', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActivePage('dashboard');
  }} />;

  const canSeeAdvanced = currentUser?.role === 'admin' || currentUser?.role === 'agronomist';

  return (
    <div className="flex h-screen bg-[#f5f5f2] font-sans text-gray-800">

      {/* Sidebar */}
      <aside className="w-[200px] bg-[#1e4d35] text-white flex flex-col shrink-0 z-20 shadow-xl">
        <div className="h-[52px] flex items-center px-4 border-b border-[#2a6045] gap-2.5">
          <div className="w-7 h-7 bg-[#2d7a50] rounded-md flex items-center justify-center">
            <svg width="16" height="16" fill="#7ecba0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg>
          </div>
          <span className="text-[13px] font-bold text-[#e8f5ee] tracking-tight">АІС «Агрохімія»</span>
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
              <div className="w-4 h-4 flex items-center justify-center text-current">⚙️</div> Довідники
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
          <div className="relative" ref={searchRef}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-[280px] h-8 bg-[#f8f8f6] border border-[#d0d0cc] rounded-lg px-3 pl-8 text-[13px] focus:outline-none focus:border-[#2d7a50] transition-all focus:w-[320px]"
              placeholder="Швидкий пошук..."
            />
            {isSearchFocused && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#e0e0db] rounded-lg shadow-xl py-2 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Шукати "{searchQuery}" в:</div>
                <button onClick={() => handleSearchNavigate('inventory')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 flex items-center gap-2">
                  <Package size={14} className="text-[#2d7a50]" /> Склад
                </button>
                <button onClick={() => handleSearchNavigate('purchases')} className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 flex items-center gap-2">
                  <ShoppingCart size={14} className="text-[#2d7a50]" /> Закупівлі
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <div
                onClick={handleToggleNotif}
                className="w-8 h-8 border border-[#d0d0cc] rounded-md flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors relative"
              >
                <Bell size={15} className="text-[#555]" />
                {hasUnread && notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-[320px] bg-white border border-[#e0e0db] rounded-lg shadow-2xl overflow-hidden flex flex-col z-50">
                  <div className="px-4 py-3 border-b border-[#f0f0ee] bg-[#f8f8f6] flex justify-between items-center font-medium text-[13px]">
                    Сповіщення
                    <span className="text-[11px] bg-[#e0e0db] px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-[300px] overflow-auto">
                    {notifications.length > 0 ? notifications.map((alert: any) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 border-b border-[#f0f0ee] hover:bg-[#fafaf8] cursor-pointer" onClick={() => handleSearchNavigate(alert.id.startsWith('inv') ? 'inventory' : 'purchases')}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.color}`}></div>
                        <div>
                          <div className="text-[12px] font-semibold text-[#1a1a18] leading-tight">{alert.title}</div>
                          <div className="text-[11px] text-[#777] mt-1">{alert.subtitle}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-[12px] text-gray-500">🎉 Нових сповіщень немає</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-[1px] bg-[#d0d0cc]"></div>

            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 pr-2 rounded-md transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#2d7a50] text-white text-[11px] font-bold flex items-center justify-center shadow-inner">
                  {currentUser?.name?.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-[13px] text-[#444] font-semibold">{currentUser?.name}</span>
                <ChevronDown size={14} className={`text-[#888] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-[200px] bg-white border border-[#e0e0db] rounded-lg shadow-2xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-[#f0f0ee] bg-[#fafaf8]">
                    <p className="text-[13px] font-bold text-[#1a1a18]">{currentUser?.name}</p>
                    <p className="text-[11px] text-[#666] truncate">{currentUser?.email}</p>
                    <p className="text-[10px] text-[#2d7a50] mt-1.5 font-black uppercase tracking-widest">{currentUser?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-[#c0392b] font-medium hover:bg-[#fce8e8] transition-colors flex items-center gap-2"
                  >
                    <LogOut size={14} /> Вийти
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'purchases' && <Purchases />}
          {activePage === 'inventory' && <InventoryPage />}
          {canSeeAdvanced && activePage === 'fields' && <Fields />}
          {canSeeAdvanced && activePage === 'applications' && <Applications />}
          {canSeeAdvanced && activePage === 'analytics' && <Analytics />}
          {currentUser?.role === 'admin' && activePage === 'dictionaries' && <Dictionaries />}
        </div>
      </main>
    </div>
  );
}

export default App;