import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Всі дані');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/analytics/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => console.error('Помилка завантаження аналітики:', err));
  }, []);

  if (loading || !data) {
    return <div className="p-5 text-gray-500">Завантаження аналітики...</div>;
  }

  // --- МАТЕМАТИКА ДЛЯ КРУГОВОЇ ДІАГРАМИ (Категорії) ---
  const categories = Object.entries(data.categoryExpenses).map(([name, val]) => ({ name, value: Number(val) }));
  const totalCategorySum = categories.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const colors = ['#2d7a50', '#6ab88e', '#3b9e6a', '#c5e8c5'];
  
  const radius = 14;
  const circumference = 2 * Math.PI * radius; // Довжина кола
  let cumulativePercent = 0;

  // --- МАТЕМАТИКА ДЛЯ ГРАФІКІВ (Пошук максимумів) ---
  const maxMonthValue = Math.max(...data.monthlyData, 1); // Щоб уникнути ділення на 0
  const monthNames = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'];

  const fieldEntries = Object.entries(data.fieldUsage).map(([name, val]) => ({ name, value: Number(val) })).slice(0, 4);
  const maxFieldValue = Math.max(...fieldEntries.map(f => f.value), 1);

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2]">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-1.5">Аналітика (Real-time)</div>
      
      {/* Вкладки періодів */}
      <div className="flex gap-1 mb-4">
        {['Місяць', 'Квартал', 'Рік', 'Всі дані'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-[30px] px-3.5 border rounded-[7px] text-[12px] transition-colors ${
              activeTab === tab 
                ? 'bg-[#2d7a50] text-white border-[#2d7a50]' 
                : 'bg-white text-[#666] border-[#d0d0cc] hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Метрики (KPIs) */}
      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Загальні витрати</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis.totalExpenses.toLocaleString()} грн</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Закуплено товарів</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis.totalVolume.toLocaleString()} кг/л</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Оброблено площі</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis.treatedArea} га</div>
          <div className="text-[11px] mt-1 text-[#888]">з {data.kpis.totalArea} га загалом</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Витрати на га</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis.expensePerHa.toLocaleString()} грн</div>
        </div>
      </div>

      {/* Перший ряд графіків */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        
        {/* Закупівлі по місяцях (Стовпчики) */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5 flex flex-col">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Закупівлі по місяцях (грн)</div>
          <div className="flex items-end gap-2 h-[100px] mt-auto">
            {data.monthlyData.map((val: number, idx: number) => {
              const heightPercent = val === 0 ? 2 : (val / maxMonthValue) * 100;
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[9px] text-[#555]">{val > 0 ? `${(val/1000).toFixed(1)}к` : '—'}</span>
                  <div 
                    className="w-full rounded-t-[4px] transition-all duration-500" 
                    style={{ height: `${heightPercent}px`, backgroundColor: val > 0 ? '#6ab88e' : '#e0e0db' }}
                  ></div>
                  <span className="text-[10px] text-[#aaa]">{monthNames[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Структура витрат (SVG Донут) */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Структура закупівель за типами</div>
          {categories.length > 0 ? (
            <div className="flex items-center gap-4">
              <svg width="90" height="90" viewBox="0 0 36 36" className="shrink-0 -rotate-90">
                <circle cx="18" cy="18" r={radius} fill="none" stroke="#e0e0db" strokeWidth="5"/>
                
                {categories.map((cat, idx) => {
                  const percent = (cat.value / totalCategorySum) * 100;
                  const dashValue = (percent / 100) * circumference;
                  const offsetValue = -((cumulativePercent / 100) * circumference);
                  cumulativePercent += percent;

                  return (
                    <circle 
                      key={cat.name} cx="18" cy="18" r={radius} fill="none" 
                      stroke={colors[idx % colors.length]} strokeWidth="5" 
                      strokeDasharray={`${dashValue} ${circumference}`} 
                      strokeDashoffset={offsetValue} 
                      className="transition-all duration-1000 ease-out"
                    />
                  );
                })}
              </svg>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-1.5 text-[12px] text-[#555]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }}></span> 
                    {cat.name} — {cat.value.toLocaleString()} грн
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-gray-400 mt-5">Немає даних для відображення</div>
          )}
        </div>

      </div>

      {/* Другий ряд графіків */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        
        {/* Використання по полях */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Об'єм використання по полях (кг/л)</div>
          <div className="flex flex-col gap-3">
            {fieldEntries.length > 0 ? fieldEntries.map(field => {
              const widthPercent = (field.value / maxFieldValue) * 100;
              return (
                <div key={field.name} className="flex items-center gap-2">
                  <span className="text-[12px] text-[#555] w-[72px] shrink-0 truncate">{field.name}</span>
                  <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2d7a50] rounded-full transition-all duration-1000" style={{ width: `${widthPercent}%` }}></div>
                  </div>
                  <span className="text-[12px] text-[#555] w-[52px] text-right shrink-0">{field.value} од.</span>
                </div>
              );
            }) : <div className="text-[12px] text-gray-400">Журнал використання порожній</div>}
          </div>
        </div>

        {/* Топ постачальники */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-1">Топ постачальники (витрати)</div>
          <div className="flex flex-col">
            {data.topSuppliers.length > 0 ? data.topSuppliers.map((sup: any, idx: number) => (
              <div key={sup.name} className={`flex justify-between items-center py-2 ${idx !== data.topSuppliers.length -1 ? 'border-b border-[#f4f4f2]' : ''}`}>
                <span className="text-[13px] text-[#1a1a18]">{sup.name}</span>
                <span className="text-[13px] font-medium text-[#1a1a18]">{sup.total.toLocaleString()} грн</span>
              </div>
            )) : <div className="text-[12px] text-gray-400 mt-2">Немає закупівель</div>}
          </div>
        </div>

      </div>

      {/* Кнопки експорту (Заглушки для вигляду) */}
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={() => window.print()} className="h-[32px] px-3.5 border border-[#d0d0cc] rounded-[7px] text-[12px] bg-white text-[#1a1a18] flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Друк / PDF
        </button>
      </div>

    </div>
  );
}