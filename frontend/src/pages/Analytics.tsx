import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Всі дані');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Функція для перетворення назви вкладки у формат, який розуміє бекенд
  const getPeriodParam = (tab: string) => {
    switch (tab) {
      case 'Місяць': return 'month';
      case 'Квартал': return 'quarter';
      case 'Рік': return 'year';
      case 'Всі дані': return 'all';
      default: return 'all';
    }
  };

  useEffect(() => {
    setLoading(true); // Включаємо завантаження при зміні вкладки
    const token = localStorage.getItem('agro_token');
    const period = getPeriodParam(activeTab);

    // Додаємо параметр period до запиту
    axios.get(`/api/analytics/dashboard?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Помилка завантаження аналітики:', err);
        setLoading(false);
      });
  }, [activeTab]); // useEffect спрацює знову, коли activeTab зміниться

  if (loading && !data) {
    return <div className="p-5 text-gray-500">Завантаження аналітики...</div>;
  }

  if (!data) return null; // Захист, якщо дані ще не прийшли

  // --- МАТЕМАТИКА ДЛЯ КРУГОВОЇ ДІАГРАМИ (Категорії) ---
  const categories = Object.entries(data.categoryExpenses || {}).map(([name, val]) => ({ name, value: Number(val) }));
  const totalCategorySum = categories.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const colors = ['#2d7a50', '#6ab88e', '#3b9e6a', '#c5e8c5'];
  
  const radius = 14;
  const circumference = 2 * Math.PI * radius; 
  let cumulativePercent = 0;

  // --- МАТЕМАТИКА ДЛЯ ГРАФІКІВ (Пошук максимумів) ---
  const monthlyDataArray = data.monthlyData || [];
  const maxMonthValue = Math.max(...monthlyDataArray, 1); 
  
  // Беремо назви місяців з бекенду (важливо, бо їхня кількість може змінюватись)
  const monthNames = data.monthNames || ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

  const fieldEntries = Object.entries(data.fieldUsage || {}).map(([name, val]) => ({ name, value: Number(val) })).slice(0, 4);
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

      {loading && <div className="text-[12px] text-gray-500 mb-2">Оновлення даних...</div>}

      {/* Метрики (KPIs) */}
      <div className="grid grid-cols-4 gap-2.5 mb-3.5">
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Загальні витрати</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis?.totalExpenses?.toLocaleString() || 0} грн</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Закуплено товарів</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis?.totalVolume?.toLocaleString() || 0} кг/л</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Оброблено площі</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis?.treatedArea || 0} га</div>
          <div className="text-[11px] mt-1 text-[#888]">з {data.kpis?.totalArea || 0} га загалом</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Витрати на га</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">{data.kpis?.expensePerHa?.toLocaleString() || 0} грн</div>
        </div>
      </div>

      {/* Перший ряд графіків */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        
        {/* Закупівлі по місяцях (Стовпчики) */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5 flex flex-col h-full">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Закупівлі по місяцях (грн)</div>
          
          {/* Збільшили висоту контейнера зі 100px до 110px і додали відступ зверху pt-2 */}
          <div className="flex items-end gap-2 h-[110px] mt-auto pt-2">
            {monthlyDataArray.length > 0 ? monthlyDataArray.map((val: number, idx: number) => {
              
              // ГОЛОВНЕ ВИПРАВЛЕННЯ: Тепер максимальна висота стовпчика - 75px замість 100
              const barHeight = val === 0 ? 2 : (val / maxMonthValue) * 75; 
              
              return (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[9px] text-[#555]">{val > 0 ? `${(val/1000).toFixed(1)}к` : '—'}</span>
                  <div 
                    className="w-full rounded-t-[4px] transition-all duration-500" 
                    // Використовуємо нашу нову розраховану висоту
                    style={{ height: `${barHeight}px`, backgroundColor: val > 0 ? '#6ab88e' : '#e0e0db' }}
                  ></div>
                  <span className="text-[10px] text-[#aaa]">{monthNames[idx] || ''}</span>
                </div>
              );
            }) : <div className="text-[12px] text-gray-400 m-auto">Немає даних за цей період</div>}
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
            {data.topSuppliers?.length > 0 ? data.topSuppliers.map((sup: any, idx: number) => (
              <div key={sup.name} className={`flex justify-between items-center py-2 ${idx !== data.topSuppliers.length -1 ? 'border-b border-[#f4f4f2]' : ''}`}>
                <span className="text-[13px] text-[#1a1a18]">{sup.name}</span>
                <span className="text-[13px] font-medium text-[#1a1a18]">{sup.total.toLocaleString()} грн</span>
              </div>
            )) : <div className="text-[12px] text-gray-400 mt-2">Немає закупівель</div>}
          </div>
        </div>

      </div>
    </div>
  );
}