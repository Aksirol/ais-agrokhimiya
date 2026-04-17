import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/analytics/home')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => console.error('Помилка завантаження дашборду:', err));
  }, []);

  if (loading || !data) {
    return <div className="p-5 text-gray-500">Завантаження дашборду...</div>;
  }

  const { kpis, categoryExpenses, totalExpenses, recentPurchases, alerts } = data;

  // Кольори для різних категорій хімікатів
  const categoryColors: Record<string, string> = {
    'Добриво': 'bg-[#2d7a50]',
    'Гербіцид': 'bg-[#3b9e6a]',
    'Фунгіцид': 'bg-[#6ab88e]',
    'Інсектицид': 'bg-[#9dd4b2]'
  };

  const getStatusBadge = (status: string) => {
    if (status === 'RECEIVED') return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Отримано</span>;
    if (status === 'ORDERED') return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#e6f1fb] text-[#0c447c]">Замовлено</span>;
    return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#fde8c0] text-[#7a4a10]">Очікує</span>;
  };

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2]">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Дашборд</div>
      
      {/* Метрики (Top KPIs) */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5 shadow-sm">
          <div className="text-[11px] text-[#888] mb-1.5">Всього закупівель</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">{kpis.purchasesTotal.toLocaleString()} грн</div>
          <div className="text-[11px] mt-1 text-[#1e7a48]">За весь період</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5 shadow-sm">
          <div className="text-[11px] text-[#888] mb-1.5">Позицій на складі</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">{kpis.inventoryCount}</div>
          <div className={`text-[11px] mt-1 ${kpis.lowStockCount > 0 ? 'text-[#c0392b] font-medium' : 'text-[#888]'}`}>
            {kpis.lowStockCount > 0 ? `${kpis.lowStockCount} потребують уваги` : 'Всі в нормі'}
          </div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5 shadow-sm">
          <div className="text-[11px] text-[#888] mb-1.5">Оброблено полів</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">{kpis.treatedFieldsCount} / {kpis.totalFieldsCount}</div>
          <div className="text-[11px] mt-1 text-[#888]">Активних ділянок</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5 shadow-sm">
          <div className="text-[11px] text-[#888] mb-1.5">Витрачено хімікатів</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">{kpis.chemicalsUsedTotal.toLocaleString()} од.</div>
          <div className="text-[11px] mt-1 text-[#888]">Списано на поля</div>
        </div>
      </div>

      {/* Нижня секція */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Графік: Витрати за категоріями */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-4 shadow-sm">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-4">Витрати за категоріями</div>
          <div className="flex flex-col gap-3">
            {Object.keys(categoryExpenses).length > 0 ? (
              Object.entries(categoryExpenses).map(([category, amount]: [string, any]) => {
                const percent = (amount / totalExpenses) * 100;
                const color = categoryColors[category] || 'bg-[#aaa]';
                
                return (
                  <div key={category} className="flex items-center gap-2">
                    <span className="text-[12px] text-[#555] w-[110px] shrink-0 truncate">{category}</span>
                    <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-[12px] font-medium text-[#555] w-[75px] text-right shrink-0">{amount.toLocaleString()} грн</span>
                  </div>
                );
              })
            ) : (
               <div className="text-[12px] text-gray-400 mt-2">Немає даних про витрати</div>
            )}
          </div>
        </div>

        {/* Права колонка (Списки) */}
        <div className="flex flex-col gap-3">
          
          {/* Останні закупівлі */}
          <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] p-4 shadow-sm">
            <div className="text-[13px] font-medium text-[#1a1a18] mb-2">Останні закупівлі</div>
            <div className="flex flex-col">
              {recentPurchases.length > 0 ? recentPurchases.map((purchase: any) => (
                <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-[#f0f0ee] last:border-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] text-[#1a1a18] font-medium">{purchase.supplier.name}</span>
                    <span className="text-[11px] text-[#999]">{format(new Date(purchase.order_date), 'dd.MM.yyyy')}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[13px] font-bold text-[#2d7a50]">{Number(purchase.total_amount).toLocaleString()} грн</span>
                    {getStatusBadge(purchase.status)}
                  </div>
                </div>
              )) : (
                <div className="text-[12px] text-gray-400 mt-2">Немає останніх закупівель</div>
              )}
            </div>
          </div>

          {/* Сповіщення */}
          <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] p-4 shadow-sm">
            <div className="text-[13px] font-medium text-[#1a1a18] mb-2">Автоматичні сповіщення</div>
            <div className="flex flex-col">
              {alerts.length > 0 ? alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-2.5 py-2 border-b border-[#f0f0ee] last:border-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${alert.color}`}></div>
                  <div>
                    <div className="text-[13px] font-medium text-[#1a1a18] leading-snug">{alert.title}</div>
                    <div className="text-[11px] text-[#777] mt-0.5">{alert.subtitle}</div>
                  </div>
                </div>
              )) : (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[16px]">✅</span>
                  <span className="text-[12px] text-[#2d7a50] font-medium">Все працює ідеально! Немає нових сповіщень.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}