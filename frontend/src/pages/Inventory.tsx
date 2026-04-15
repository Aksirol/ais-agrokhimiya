import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import type { Inventory } from '../types';

export default function InventoryPage() {
  const [items, setItems] = useState<Inventory[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/inventory')
      .then(response => setItems(response.data))
      .catch(error => console.error('Помилка завантаження складу:', error));
  }, []);

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center bg-white p-4 rounded border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Пошук по складу..." 
            className="pl-10 pr-4 py-1.5 border rounded-md text-sm w-64 focus:outline-none focus:border-agro-light"
          />
        </div>
        <button className="bg-agro-dark text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-opacity-90">
          + Додати надходження
        </button>
      </div>

      <div className="bg-white border rounded overflow-hidden flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Хімікат</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Склад (Зона)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Поточний залишок</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Останнє оновлення</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Статус</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const qty = Number(item.quantity);
              const threshold = Number(item.min_threshold);
              const isLow = qty <= threshold;

              return (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-agro-dark">{item.chemical.name}</td>
                  <td className="px-4 py-3">{item.warehouse.name} {item.warehouse.zone ? `(${item.warehouse.zone})` : ''}</td>
                  <td className="px-4 py-3 font-bold">{qty} кг</td>
                  <td className="px-4 py-3">{format(new Date(item.last_updated), 'dd.MM.yyyy HH:mm')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${isLow ? 'bg-red-500' : 'bg-green-500'}`}>
                      {isLow ? 'Низький запас' : 'В нормі'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}