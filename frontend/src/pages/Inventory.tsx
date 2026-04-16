import { useState } from 'react';

export default function InventoryPage() {
  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2]">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Склад</div>
      
      {/* Фільтри */}
      <div className="flex gap-2.5 mb-3.5 items-center">
        <select className="h-[34px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white text-gray-800 focus:outline-none focus:border-[#2d7a50]">
          <option>Всі категорії</option>
          <option>Добрива</option>
          <option>Гербіциди</option>
          <option>Фунгіциди</option>
        </select>
        <select className="h-[34px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white text-gray-800 focus:outline-none focus:border-[#2d7a50]">
          <option>Всі зони</option>
          <option>Зона А</option>
          <option>Зона Б</option>
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
                <th className="w-[36%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Назва</th>
                <th className="w-[18%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Категорія</th>
                <th className="w-[16%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Залишок</th>
                <th className="w-[16%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Зона</th>
                <th className="w-[14%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#edf7f2] hover:bg-[#edf7f2] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Нітроамофоска</td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Добриво</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">
                  <div>45 кг</div>
                  <div className="h-[6px] bg-[#f0f0ee] rounded-[3px] overflow-hidden mt-1">
                    <div className="h-[6px] rounded-[3px] bg-[#e24b4a]" style={{ width: '15%' }}></div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Зона А</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-[#fce8e8] text-[#8a1a1a]">Критично</span>
                </td>
              </tr>
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Гербіцид «Ураган»</td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Гербіцид</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">
                  <div>8 л</div>
                  <div className="h-[6px] bg-[#f0f0ee] rounded-[3px] overflow-hidden mt-1">
                    <div className="h-[6px] rounded-[3px] bg-[#ef9f27]" style={{ width: '40%' }}></div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Зона Б</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-[#fde8c0] text-[#7a4a10]">Мало</span>
                </td>
              </tr>
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Карбамід</td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Добриво</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">
                  <div>320 кг</div>
                  <div className="h-[6px] bg-[#f0f0ee] rounded-[3px] overflow-hidden mt-1">
                    <div className="h-[6px] rounded-[3px] bg-[#2d7a50]" style={{ width: '72%' }}></div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Зона А</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-[#d1f0e0] text-[#1e5c36]">Норма</span>
                </td>
              </tr>
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Фунгіцид «Амістар»</td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Фунгіцид</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">
                  <div>24 л</div>
                  <div className="h-[6px] bg-[#f0f0ee] rounded-[3px] overflow-hidden mt-1">
                    <div className="h-[6px] rounded-[3px] bg-[#2d7a50]" style={{ width: '60%' }}></div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Зона Б</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-[#d1f0e0] text-[#1e5c36]">Норма</span>
                </td>
              </tr>
              <tr className="hover:bg-[#fafaf8] cursor-pointer transition-colors group">
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">Суперфосфат</td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Добриво</td>
                <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] group-last:border-none">
                  <div>90 кг</div>
                  <div className="h-[6px] bg-[#f0f0ee] rounded-[3px] overflow-hidden mt-1">
                    <div className="h-[6px] rounded-[3px] bg-[#ef9f27]" style={{ width: '30%' }}></div>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2] group-last:border-none">Зона А</td>
                <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2] group-last:border-none">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap bg-[#fde8c0] text-[#7a4a10]">Мало</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex gap-2 p-2.5 border-t border-[#e0e0db] mt-auto">
            <button className="h-[32px] px-3.5 bg-[#2d7a50] text-white border-none rounded-[7px] text-[13px] font-medium hover:bg-opacity-90 transition-colors">
              + Додати
            </button>
            <button className="h-[32px] px-3.5 bg-white text-[#1a1a18] border border-[#d0d0cc] rounded-[7px] text-[13px] hover:bg-gray-50 transition-colors">
              Редагувати
            </button>
          </div>
        </div>

        {/* Права колонка: Деталі */}
        <div className="w-[220px] bg-white border border-[#e0e0db] rounded-[10px] p-4 shrink-0 self-start">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3 pb-2 border-b border-[#f0f0ee]">
            Деталі позиції
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[12px] text-[#888]">Назва</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Нітроамофоска</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[12px] text-[#888]">Категорія</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Добриво</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[12px] text-[#888]">Залишок</span>
            <span className="text-[12px] font-medium text-[#c0392b] text-right">45 кг</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[12px] text-[#888]">Мін. поріг</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">100 кг</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[12px] text-[#888]">Зона</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Зона А</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-[12px] text-[#888]">Оновлено</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">12.03.2024</span>
          </div>
          
          <div className="text-[11px] text-[#888] font-medium mt-3 mb-1.5 uppercase tracking-wide">
            Останній рух
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[12px] text-[#2d7a50] font-bold">↓</span>
            <span className="text-[12px] text-[#555] flex-1 truncate">Надходження +500 кг</span>
            <span className="text-[11px] text-[#bbb]">12.03</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[12px] text-[#c0392b] font-bold">↑</span>
            <span className="text-[12px] text-[#555] flex-1 truncate">Витрата −455 кг</span>
            <span className="text-[11px] text-[#bbb]">18.03</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[12px] text-[#c0392b] font-bold">↑</span>
            <span className="text-[12px] text-[#555] flex-1 truncate">Витрата −0 кг</span>
            <span className="text-[11px] text-[#bbb]">22.03</span>
          </div>
        </div>

      </div>
    </div>
  );
}