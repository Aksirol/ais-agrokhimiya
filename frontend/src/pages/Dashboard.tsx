import { useState, useEffect } from 'react';

export default function Dashboard() {
  // Тут в майбутньому ми додамо axios-запити для отримання реальних даних
  // Поки що використовуємо статичні дані з твого макета для ідеального вигляду

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2]">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Дашборд</div>
      
      {/* Метрики (Top KPIs) */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Закупівлі (квартал)</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">90 500 грн</div>
          <div className="text-[11px] mt-1 text-[#1e7a48]">↑ 12% до минулого кв.</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Позицій на складі</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">24</div>
          <div className="text-[11px] mt-1 text-[#b45309]">3 на мінімумі</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Оброблено полів</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">8 / 12</div>
          <div className="text-[11px] mt-1 text-[#1e7a48]">↑ 2 цього тижня</div>
        </div>
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-3.5">
          <div className="text-[11px] text-[#888] mb-1.5">Витрачено хімікатів</div>
          <div className="text-[22px] font-medium text-[#1a1a18] leading-none">1 240 кг</div>
          <div className="text-[11px] mt-1 text-[#888]">з початку сезону</div>
        </div>
      </div>

      {/* Нижня секція */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Графік: Витрати за категоріями */}
        <div className="bg-white border border-[#e0e0db] rounded-[10px] p-4">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Витрати за категоріями</div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[110px] shrink-0 truncate">Добрива</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#2d7a50] rounded-full" style={{ width: '78%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[70px] text-right shrink-0">42 500 грн</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[110px] shrink-0 truncate">Гербіциди</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#3b9e6a] rounded-full" style={{ width: '55%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[70px] text-right shrink-0">28 000 грн</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[110px] shrink-0 truncate">Фунгіциди</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#6ab88e] rounded-full" style={{ width: '28%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[70px] text-right shrink-0">14 000 грн</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#555] w-[110px] shrink-0 truncate">Інсектициди</span>
              <div className="flex-1 h-2 bg-[#f0f0ee] rounded-full overflow-hidden">
                <div className="h-full bg-[#9dd4b2] rounded-full" style={{ width: '13%' }}></div>
              </div>
              <span className="text-[12px] text-[#555] w-[70px] text-right shrink-0">6 000 грн</span>
            </div>
          </div>
        </div>

        {/* Права колонка (Списки) */}
        <div className="flex flex-col gap-3">
          
          {/* Останні закупівлі */}
          <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] p-4">
            <div className="text-[13px] font-medium text-[#1a1a18] mb-2">Останні закупівлі</div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between py-2 border-b border-[#f0f0ee]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-[#1a1a18]">АгроХім Сервіс</span>
                  <span className="text-[11px] text-[#999]">12.03.2024</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[13px] font-medium text-[#1a1a18]">25 000 грн</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Отримано</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f0f0ee]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-[#1a1a18]">Зелений Лан</span>
                  <span className="text-[11px] text-[#999]">20.03.2024</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[13px] font-medium text-[#1a1a18]">18 500 грн</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#fde8c0] text-[#7a4a10]">Замовлено</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-[#1a1a18]">Агросвіт</span>
                  <span className="text-[11px] text-[#999]">25.03.2024</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[13px] font-medium text-[#1a1a18]">32 000 грн</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Отримано</span>
                </div>
              </div>
            </div>
          </div>

          {/* Сповіщення */}
          <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] p-4">
            <div className="text-[13px] font-medium text-[#1a1a18] mb-2">Сповіщення</div>
            <div className="flex flex-col">
              <div className="flex items-start gap-2.5 py-2 border-b border-[#f0f0ee]">
                <div className="w-2 h-2 rounded-full shrink-0 mt-1 bg-[#e24b4a]"></div>
                <div>
                  <div className="text-[13px] text-[#1a1a18] leading-snug">Нітроамофоска — залишок 45 кг</div>
                  <div className="text-[11px] text-[#999] mt-0.5">Мінімальний поріг: 100 кг</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2">
                <div className="w-2 h-2 rounded-full shrink-0 mt-1 bg-[#ef9f27]"></div>
                <div>
                  <div className="text-[13px] text-[#1a1a18] leading-snug">Замовлення №102 очікує підтвердження</div>
                  <div className="text-[11px] text-[#999] mt-0.5">Зелений Лан · 20.03.2024</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}