import { useState } from 'react';

export default function Applications() {
  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2]">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Використання</div>
      
      {/* Фільтри */}
      <div className="flex flex-wrap gap-2.5 mb-3.5 items-center">
        <input 
          type="date" 
          defaultValue="2024-01-01" 
          className="h-[34px] w-[130px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white text-gray-800 focus:outline-none focus:border-[#2d7a50]"
        />
        <input 
          type="date" 
          defaultValue="2024-03-31" 
          className="h-[34px] w-[130px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white text-gray-800 focus:outline-none focus:border-[#2d7a50]"
        />
        <select className="h-[34px] w-[130px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white text-gray-800 focus:outline-none focus:border-[#2d7a50]">
          <option>Всі поля</option>
          <option>Поле №1</option>
          <option>Поле №2</option>
        </select>
        <select className="h-[34px] w-[130px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white text-gray-800 focus:outline-none focus:border-[#2d7a50]">
          <option>Всі хімікати</option>
          <option>Нітроамофоска</option>
        </select>
        <button className="h-[34px] px-4 bg-[#2d7a50] text-white border-none rounded-[8px] text-[13px] font-medium hover:bg-opacity-90 transition-colors">
          Фільтр
        </button>
      </div>

      <div className="flex gap-3.5">
        
        {/* Таблиця */}
        <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] overflow-hidden flex flex-col">
          <table className="w-full border-collapse table-fixed text-left">
            <thead className="bg-[#f8f8f6]">
              <tr>
                <th className="w-[12%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Дата</th>
                <th className="w-[26%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Хімікат</th>
                <th className="w-[22%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Поле</th>
                <th className="w-[14%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Витрата</th>
                <th className="w-[14%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Тип</th>
                <th className="w-[12%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Виконавець</th>
              </tr>
            </thead>
            <tbody>
              {/* Рядок 1 (Виділений) */}
              <tr className="bg-[#edf7f2] hover:bg-[#edf7f2] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">05.03.2024</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Нітроамофоска</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Поле №1 (Пшениця)</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">120 кг</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#fde8c0] text-[#7a4a10]">Добриво</span>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Петренко</td>
              </tr>
              
              {/* Рядок 2 */}
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">10.03.2024</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Гербіцид «Ураган»</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Поле №3 (Соняшник)</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">5 л</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#e8f5ee] text-[#1e5c36]">Гербіцид</span>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Коваль</td>
              </tr>

              {/* Рядок 3 */}
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">14.03.2024</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Фунгіцид «Амістар»</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Поле №2 (Кукурудза)</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">8 л</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#e8eefe] text-[#2a3a9e]">Фунгіцид</span>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Петренко</td>
              </tr>

              {/* Рядок 4 */}
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">20.03.2024</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Карбамід</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Поле №1 (Пшениця)</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">80 кг</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#fde8c0] text-[#7a4a10]">Добриво</span>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Іванов</td>
              </tr>

              {/* Рядок 5 */}
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">25.03.2024</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Гербіцид «Ураган»</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Поле №4 (Ріпак)</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">3 л</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#e8f5ee] text-[#1e5c36]">Гербіцид</span>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Коваль</td>
              </tr>
            </tbody>
          </table>
          <div className="flex gap-2 p-2.5 border-t border-[#e0e0db] mt-auto">
            <button className="h-[32px] px-3.5 bg-[#2d7a50] text-white border-none rounded-[7px] text-[13px] font-medium hover:bg-opacity-90 transition-colors">
              + Додати запис
            </button>
            <button className="h-[32px] px-3.5 bg-white text-[#1a1a18] border border-[#d0d0cc] rounded-[7px] text-[13px] hover:bg-gray-50 transition-colors">
              Редагувати
            </button>
          </div>
        </div>

        {/* Права колонка: Деталі обробки */}
        <div className="w-[220px] bg-white border border-[#e0e0db] rounded-[10px] p-4 shrink-0 self-start">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3 pb-2 border-b border-[#f0f0ee]">
            Деталі обробки
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Дата</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">05.03.2024</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Хімікат</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Нітроамофоска</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Поле</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Поле №1</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Культура</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Пшениця</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Витрата</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">120 кг</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Норма/га</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">12 кг/га</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Виконавець</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Петренко О.</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Мета</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Підживлення</span>
          </div>
          
          <div className="text-[11px] text-[#888] font-medium mt-3 mb-1.5 uppercase tracking-wide">
            Відповідність нормі
          </div>
          <div className="my-2">
            <div className="flex justify-between text-[11px] text-[#888]">
              <span>Фактично</span>
              <span>120 / 130 кг</span>
            </div>
            <div className="h-2 bg-[#f0f0ee] rounded-full overflow-hidden mt-1">
              <div className="h-2 rounded-full bg-[#2d7a50]" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div className="text-[11px] text-[#2d7a50] mt-1">
            92% норми — в межах допуску
          </div>
        </div>

      </div>
    </div>
  );
}