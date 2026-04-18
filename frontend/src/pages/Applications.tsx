import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export default function Applications() {
  const [apps, setApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  
  // --- СТАНИ ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Всі');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

  // Модалки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [returnedQuantity, setReturnedQuantity] = useState('');
  
  const [inventoryOpts, setInventoryOpts] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [formData, setFormData] = useState({ inventory_id: '', field_id: '', applied_date: format(new Date(), 'yyyy-MM-dd'), quantity_used: '', norm_per_ha: '', purpose: '' });

  const currentUser = JSON.parse(localStorage.getItem('agro_user') || '{}');

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/applications');
      setApps(response.data);
      if (response.data.length > 0 && !selectedApp) setSelectedApp(response.data[0]);
    } catch (error) {}
  };

  const fetchFormData = async () => {
    try {
      const response = await axios.get('/api/applications/form-data');
      setInventoryOpts(response.data.inventory);
      setFields(response.data.fields);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
    fetchFormData();
  }, []);

  // --- ЛОГІКА СОРТУВАННЯ ТА ФІЛЬТРАЦІЇ ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedApps = [...apps]
    .filter(app => {
      const matchesSearch = app.chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            app.field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            app.user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'Всі' || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      const modifier = direction === 'asc' ? 1 : -1;

      switch (key) {
        case 'date': return (new Date(a.applied_date).getTime() - new Date(b.applied_date).getTime()) * modifier;
        case 'chemical': return a.chemical.name.localeCompare(b.chemical.name) * modifier;
        case 'field': return a.field.name.localeCompare(b.field.name) * modifier;
        case 'quantity': return (Number(a.quantity_used) - Number(b.quantity_used)) * modifier;
        case 'type': return a.chemical.category.localeCompare(b.chemical.category) * modifier;
        case 'status': return a.status.localeCompare(b.status) * modifier;
        case 'agronomist': return a.user.name.localeCompare(b.user.name) * modifier;
        default: return 0;
      }
    });

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown size={14} className="text-transparent group-hover:text-gray-300 transition-colors" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-[#2d7a50]" /> : <ChevronDown size={14} className="text-[#2d7a50]" />;
  };

  // ... (Існуючі функції збереження/видалення)
  const handleAddNew = () => { setFormData({ inventory_id: '', field_id: '', applied_date: format(new Date(), 'yyyy-MM-dd'), quantity_used: '', norm_per_ha: '', purpose: '' }); setIsModalOpen(true); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { await axios.post('/api/applications', formData); setIsModalOpen(false); fetchData(); fetchFormData(); } catch (err: any) { alert(err.response?.data?.error || 'Помилка'); } };
  const handleCompleteSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { await axios.put(`/api/applications/${selectedApp.id}/complete`, { returned_quantity: returnedQuantity || 0 }); setIsCompleteModalOpen(false); setReturnedQuantity(''); fetchData(); fetchFormData(); } catch (err: any) { alert(err.response?.data?.error || 'Помилка'); } };
  const handleDelete = async (id: number) => { if (!window.confirm('Видалити запис? Товар буде повернуто на склад!')) return; try { await axios.delete(`/api/applications/${id}`); setSelectedApp(null); fetchData(); fetchFormData(); } catch (err: any) { alert(err.response?.data?.error || 'Помилка'); } };

  const getCategoryBadge = (category: string) => {
    if (category === 'Добриво') return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#fde8c0] text-[#7a4a10]">{category}</span>;
    if (category === 'Гербіцид') return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#e8f5ee] text-[#1e5c36]">{category}</span>;
    if (category === 'Фунгіцид') return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#e8eefe] text-[#2a3a9e]">{category}</span>;
    return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#fce8f8] text-[#7a1a6a]">{category}</span>;
  };

  // НОВА ФУНКЦІЯ ДЛЯ СТАТУСІВ ENUM
  const getAppStatusBadge = (status: string) => {
    if (status === 'COMPLETED') return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">COMPLETED</span>;
    if (status === 'IN_PROGRESS') return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#e6f1fb] text-[#0c447c]">В процесі</span>;
    return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-200 text-gray-700">{status}</span>;
  };

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2] relative">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Журнал використання</div>

      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" placeholder="Пошук (Хімікат, Поле, Агроном)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 h-[34px] w-[280px] border border-[#d0d0cc] rounded-[8px] text-[13px] bg-white focus:outline-none focus:border-[#2d7a50]"
          />
        </div>
        <select 
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="h-[34px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white focus:outline-none focus:border-[#2d7a50]"
        >
          <option value="Всі">Всі статуси</option>
          <option value="IN_PROGRESS">В процесі (Активні)</option>
          <option value="COMPLETED">Завершено</option>
        </select>
      </div>

      <div className="flex gap-3.5">
        <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] overflow-hidden flex flex-col">
          <table className="w-full border-collapse table-fixed text-left select-none">
            <thead className="bg-[#f8f8f6]">
              <tr>
                <th onClick={() => handleSort('date')} className="w-[12%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Дата <SortIcon columnKey="date" /></div>
                </th>
                <th onClick={() => handleSort('chemical')} className="w-[20%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Хімікат <SortIcon columnKey="chemical" /></div>
                </th>
                <th onClick={() => handleSort('field')} className="w-[18%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Поле <SortIcon columnKey="field" /></div>
                </th>
                <th onClick={() => handleSort('quantity')} className="w-[12%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Витрата <SortIcon columnKey="quantity" /></div>
                </th>
                <th onClick={() => handleSort('type')} className="w-[12%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Тип <SortIcon columnKey="type" /></div>
                </th>
                <th onClick={() => handleSort('status')} className="w-[14%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Статус <SortIcon columnKey="status" /></div>
                </th>
                <th onClick={() => handleSort('agronomist')} className="w-[12%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Автор <SortIcon columnKey="agronomist" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {processedApps.map(app => (
                <tr key={app.id} onClick={() => setSelectedApp(app)} className={`cursor-pointer transition-colors group ${selectedApp?.id === app.id ? 'bg-[#edf7f2]' : 'hover:bg-[#fafaf8]'}`}>
                  <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2]">{format(new Date(app.applied_date), 'dd.MM.yyyy')}</td>
                  <td className="py-2.5 px-3 text-[13px] font-medium text-[#1a1a18] border-b border-[#f4f4f2] truncate">{app.chemical.name}</td>
                  <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2] truncate">{app.field.name}</td>
                  <td className="py-2.5 px-3 text-[13px] font-bold text-[#c0392b] border-b border-[#f4f4f2]">-{Number(app.quantity_used)} {app.base_unit}</td>
                  <td className="py-2.5 px-3 border-b border-[#f4f4f2]">{getCategoryBadge(app.chemical.category)}</td>
                  {/* Використовуємо нову функцію */}
                  <td className="py-2.5 px-3 border-b border-[#f4f4f2]">{getAppStatusBadge(app.status)}</td>
                  <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2]">{app.user.name}</td>
                </tr>
              ))}
              {processedApps.length === 0 && <tr><td colSpan={7} className="text-center py-6 text-gray-500">Записів не знайдено</td></tr>}
            </tbody>
          </table>
          
          <div className="flex gap-2 p-2.5 border-t border-[#e0e0db] mt-auto">
            <button onClick={handleAddNew} className="h-[32px] px-3.5 bg-[#2d7a50] text-white rounded-[7px] text-[13px] font-medium hover:bg-opacity-90">+ Взяти зі складу</button>
          </div>
        </div>

        {/* ПРАВА КОЛОНКА */}
        <div className="w-[240px] bg-white border border-[#e0e0db] rounded-[10px] p-4 shrink-0 self-start">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#f0f0ee]">
            <span className="text-[13px] font-medium text-[#1a1a18]">Деталі обробки</span>
            {/* Оновлена перевірка статусу */}
            {selectedApp?.status === 'COMPLETED' && <span className="text-[16px]">✅</span>}
          </div>
          {selectedApp ? (
            <>
              {/* Оновлене відображення статусу в деталях */}
              <div className="flex justify-between gap-2 mb-2"><span className="text-[12px] text-[#888]">Статус</span><span className="text-[12px] font-medium text-[#1a1a18]">{selectedApp.status === 'COMPLETED' ? 'Завершено' : 'В процесі'}</span></div>
              <div className="flex justify-between gap-2 mb-2"><span className="text-[12px] text-[#888]">Хімікат</span><span className="text-[12px] font-medium text-[#1a1a18] truncate w-28 text-right">{selectedApp.chemical.name}</span></div>
              <div className="flex justify-between gap-2 mb-2"><span className="text-[12px] text-[#888]">Поле</span><span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedApp.field.name}</span></div>
              {/* Оновлена перевірка статусу */}
              <div className="flex justify-between gap-2 mb-2"><span className="text-[12px] text-[#888]">{selectedApp.status === 'COMPLETED' ? 'Фактична витрата' : 'Взято зі складу'}</span><span className="text-[12px] font-bold text-[#c0392b]">{Number(selectedApp.quantity_used)} {selectedApp.base_unit}</span></div>
              <div className="flex justify-between gap-2 mb-2"><span className="text-[12px] text-[#888]">Агроном</span><span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedApp.user.name}</span></div>

              {(currentUser.role === 'admin' || currentUser.id === selectedApp.user_id) && (
                <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-[#f0f0ee]">
                  {/* Оновлена перевірка статусу */}
                  {selectedApp.status === 'IN_PROGRESS' && <button onClick={() => setIsCompleteModalOpen(true)} className="w-full h-[30px] bg-[#e6f1fb] text-[#0c447c] rounded-[7px] text-[12px] font-medium hover:bg-blue-100">Завершити роботи</button>}
                  <button onClick={() => handleDelete(selectedApp.id)} className="w-full h-[30px] bg-white border border-[#d0d0cc] text-[#c0392b] rounded-[7px] text-[12px] font-medium hover:bg-red-50">Скасувати запис</button>
                </div>
              )}
            </>
          ) : <div className="text-[12px] text-gray-500 text-center py-6">Оберіть запис</div>}
        </div>
      </div>

      {/* МОДАЛКИ (Залишаються без змін) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] w-[450px] shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0e0db] bg-[#f8f8f6] flex justify-between"><h3 className="font-medium text-[15px]">Нове використання</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">&times;</button></div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] text-[#666] mb-1">Що списуємо зі складу? *</label>
                <select required value={formData.inventory_id} onChange={e => setFormData({...formData, inventory_id: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]">
                  <option value="" disabled>Оберіть партію на складі...</option>
                  {inventoryOpts.map(inv => <option key={inv.id} value={inv.id}>{inv.chemical.name} — Доступно: {Number(inv.quantity)} {inv.chemical.base_unit}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-[#666] mb-1">На яке поле? *</label>
                <select required value={formData.field_id} onChange={e => setFormData({...formData, field_id: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]">
                  <option value="" disabled>Оберіть поле...</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name} ({f.crop_type})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[11px] text-[#666] mb-1">Беремо зі складу *</label><input required type="number" step="0.1" value={formData.quantity_used} onChange={e => setFormData({...formData, quantity_used: e.target.value})} className="w-full px-3 py-1.5 border rounded-md text-[13px]" /></div>
                <div><label className="block text-[11px] text-[#666] mb-1">Норма на 1 га *</label><input required type="number" step="0.1" value={formData.norm_per_ha} onChange={e => setFormData({...formData, norm_per_ha: e.target.value})} className="w-full px-3 py-1.5 border rounded-md text-[13px]" /></div>
              </div>
              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[#e0e0db]"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-[13px] hover:bg-gray-50">Скасувати</button><button type="submit" className="px-4 py-2 bg-[#2d7a50] text-white rounded-md text-[13px] hover:bg-opacity-90">Взяти в роботу</button></div>
            </form>
          </div>
        </div>
      )}

      {isCompleteModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] w-[400px] shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0e0db] bg-[#f8f8f6] flex justify-between"><h3 className="font-medium text-[15px]">Завершення обробки</h3><button onClick={() => setIsCompleteModalOpen(false)} className="text-gray-400 hover:text-gray-700">&times;</button></div>
            <form onSubmit={handleCompleteSubmit} className="p-5 flex flex-col gap-4">
              <div className="bg-[#e6f1fb] text-[#0c447c] p-3 rounded-md text-[12px]">Було взято зі складу: <br/><span className="text-[15px] font-bold">{Number(selectedApp.quantity_used)} {selectedApp.base_unit}</span></div>
              <div><label className="block text-[12px] text-[#666] mb-1">Скільки товару повернути на склад?</label><input type="number" step="0.1" min="0" max={Number(selectedApp.quantity_used)} required value={returnedQuantity} onChange={e => setReturnedQuantity(e.target.value)} className="w-full px-3 py-2 border rounded-md text-[13px]" placeholder="Введіть 0, якщо витратили все" /></div>
              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[#e0e0db]"><button type="button" onClick={() => setIsCompleteModalOpen(false)} className="px-4 py-2 border rounded-md text-[13px] hover:bg-gray-50">Скасувати</button><button type="submit" className="px-4 py-2 bg-[#2d7a50] text-white rounded-md text-[13px] hover:bg-opacity-90">Завершити</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}