import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

interface ChemicalData { id: number; name: string; base_unit: string; category: string; }
interface WarehouseData { id: number; name: string; zone: string; }

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // --- СТАНИ ФІЛЬТРАЦІЇ ТА СОРТУВАННЯ ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Всі');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'chemical', direction: 'asc' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chemicals, setChemicals] = useState<ChemicalData[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [formData, setFormData] = useState({ id: 0, chemical_id: '', warehouse_id: '', quantity: '', min_threshold: '' });

  const currentUser = JSON.parse(localStorage.getItem('agro_user') || '{}');
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'operator';
  const canDelete = currentUser.role === 'admin';

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/inventory');
      setItems(response.data);
      if (response.data.length > 0 && !selectedItem) setSelectedItem(response.data[0]);
    } catch (error) { console.error('Помилка завантаження складу:', error); }
  };

  const fetchFormData = async () => {
    try {
      const response = await axios.get('/api/inventory/form-data');
      setChemicals(response.data.chemicals);
      setWarehouses(response.data.warehouses);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
    if (canEdit) fetchFormData();
  }, [canEdit]);

  const getStatus = (qty: number, min: number) => {
    if (qty <= min) return { label: 'Критично', colorClass: 'bg-[#fce8e8] text-[#8a1a1a]', barColor: 'bg-[#e24b4a]', level: 1 };
    if (qty <= min * 1.5) return { label: 'Мало', colorClass: 'bg-[#fde8c0] text-[#7a4a10]', barColor: 'bg-[#ef9f27]', level: 2 };
    return { label: 'Норма', colorClass: 'bg-[#d1f0e0] text-[#1e5c36]', barColor: 'bg-[#2d7a50]', level: 3 };
  };

  // --- ЛОГІКА СОРТУВАННЯ ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // --- ОБРОБКА ДАНИХ ---
  const uniqueCategories = Array.from(new Set(items.map(i => i.chemical.category)));
  
  const processedItems = [...items]
    .filter(item => {
      const matchesSearch = item.chemical.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.warehouse.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'Всі' || item.chemical.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      const modifier = direction === 'asc' ? 1 : -1;

      switch (key) {
        case 'chemical': return a.chemical.name.localeCompare(b.chemical.name) * modifier;
        case 'category': return a.chemical.category.localeCompare(b.chemical.category) * modifier;
        case 'quantity': return (Number(a.quantity) - Number(b.quantity)) * modifier;
        case 'warehouse': return a.warehouse.name.localeCompare(b.warehouse.name) * modifier;
        case 'status': 
          const statA = getStatus(Number(a.quantity), Number(a.min_threshold)).level;
          const statB = getStatus(Number(b.quantity), Number(b.min_threshold)).level;
          return (statA - statB) * modifier;
        default: return 0;
      }
    });

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronDown size={14} className="text-transparent group-hover:text-gray-300 transition-colors" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-[#2d7a50]" /> : <ChevronDown size={14} className="text-[#2d7a50]" />;
  };

  // ... (Зберігаємо існуючі функції handleAddNew, handleEdit, handleSubmit, handleDelete)
  const handleAddNew = () => { setFormData({ id: 0, chemical_id: '', warehouse_id: '', quantity: '', min_threshold: '' }); setIsModalOpen(true); };
  const handleEdit = (item: any) => { setFormData({ id: item.id, chemical_id: String(item.chemical_id), warehouse_id: String(item.warehouse_id), quantity: String(item.quantity), min_threshold: String(item.min_threshold) }); setIsModalOpen(true); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { if (formData.id === 0) await axios.post('/api/inventory', formData); else await axios.put(`/api/inventory/${formData.id}`, formData); setIsModalOpen(false); fetchData(); } catch (err: any) { alert(err.response?.data?.error || 'Помилка'); } };
  const handleDelete = async (id: number) => { if (!window.confirm('Видалити?')) return; try { await axios.delete(`/api/inventory/${id}`); setSelectedItem(null); fetchData(); } catch (err) {} };

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2] relative">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Склад</div>
      
      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      <div className="flex gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" placeholder="Пошук (Хімікат, Склад)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 h-[34px] w-[250px] border border-[#d0d0cc] rounded-[8px] text-[13px] bg-white focus:outline-none focus:border-[#2d7a50]"
          />
        </div>
        <select 
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="h-[34px] border border-[#d0d0cc] rounded-[8px] px-2.5 text-[13px] bg-white focus:outline-none focus:border-[#2d7a50]"
        >
          <option value="Всі">Всі категорії</option>
          {uniqueCategories.map(cat => <option key={cat as string} value={cat as string}>{cat as string}</option>)}
        </select>
      </div>

      <div className="flex gap-3.5">
        <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] overflow-hidden flex flex-col">
          <table className="w-full border-collapse table-fixed text-left select-none">
            <thead className="bg-[#f8f8f6]">
              <tr>
                <th onClick={() => handleSort('chemical')} className="w-[36%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Назва <SortIcon columnKey="chemical" /></div>
                </th>
                <th onClick={() => handleSort('category')} className="w-[18%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Категорія <SortIcon columnKey="category" /></div>
                </th>
                <th onClick={() => handleSort('quantity')} className="w-[16%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Залишок <SortIcon columnKey="quantity" /></div>
                </th>
                <th onClick={() => handleSort('warehouse')} className="w-[16%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Зона/Склад <SortIcon columnKey="warehouse" /></div>
                </th>
                <th onClick={() => handleSort('status')} className="w-[14%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db] cursor-pointer hover:bg-gray-100 group">
                  <div className="flex items-center gap-1">Статус <SortIcon columnKey="status" /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map(item => {
                const qty = Number(item.quantity);
                const min = Number(item.min_threshold);
                const status = getStatus(qty, min);
                const percent = Math.min(100, Math.max(5, (qty / (min * 3 || 1)) * 100)); // Захист від ділення на 0

                return (
                  <tr key={item.id} onClick={() => setSelectedItem(item)} className={`cursor-pointer transition-colors group ${selectedItem?.id === item.id ? 'bg-[#edf7f2]' : 'hover:bg-[#fafaf8]'}`}>
                    <td className="py-2.5 px-3 text-[13px] font-medium text-[#1a1a18] border-b border-[#f4f4f2]">{item.chemical.name}</td>
                    <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2]">{item.chemical.category}</td>
                    <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2]">
                      <div>{qty} {item.chemical.base_unit}</div>
                      <div className="h-[6px] bg-[#f0f0ee] rounded-[3px] overflow-hidden mt-1">
                        <div className={`h-[6px] rounded-[3px] ${status.barColor}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2]">{item.warehouse.name}</td>
                    <td className="py-2.5 px-3 text-[13px] border-b border-[#f4f4f2]">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${status.colorClass}`}>{status.label}</span>
                    </td>
                  </tr>
                );
              })}
              {processedItems.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-500">Нічого не знайдено</td></tr>}
            </tbody>
          </table>
          
          <div className="flex gap-2 p-2.5 border-t border-[#e0e0db] mt-auto">
            {canEdit && <button onClick={handleAddNew} className="h-[32px] px-3.5 bg-[#2d7a50] text-white rounded-[7px] text-[13px] font-medium hover:bg-opacity-90">+ Додати позицію</button>}
          </div>
        </div>

        {/* ПРАВА КОЛОНКА */}
        <div className="w-[220px] bg-white border border-[#e0e0db] rounded-[10px] p-4 shrink-0 self-start">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3 pb-2 border-b border-[#f0f0ee]">Деталі позиції</div>
          {selectedItem ? (
            <>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Назва</span><span className="text-[12px] font-medium text-[#1a1a18] text-right truncate w-24">{selectedItem.chemical.name}</span></div>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Категорія</span><span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedItem.chemical.category}</span></div>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Залишок</span><span className="text-[12px] font-bold text-[#2d7a50] text-right">{Number(selectedItem.quantity)} {selectedItem.chemical.base_unit}</span></div>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Мін. поріг</span><span className="text-[12px] font-medium text-[#1a1a18] text-right">{Number(selectedItem.min_threshold)} {selectedItem.chemical.base_unit}</span></div>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Склад</span><span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedItem.warehouse.name}</span></div>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Оновлено</span><span className="text-[12px] font-medium text-[#1a1a18] text-right">{format(new Date(selectedItem.last_updated), 'dd.MM.yyyy')}</span></div>
              {canEdit && (
                <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-[#f0f0ee]">
                  <button onClick={() => handleEdit(selectedItem)} className="w-full h-[30px] border border-[#d0d0cc] rounded-[7px] text-[12px] font-medium hover:bg-gray-50">Редагувати залишок</button>
                  {canDelete && <button onClick={() => handleDelete(selectedItem.id)} className="w-full h-[30px] bg-[#fce8e8] text-[#c0392b] rounded-[7px] text-[12px] font-medium hover:bg-red-200">Видалити зі складу</button>}
                </div>
              )}
            </>
          ) : <div className="text-[12px] text-gray-500 text-center py-6">Оберіть позицію</div>}
        </div>
      </div>

      {/* МОДАЛКА */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] w-[400px] shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0e0db] bg-[#f8f8f6] flex justify-between items-center">
              <h3 className="font-medium text-[15px]">{formData.id ? 'Редагувати залишок' : 'Додати на склад'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] text-[#666] mb-1">Хімікат *</label>
                <select required disabled={formData.id !== 0} value={formData.chemical_id} onChange={e => setFormData({...formData, chemical_id: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50] disabled:bg-gray-100">
                  <option value="" disabled>Оберіть хімікат...</option>
                  {chemicals.map(c => <option key={c.id} value={c.id}>{c.name} ({c.category})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] text-[#666] mb-1">Склад *</label>
                <select required disabled={formData.id !== 0} value={formData.warehouse_id} onChange={e => setFormData({...formData, warehouse_id: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50] disabled:bg-gray-100">
                  <option value="" disabled>Оберіть приміщення...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} {w.zone ? `(${w.zone})` : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[12px] text-[#666] mb-1">Залишок *</label><input required type="number" step="0.1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" /></div>
                <div><label className="block text-[12px] text-[#666] mb-1">Мін. поріг *</label><input required type="number" step="0.1" value={formData.min_threshold} onChange={e => setFormData({...formData, min_threshold: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" /></div>
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