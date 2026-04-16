import { useState } from 'react';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('Квартал');

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2]">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-1.5">Аналітика</div>
      
      {/* Вкладки періодів */}
      <div className="flex gap-1 mb-4">
        {['Місяць', 'Квартал', 'Рік', 'Свій'].map(tab => (
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
          <div className="text-[20px] font-medium text-[#1a1a18]">90 500 грн</div>
          <div className="text-[11px] mt-1 text-[#1e7a48]">↑ 12% до Q1 2023</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Закуплено товарів</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">1 840 кг/л</div>
          <div className="text-[11px] mt-1 text-[#1e7a48]">↑ 8%</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Оброблено площі</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">45 га</div>
          <div className="text-[11px] mt-1 text-[#888]">з 57 га загалом</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Витрати на га</div>
          <div className="text-[20px] font-medium text-[#1a1a18]">2 011 грн</div>
          <div className="text-[11px] mt-1 text-[#c0392b]">↑ 5% — зростання</div>
        </div>
      </div>

      {/* Перший ряд графіків */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        
        {/* Закупівлі по місяцях */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Закупівлі по місяцях (грн)</div>
          <div className="flex items-end gap-2 h-[90px]">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-[#555]">18т</span>
              <div className="w-full bg-[#9dd4b2] rounded-t-[4px]" style={{ height: '42px' }}></div>
              <span className="text-[10px] text-[#aaa]">Січ</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-[#555]">24т</span>
              <div className="w-full bg-[#6ab88e] rounded-t-[4px]" style={{ height: '56px' }}></div>
              <span className="text-[10px] text-[#aaa]">Лют</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-[#555]">25т</span>
              <div className="w-full bg-[#2d7a50] rounded-t-[4px]" style={{ height: '58px' }}></div>
              <span className="text-[10px] text-[#aaa]">Бер</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-[#555]">32т</span>
              <div className="w-full bg-[#1e7a48] rounded-t-[4px]" style={{ height: '74px' }}></div>
              <span className="text-[10px] text-[#aaa]">Кві</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-[#555]">15т</span>
              <div className="w-full bg-[#9dd4b2] rounded-t-[4px]" style={{ height: '35px' }}></div>
              <span className="text-[10px] text-[#aaa]">Тра</span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-[#555]">—</span>
              <div className="w-full bg-[#e0e0db] rounded-t-[4px]" style={{ height: '2px' }}></div>
              <span className="text-[10px] text-[#aaa]">Чер</span>
            </div>
          </div>
        </div>

        {/* Структура витрат за типами */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Структура витрат за типами</div>
          <div className="flex items-center gap-4">
            <svg width="90" height="90" viewBox="0 0 36 36" className="shrink-0">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#e0e0db" strokeWidth="5"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#2d7a50" strokeWidth="5" strokeDasharray="47 42" strokeDashoffset="25" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#6ab88e" strokeWidth="5" strokeDasharray="31 58" strokeDashoffset="-22" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#3b9e6a" strokeWidth="5" strokeDasharray="16 73" strokeDashoffset="-53" transform="rotate(-90 18 18)"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#c5e8c5" strokeWidth="5" strokeDasharray="6 83" strokeDashoffset="-69" transform="rotate(-90 18 18)"/>
              <text x="18" y="21" textAnchor="middle" fontSize="6" fill="#1a1a18" fontWeight="500">47%</text>
            </svg>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[12px] text-[#555]">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#2d7a50]"></span> Добрива — 42 500 грн
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#555]">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#6ab88e]"></span> Гербіциди — 28 000 грн
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#555]">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#3b9e6a]"></span> Фунгіциди — 14 000 грн
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#555]">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#c5e8c5]"></span> Інсектициди — 6 000 грн
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Другий ряд графіків */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        
        {/* Витрати по полях */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Витрати по полях (грн/га)</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[72px] shrink-0">Поле №1</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#2d7a50] rounded-full" style={{ width: '75%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[52px] text-right shrink-0">820 грн</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[72px] shrink-0">Поле №2</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#3b9e6a] rounded-full" style={{ width: '52%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[52px] text-right shrink-0">373 грн</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[72px] shrink-0">Поле №3</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#6ab88e] rounded-full" style={{ width: '58%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[52px] text-right shrink-0">513 грн</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[72px] shrink-0">Поле №4</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#d0d0cc] rounded-full" style={{ width: '5%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[52px] text-right shrink-0">—</span>
            </div>
          </div>
        </div>

        {/* Топ постачальники */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-1">Топ постачальники</div>
          <div className="flex flex-col">
            <div className="flex justify-between items-center py-1.5 border-b border-[#f4f4f2]">
              <span className="text-[13px] text-[#1a1a18]">АгроХім Сервіс</span>
              <span className="text-[13px] font-medium text-[#1a1a18]">32 000 грн</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[#f4f4f2]">
              <span className="text-[13px] text-[#1a1a18]">Агросвіт</span>
              <span className="text-[13px] font-medium text-[#1a1a18]">30 000 грн</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[#f4f4f2]">
              <span className="text-[13px] text-[#1a1a18]">Зелений Лан</span>
              <span className="text-[13px] font-medium text-[#1a1a18]">18 500 грн</span>
            </div>
            <div className="flex justify-between items-center pt-1.5">
              <span className="text-[13px] text-[#1a1a18]">ЕкоФарм</span>
              <span className="text-[13px] font-medium text-[#1a1a18]">10 000 грн</span>
            </div>
          </div>
        </div>

      </div>

      {/* Кнопки експорту */}
      <div className="flex gap-2 justify-end mt-4">
        <button className="h-[32px] px-3.5 border border-[#d0d0cc] rounded-[7px] text-[12px] bg-white text-[#1a1a18] flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Завантажити PDF
        </button>
        <button className="h-[32px] px-3.5 bg-[#2d7a50] text-white rounded-[7px] text-[12px] flex items-center gap-1.5 hover:bg-opacity-90 transition-colors">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Експорт Excel
        </button>
      </div>

    </div>
  );
} 