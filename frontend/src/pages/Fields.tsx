import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Field } from '../types';

export default function Fields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  
  // Стан для модального вікна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: '', area_ha: '', crop_type: '', location: '', season: '' });

  // 1. READ: Завантаження даних
  const fetchFields = async () => {
    try {
      const response = await axios.get('/api/fields');
      setFields(response.data);
      if (response.data.length > 0 && !selectedField) {
        setSelectedField(response.data[0]);
      }
    } catch (error) {
      console.error('Помилка завантаження:', error);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // Відкриття модалки для СТВОРЕННЯ
  const handleAddNew = () => {
    setFormData({ id: 0, name: '', area_ha: '', crop_type: '', location: '', season: '' });
    setIsModalOpen(true);
  };

  // Відкриття модалки для РЕДАГУВАННЯ
  const handleEdit = (field: Field) => {
    setFormData({ 
      id: field.id, 
      name: field.name, 
      area_ha: String(field.area_ha), 
      crop_type: field.crop_type, 
      location: field.location || '', 
      season: field.season || '' 
    });
    setIsModalOpen(true);
  };

  // 2 & 3. CREATE & UPDATE: Збереження форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id === 0) {
        // Створення (POST)
        await axios.post('/api/fields', formData);
      } else {
        // Оновлення (PUT)
        await axios.put(`/api/fields/${formData.id}`, formData);
      }
      setIsModalOpen(false);
      fetchFields(); // Оновлюємо список
    } catch (error) {
      alert('Помилка збереження поля');
    }
  };

  // 4. DELETE: Видалення
  const handleDelete = async (id: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити це поле?')) return;
    try {
      await axios.delete(`/api/fields/${id}`);
      setSelectedField(null);
      fetchFields();
    } catch (error) {
      alert('Помилка видалення поля');
    }
  };

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2] relative">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[20px] font-medium text-[#1a1a18]">Поля</div>
        <button 
          onClick={handleAddNew}
          className="h-[32px] px-4 bg-[#2d7a50] text-white border-none rounded-[7px] text-[13px] font-medium hover:bg-opacity-90 transition-colors"
        >
          + Додати поле
        </button>
      </div>
      
      <div className="flex gap-3.5">
        
        {/* Ліва колонка: Сітка полів (Динамічна) */}
        <div className="flex-1 grid grid-cols-2 gap-3 content-start">
          {fields.map((field) => (
            <div 
              key={field.id}
              onClick={() => setSelectedField(field)}
              className={`border-[1.5px] rounded-[10px] p-3.5 cursor-pointer transition-colors ${
                selectedField?.id === field.id 
                  ? 'bg-[#f4fdf8] border-[#2d7a50]' 
                  : 'bg-white border-[#e0e0db] hover:border-[#2d7a50]'
              }`}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <div className="text-[14px] font-medium text-[#1a1a18]">{field.name}</div>
                  <div className="text-[12px] text-[#666] mt-0.5">{field.crop_type}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Активне</span>
              </div>
              
              {/* Статичний малюнок для краси */}
              <div className="bg-[#e8f2e8] rounded-[8px] h-[60px] my-2 flex items-center justify-center overflow-hidden">
                <svg width="100%" height="60" viewBox="0 0 180 60">
                  <polygon points="20,10 160,8 170,50 10,52" fill="#b8ddb8" stroke="#2d7a50" strokeWidth="1.5"/>
                  <text x="90" y="34" textAnchor="middle" fontSize="11" fill="#27500a">{Number(field.area_ha)} га</text>
                </svg>
              </div>
              
              <div className="flex gap-3 mt-2 pt-2 border-t border-[#f0f0ee]">
                <div className="flex-1">
                  <div className="text-[10px] text-[#aaa]">Площа</div>
                  <div className="text-[13px] font-medium text-[#1a1a18]">{Number(field.area_ha)} га</div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-[#aaa]">Локація</div>
                  <div className="text-[13px] font-medium text-[#1a1a18] truncate">{field.location || '—'}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-[#aaa]">Сезон</div>
                  <div className="text-[13px] font-medium text-[#1a1a18]">{field.season || '—'}</div>
                </div>
              </div>
            </div>
          ))}
          
          {fields.length === 0 && (
             <div className="col-span-2 text-center text-gray-500 py-10 bg-white rounded-lg border border-dashed">
                Немає жодного поля. Натисніть "+ Додати поле".
             </div>
          )}
        </div>

        {/* Права колонка: Деталі вибраного поля */}
        <div className="w-[220px] bg-white border border-[#e0e0db] rounded-[10px] p-4 shrink-0 self-start flex flex-col">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3 pb-2 border-b border-[#f0f0ee]">
            Деталі поля
          </div>
          
          {selectedField ? (
            <>
              <div className="flex justify-between gap-2 mb-2">
                <span className="text-[12px] text-[#888] shrink-0">Назва</span>
                <span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedField.name}</span>
              </div>
              <div className="flex justify-between gap-2 mb-2">
                <span className="text-[12px] text-[#888] shrink-0">Культура</span>
                <span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedField.crop_type}</span>
              </div>
              <div className="flex justify-between gap-2 mb-2">
                <span className="text-[12px] text-[#888] shrink-0">Площа</span>
                <span className="text-[12px] font-medium text-[#1a1a18] text-right">{Number(selectedField.area_ha)} га</span>
              </div>
              <div className="flex justify-between gap-2 mb-2">
                <span className="text-[12px] text-[#888] shrink-0">Розташування</span>
                <span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedField.location || '—'}</span>
              </div>
              <div className="flex justify-between gap-2 mb-2">
                <span className="text-[12px] text-[#888] shrink-0">Сезон</span>
                <span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedField.season || '—'}</span>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button 
                  onClick={() => handleEdit(selectedField)}
                  className="w-full h-[30px] border border-[#d0d0cc] bg-white text-[#1a1a18] rounded-[7px] text-[12px] font-medium hover:bg-gray-50"
                >
                  Редагувати
                </button>
                <button 
                  onClick={() => handleDelete(selectedField.id)}
                  className="w-full h-[30px] bg-[#fce8e8] text-[#c0392b] border-none rounded-[7px] text-[12px] font-medium hover:bg-red-200"
                >
                  Видалити
                </button>
              </div>
            </>
          ) : (
             <div className="text-[12px] text-gray-500 text-center py-4">Оберіть поле для перегляду</div>
          )}
        </div>
      </div>

      {/* Модальне вікно (Створення / Редагування) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] w-[400px] shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0e0db] flex justify-between items-center bg-[#f8f8f6]">
              <h3 className="font-medium text-[15px]">{formData.id ? 'Редагувати поле' : 'Нове поле'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] text-[#666] mb-1">Назва поля *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" placeholder="Напр. Поле Північне" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[#666] mb-1">Площа (га) *</label>
                  <input required type="number" step="0.1" value={formData.area_ha} onChange={e => setFormData({...formData, area_ha: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" />
                </div>
                <div>
                  <label className="block text-[12px] text-[#666] mb-1">Сезон</label>
                  <input type="text" value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" placeholder="2024" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#666] mb-1">Культура *</label>
                <input required type="text" value={formData.crop_type} onChange={e => setFormData({...formData, crop_type: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" placeholder="Напр. Пшениця озима" />
              </div>

              <div>
                <label className="block text-[12px] text-[#666] mb-1">Локація (опціонально)</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" placeholder="Ділянка А-4" />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[#e0e0db]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-[13px] hover:bg-gray-50">Скасувати</button>
                <button type="submit" className="px-4 py-2 bg-[#2d7a50] text-white rounded-md text-[13px] hover:bg-opacity-90">Зберегти</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}