import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import type { Application } from '../types';

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/applications')
      .then(response => setApps(response.data))
      .catch(error => console.error('Помилка завантаження журналу:', error));
  }, []);

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center bg-white p-4 rounded border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Пошук по журналу..." 
            className="pl-10 pr-4 py-1.5 border rounded-md text-sm w-64 focus:outline-none focus:border-agro-light"
          />
        </div>
        <button className="bg-agro-dark text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-opacity-90">
          + Списати на поле
        </button>
      </div>

      <div className="bg-white border rounded overflow-hidden flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Дата</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Хімікат</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Поле</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Витрачено</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Норма (на га)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Агроном</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">{format(new Date(app.applied_date), 'dd.MM.yyyy')}</td>
                <td className="px-4 py-3 font-medium text-agro-dark">{app.chemical.name}</td>
                <td className="px-4 py-3">{app.field.name}</td>
                <td className="px-4 py-3 font-bold text-red-600">
                  - {Number(app.quantity_used)} {app.base_unit}
                </td>
                <td className="px-4 py-3">{Number(app.norm_per_ha)} {app.base_unit}</td>
                <td className="px-4 py-3 text-gray-500">{app.user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}