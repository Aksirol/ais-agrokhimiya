import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin } from 'lucide-react';
import type { Field } from '../types';

export default function Fields() {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/fields')
      .then(response => setFields(response.data))
      .catch(error => console.error('Помилка завантаження полів:', error));
  }, []);

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center bg-white p-4 rounded border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Пошук полів..." 
            className="pl-10 pr-4 py-1.5 border rounded-md text-sm w-64 focus:outline-none focus:border-agro-light"
          />
        </div>
        <button className="bg-agro-dark text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-opacity-90">
          + Додати поле
        </button>
      </div>

      <div className="bg-white border rounded overflow-hidden flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Назва поля</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Площа (га)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Культура</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Локація</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Сезон</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{field.id}</td>
                <td className="px-4 py-3 font-bold text-agro-dark">{field.name}</td>
                <td className="px-4 py-3">{Number(field.area_ha)}</td>
                <td className="px-4 py-3">
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                    {field.crop_type}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" /> {field.location || '—'}
                </td>
                <td className="px-4 py-3">{field.season || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}