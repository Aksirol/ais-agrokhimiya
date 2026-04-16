import { useState, useEffect } from 'react';
import axios from 'axios';

type TabType = 'chemicals' | 'warehouses' | 'suppliers';

export default function Dictionaries() {
  const [activeTab, setActiveTab] = useState<TabType>('chemicals');
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/dictionaries/${activeTab}`);
      setData(res.data);
    } catch (error) {
      console.error('Помилка завантаження довідника');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenModal = () => {
    setFormData({}); // Очищаємо форму
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`/api/dictionaries/${activeTab}`, formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Помилка збереження');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Видалити цей запис?')) return;
    try {
      await axios.delete(`/api/dictionaries/${activeTab}/${id}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Помилка видалення');
    }
  };

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[20px] font-medium text-[#1a1a18]">Довідники системи</div>
        <button onClick={handleOpenModal} className="h-[32px] px-4 bg-[#2d7a50] text-white rounded-[7px] text-[13px] font-medium hover:bg-opacity-90">
          + Додати запис
        </button>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 mb-4 border-b border-[#e0e0db] pb-2">
        <button onClick={() => setActiveTab('chemicals')} className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${activeTab === 'chemicals' ? 'bg-[#2d7a50] text-white' : 'text-[#666] hover:bg-white border border-transparent'}`}>Хімікати</button>
        <button onClick={() => setActiveTab('warehouses')} className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${activeTab === 'warehouses' ? 'bg-[#2d7a50] text-white' : 'text-[#666] hover:bg-white border border-transparent'}`}>Склади</button>
        <button onClick={() => setActiveTab('suppliers')} className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${activeTab === 'suppliers' ? 'bg-[#2d7a50] text-white' : 'text-[#666] hover:bg-white border border-transparent'}`}>Постачальники</button>
      </div>

      {/* Таблиця */}
      <div className="bg-white border border-[#e0e0db] rounded-[10px] overflow-hidden flex-1">
        <table className="w-full text-left">
          <thead className="bg-[#f8f8f6] border-b border-[#e0e0db]">
            <tr>
              <th className="py-2.5 px-4 text-[12px] font-medium text-[#666]">Назва</th>
              {activeTab === 'chemicals' && <th className="py-2.5 px-4 text-[12px] font-medium text-[#666]">Категорія</th>}
              {activeTab === 'chemicals' && <th className="py-2.5 px-4 text-[12px] font-medium text-[#666]">Одиниця виміру</th>}
              {activeTab === 'warehouses' && <th className="py-2.5 px-4 text-[12px] font-medium text-[#666]">Зона</th>}
              <th className="py-2.5 px-4 text-[12px] font-medium text-[#666] text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} className="border-b border-[#f4f4f2] hover:bg-[#fafaf8]">
                <td className="py-2.5 px-4 text-[13px] font-medium text-[#1a1a18]">{item.name}</td>
                {activeTab === 'chemicals' && <td className="py-2.5 px-4 text-[13px] text-[#555]">{item.category}</td>}
                {activeTab === 'chemicals' && <td className="py-2.5 px-4 text-[13px] text-[#555]">{item.base_unit}</td>}
                {activeTab === 'warehouses' && <td className="py-2.5 px-4 text-[13px] text-[#555]">{item.zone || '—'}</td>}
                <td className="py-2.5 px-4 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-[12px] text-[#c0392b] hover:underline">Видалити</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-[13px] text-gray-500">Записів не знайдено</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Модальне вікно додавання */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] w-[400px] shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0e0db] bg-[#f8f8f6] flex justify-between">
              <h3 className="font-medium text-[15px]">Новий запис</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] text-[#666] mb-1">Назва *</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" />
              </div>

              {activeTab === 'chemicals' && (
                <>
                  <div>
                    <label className="block text-[12px] text-[#666] mb-1">Категорія *</label>
                    <select required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]">
                      <option value="" disabled>Оберіть...</option>
                      <option value="Добриво">Добриво</option>
                      <option value="Гербіцид">Гербіцид</option>
                      <option value="Фунгіцид">Фунгіцид</option>
                      <option value="Інсектицид">Інсектицид</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#666] mb-1">Одиниця виміру *</label>
                    <select required value={formData.base_unit || ''} onChange={e => setFormData({...formData, base_unit: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]">
                      <option value="" disabled>Оберіть...</option>
                      <option value="кг">Кілограми (кг)</option>
                      <option value="л">Літри (л)</option>
                      <option value="т">Тонни (т)</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'warehouses' && (
                <div>
                  <label className="block text-[12px] text-[#666] mb-1">Зона / Опис (опціонально)</label>
                  <input type="text" value={formData.zone || ''} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" placeholder="Напр. Ангар 2" />
                </div>
              )}

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