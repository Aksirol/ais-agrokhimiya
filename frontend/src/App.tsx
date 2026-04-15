import { useState } from 'react';
import {
  Bell, User, LayoutDashboard, ShoppingCart,
  Package, Map, BarChart2, LogOut, ChevronDown
} from 'lucide-react';

import Purchases from './pages/Purchases';
import InventoryPage from './pages/Inventory';
import Fields from './pages/Fields';             // НОВЕ
import Applications from './pages/Applications'; // НОВЕ
import Analytics from './pages/Analytics'; // НОВЕ

// Тип для всіх можливих сторінок
type PageType = 'purchases' | 'inventory' | 'fields' | 'applications' | 'analytics'; // Додано 'analytics'

function App() {
  const [activePage, setActivePage] = useState<PageType>('purchases');

  // Допоміжна функція для заголовка
  const getPageTitle = () => {
    switch (activePage) {
      case 'purchases': return 'Закупівлі';
      case 'inventory': return 'Склад';
      case 'fields': return 'Поля';
      case 'applications': return 'Журнал використання';
      case 'analytics': return 'Аналітика';
      default: return 'АІС "Агрохімія"';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">

      <aside className="w-64 bg-agro-dark text-white flex flex-col shadow-lg z-10">
        <div className="h-16 flex items-center px-6 border-b border-white/10 font-bold text-lg gap-2">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">💧</div>
          АІС "Агрохімія"
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/10 transition-colors w-full text-left">
            <LayoutDashboard size={20} /> Дашборд
          </button>

          <button onClick={() => setActivePage('purchases')} className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left ${activePage === 'purchases' ? 'bg-agro-light text-white font-medium shadow-sm' : 'hover:bg-white/10'}`}>
            <ShoppingCart size={20} /> Закупівлі
          </button>

          <button onClick={() => setActivePage('inventory')} className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left ${activePage === 'inventory' ? 'bg-agro-light text-white font-medium shadow-sm' : 'hover:bg-white/10'}`}>
            <Package size={20} /> Склад
          </button>

          {/* Кнопка "Використання" */}
          <button onClick={() => setActivePage('applications')} className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left ${activePage === 'applications' ? 'bg-agro-light text-white font-medium shadow-sm' : 'hover:bg-white/10'}`}>
            <div className="w-5 h-5 flex items-center justify-center">🌱</div> Використання
          </button>

          {/* Кнопка "Поля" */}
          <button onClick={() => setActivePage('fields')} className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left ${activePage === 'fields' ? 'bg-agro-light text-white font-medium shadow-sm' : 'hover:bg-white/10'}`}>
            <Map size={20} /> Поля
          </button>

          <button onClick={() => setActivePage('analytics')} className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors w-full text-left ${activePage === 'analytics' ? 'bg-agro-light text-white font-medium shadow-sm' : 'hover:bg-white/10'}`}>
            <BarChart2 size={20} /> Аналітика
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/10 transition-colors w-full text-left">
            <LogOut size={20} /> Вихід
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 flex-shrink-0">
          <div className="font-semibold text-xl text-gray-800">
            {getPageTitle()}
          </div>
          <div className="flex items-center gap-6">
            <Bell className="text-gray-500 hover:text-gray-800 cursor-pointer" size={20} />
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                <User size={18} />
              </div>
              <span className="text-sm font-medium">Іван Іванов</span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </header>

        {activePage === 'purchases' && <Purchases />}
        {activePage === 'inventory' && <InventoryPage />}
        {activePage === 'fields' && <Fields />}
        {activePage === 'applications' && <Applications />}
        {activePage === 'analytics' && <Analytics />}
      </main>
    </div>
  );
}

export default App;