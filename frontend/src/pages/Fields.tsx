import { useState } from 'react';

export default function Fields() {
  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2]">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Поля</div>
      
      <div className="flex gap-3.5">
        
        {/* Ліва колонка: Сітка полів */}
        <div className="flex-1 grid grid-cols-2 gap-3 content-start">
          
          {/* Картка 1 (Виділена) */}
          <div className="bg-[#f4fdf8] border-[1.5px] border-[#2d7a50] rounded-[10px] p-3.5 cursor-pointer transition-colors">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <div className="text-[14px] font-medium text-[#1a1a18]">Поле №1</div>
                <div className="text-[12px] text-[#666] mt-0.5">Пшениця озима</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Оброблено</span>
            </div>
            <div className="bg-[#e8f2e8] rounded-[8px] h-[60px] my-2 flex items-center justify-center overflow-hidden">
              <svg width="100%" height="60" viewBox="0 0 180 60">
                <polygon points="20,10 160,8 170,50 10,52" fill="#b8ddb8" stroke="#2d7a50" strokeWidth="1.5"/>
                <text x="90" y="34" textAnchor="middle" fontSize="11" fill="#27500a">10 га</text>
              </svg>
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-[#f0f0ee]">
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Площа</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">10 га</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Обробок</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">4</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Витрат</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">8 200 грн</div>
              </div>
            </div>
          </div>

          {/* Картка 2 */}
          <div className="bg-white border-[0.5px] border-[#e0e0db] rounded-[10px] p-3.5 cursor-pointer hover:border-[#2d7a50] transition-colors">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <div className="text-[14px] font-medium text-[#1a1a18]">Поле №2</div>
                <div className="text-[12px] text-[#666] mt-0.5">Кукурудза</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Оброблено</span>
            </div>
            <div className="bg-[#e8f2e8] rounded-[8px] h-[60px] my-2 flex items-center justify-center overflow-hidden">
              <svg width="100%" height="60" viewBox="0 0 180 60">
                <polygon points="15,15 155,10 165,48 12,50" fill="#c5e8c5" stroke="#2d7a50" strokeWidth="1.5"/>
                <text x="90" y="34" textAnchor="middle" fontSize="11" fill="#27500a">15 га</text>
              </svg>
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-[#f0f0ee]">
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Площа</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">15 га</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Обробок</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">2</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Витрат</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">5 600 грн</div>
              </div>
            </div>
          </div>

          {/* Картка 3 */}
          <div className="bg-white border-[0.5px] border-[#e0e0db] rounded-[10px] p-3.5 cursor-pointer hover:border-[#2d7a50] transition-colors">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <div className="text-[14px] font-medium text-[#1a1a18]">Поле №3</div>
                <div className="text-[12px] text-[#666] mt-0.5">Соняшник</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Оброблено</span>
            </div>
            <div className="bg-[#e8f2e8] rounded-[8px] h-[60px] my-2 flex items-center justify-center overflow-hidden">
              <svg width="100%" height="60" viewBox="0 0 180 60">
                <polygon points="25,8 158,12 162,52 18,50" fill="#d4ebd4" stroke="#2d7a50" strokeWidth="1.5"/>
                <text x="90" y="34" textAnchor="middle" fontSize="11" fill="#27500a">8 га</text>
              </svg>
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-[#f0f0ee]">
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Площа</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">8 га</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Обробок</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">3</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Витрат</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">4 100 грн</div>
              </div>
            </div>
          </div>

          {/* Картка 4 */}
          <div className="bg-white border-[0.5px] border-[#e0e0db] rounded-[10px] p-3.5 cursor-pointer hover:border-[#2d7a50] transition-colors">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <div className="text-[14px] font-medium text-[#1a1a18]">Поле №4</div>
                <div className="text-[12px] text-[#666] mt-0.5">Ріпак</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#fde8c0] text-[#7a4a10]">Не оброблено</span>
            </div>
            <div className="bg-[#e8f2e8] rounded-[8px] h-[60px] my-2 flex items-center justify-center overflow-hidden">
              <svg width="100%" height="60" viewBox="0 0 180 60">
                <polygon points="20,12 162,10 158,50 22,52" fill="#e8f0e8" stroke="#aaa" strokeWidth="1" strokeDasharray="4 2"/>
                <text x="90" y="34" textAnchor="middle" fontSize="11" fill="#888">12 га</text>
              </svg>
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-[#f0f0ee]">
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Площа</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">12 га</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Обробок</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">0</div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#aaa]">Витрат</div>
                <div className="text-[13px] font-medium text-[#1a1a18]">—</div>
              </div>
            </div>
          </div>

        </div>

        {/* Права колонка: Деталі поля */}
        <div className="w-[220px] bg-white border border-[#e0e0db] rounded-[10px] p-4 shrink-0 self-start flex flex-col">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3 pb-2 border-b border-[#f0f0ee]">
            Деталі поля
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Назва</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Поле №1</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Культура</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Пшениця озима</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Площа</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">10 га</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Розташування</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">Ділянка А-4</span>
          </div>
          <div className="flex justify-between gap-2 mb-2">
            <span className="text-[12px] text-[#888] shrink-0">Сезон</span>
            <span className="text-[12px] font-medium text-[#1a1a18] text-right">2023–2024</span>
          </div>

          <div className="text-[11px] text-[#888] font-medium mt-3 mb-1.5 uppercase tracking-wide">
            Історія обробок
          </div>
          
          <div className="flex items-start gap-1.5 mb-2">
            <div className="w-[6px] h-[6px] rounded-full bg-[#2d7a50] mt-1 shrink-0"></div>
            <div>
              <div className="text-[12px] text-[#444] leading-snug">Нітроамофоска 120 кг</div>
              <div className="text-[11px] text-[#bbb]">05.03.2024 · Петренко</div>
            </div>
          </div>
          
          <div className="flex items-start gap-1.5 mb-2">
            <div className="w-[6px] h-[6px] rounded-full bg-[#2d7a50] mt-1 shrink-0"></div>
            <div>
              <div className="text-[12px] text-[#444] leading-snug">Карбамід 80 кг</div>
              <div className="text-[11px] text-[#bbb]">20.03.2024 · Іванов</div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 mb-2">
            <div className="w-[6px] h-[6px] rounded-full bg-[#3b9e6a] mt-1 shrink-0"></div>
            <div>
              <div className="text-[12px] text-[#444] leading-snug">Гербіцид «Ураган» 2 л</div>
              <div className="text-[11px] text-[#bbb]">28.02.2024 · Коваль</div>
            </div>
          </div>

          <button className="mt-3 w-full h-[32px] bg-[#2d7a50] text-white border-none rounded-[7px] text-[13px] font-medium hover:bg-opacity-90 transition-colors">
            + Додати поле
          </button>
        </div>

      </div>
    </div>
  );
}