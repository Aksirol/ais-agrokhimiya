import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function Purchases() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Дані для модального вікна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [chemicals, setChemicals] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    supplier_id: '', chemical_id: '', quantity: '', price_per_unit: '', total_amount: ''
  });

  // Перевірка прав
  const currentUser = JSON.parse(localStorage.getItem('agro_user') || '{}');
  const canCreate = currentUser.role === 'admin' || currentUser.role === 'agronomist';
  const canApprove = currentUser.role === 'admin';
  const canReceive = currentUser.role === 'admin' || currentUser.role === 'operator';

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/purchases');
      setOrders(response.data);
      if (response.data.length > 0 && !selectedOrder) setSelectedOrder(response.data[0]);
    } catch (error) {
      console.error('Помилка завантаження закупівель:', error);
    }
  };

  const fetchFormData = async () => {
    try {
      const response = await axios.get('/api/purchases/form-data');
      setSuppliers(response.data.suppliers);
      setChemicals(response.data.chemicals);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
    if (canCreate) fetchFormData();
  }, []);

  // Автоматичний розрахунок суми
  useEffect(() => {
    if (formData.quantity && formData.price_per_unit) {
      setFormData(prev => ({
        ...prev, 
        total_amount: String(Number(prev.quantity) * Number(prev.price_per_unit))
      }));
    }
  }, [formData.quantity, formData.price_per_unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/purchases', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Помилка створення заявки');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.put(`/api/purchases/${id}/status`, { status: newStatus });
      fetchData();
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (error) {
      alert('Помилка оновлення статусу');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Видалити це замовлення?')) return;
    try {
      await axios.delete(`/api/purchases/${id}`);
      setSelectedOrder(null);
      fetchData();
    } catch (error) {}
  };

  // Кольори статусів
  const getStatusBadge = (status: string) => {
    if (status === 'Отримано') return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#d1f0e0] text-[#1e5c36]">Отримано</span>;
    if (status === 'Замовлено') return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#e6f1fb] text-[#0c447c]">Замовлено</span>;
    return <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#fde8c0] text-[#7a4a10]">Очікує</span>;
  };

  return (
    <div className="flex-1 overflow-auto p-5 bg-[#f5f5f2] relative">
      <div className="text-[20px] font-medium text-[#1a1a18] mb-4">Закупівлі</div>

      <div className="flex gap-3.5">
        {/* Таблиця */}
        <div className="flex-1 bg-white border border-[#e0e0db] rounded-[10px] overflow-hidden flex flex-col">
          <table className="w-full border-collapse table-fixed text-left">
            <thead className="bg-[#f8f8f6]">
              <tr>
                <th className="w-[15%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Дата</th>
                <th className="w-[30%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Постачальник</th>
                <th className="w-[20%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Сума</th>
                <th className="w-[20%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Автор</th>
                <th className="w-[15%] py-2.5 px-3 text-[12px] font-medium text-[#666] border-b border-[#e0e0db]">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`cursor-pointer transition-colors group ${selectedOrder?.id === order.id ? 'bg-[#edf7f2]' : 'hover:bg-[#fafaf8]'}`}
                >
                  <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2]">{format(new Date(order.order_date), 'dd.MM.yyyy')}</td>
                  <td className="py-2.5 px-3 text-[13px] font-medium text-[#1a1a18] border-b border-[#f4f4f2]">{order.supplier.name}</td>
                  <td className="py-2.5 px-3 text-[13px] text-[#1a1a18] border-b border-[#f4f4f2]">{Number(order.total_amount).toLocaleString()} грн</td>
                  <td className="py-2.5 px-3 text-[13px] text-[#666] border-b border-[#f4f4f2]">{order.user.name}</td>
                  <td className="py-2.5 px-3 border-b border-[#f4f4f2]">{getStatusBadge(order.status)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-500">Немає замовлень</td></tr>}
            </tbody>
          </table>
          
          <div className="flex gap-2 p-2.5 border-t border-[#e0e0db] mt-auto">
            {canCreate && (
              <button onClick={() => { setFormData({supplier_id: '', chemical_id: '', quantity: '', price_per_unit: '', total_amount: ''}); setIsModalOpen(true); }} className="h-[32px] px-3.5 bg-[#2d7a50] text-white border-none rounded-[7px] text-[13px] font-medium hover:bg-opacity-90">
                + Створити заявку
              </button>
            )}
          </div>
        </div>

        {/* Права колонка: Деталі */}
        <div className="w-[260px] bg-white border border-[#e0e0db] rounded-[10px] p-4 shrink-0 self-start">
          <div className="text-[13px] font-medium text-[#1a1a18] mb-3 pb-2 border-b border-[#f0f0ee]">
            Деталі замовлення
          </div>
          
          {selectedOrder ? (
            <>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Дата</span><span className="text-[12px] font-medium text-[#1a1a18]">{format(new Date(selectedOrder.order_date), 'dd.MM.yyyy')}</span></div>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Постачальник</span><span className="text-[12px] font-medium text-[#1a1a18] text-right">{selectedOrder.supplier.name}</span></div>
              <div className="flex justify-between mb-2"><span className="text-[12px] text-[#888]">Автор</span><span className="text-[12px] font-medium text-[#1a1a18]">{selectedOrder.user.name}</span></div>
              
              <div className="mt-4 mb-2 text-[11px] text-[#888] font-medium uppercase tracking-wide border-b border-[#f0f0ee] pb-1">Товари</div>
              {selectedOrder.orderItems.map((item: any) => (
                <div key={item.id} className="mb-2 bg-[#f8f8f6] p-2 rounded border border-[#e0e0db]">
                  <div className="text-[12px] font-medium text-[#1a1a18] mb-1">{item.chemical.name}</div>
                  <div className="flex justify-between text-[11px] text-[#555]">
                    <span>{Number(item.quantity)} {item.chemical.base_unit} × {Number(item.price_per_unit)} грн</span>
                    <span className="font-medium text-[#1a1a18]">{Number(item.quantity) * Number(item.price_per_unit)} грн</span>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between mt-3 pt-2 border-t border-[#f0f0ee]">
                <span className="text-[13px] font-medium text-[#1a1a18]">Всього:</span>
                <span className="text-[14px] font-bold text-[#2d7a50]">{Number(selectedOrder.total_amount).toLocaleString()} грн</span>
              </div>

              {/* Кнопки дій залежно від ролі та статусу */}
              <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-[#f0f0ee]">
                {canApprove && selectedOrder.status === 'Очікує' && (
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Замовлено')} className="w-full h-[30px] bg-[#e6f1fb] text-[#0c447c] rounded-[7px] text-[12px] font-medium hover:bg-blue-100">
                    Затвердити (Замовити)
                  </button>
                )}
                {canReceive && selectedOrder.status === 'Замовлено' && (
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Отримано')} className="w-full h-[30px] bg-[#d1f0e0] text-[#1e5c36] rounded-[7px] text-[12px] font-medium hover:bg-green-200">
                    Прийняти на склад
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button onClick={() => handleDelete(selectedOrder.id)} className="w-full h-[30px] bg-white border border-[#d0d0cc] text-[#c0392b] rounded-[7px] text-[12px] hover:bg-red-50 mt-1">
                    Видалити замовлення
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-[12px] text-gray-500 text-center py-6">Оберіть замовлення</div>
          )}
        </div>
      </div>

      {/* Модальне вікно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-[10px] w-[450px] shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e0e0db] flex justify-between items-center bg-[#f8f8f6]">
              <h3 className="font-medium text-[15px]">Створити заявку на закупівлю</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] text-[#666] mb-1">Постачальник *</label>
                <select required value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]">
                  <option value="" disabled>Оберіть постачальника...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="p-3 bg-[#f8f8f6] border border-[#e0e0db] rounded-md flex flex-col gap-3">
                <div className="text-[12px] font-medium text-[#1a1a18]">Товар</div>
                <div>
                  <select required value={formData.chemical_id} onChange={e => setFormData({...formData, chemical_id: e.target.value})} className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]">
                    <option value="" disabled>Оберіть хімікат...</option>
                    {chemicals.map(c => <option key={c.id} value={c.id}>{c.name} ({c.category})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#666] mb-1">Кількість *</label>
                    <input required type="number" step="0.1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full px-3 py-1.5 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#666] mb-1">Ціна за од. (грн) *</label>
                    <input required type="number" step="0.1" value={formData.price_per_unit} onChange={e => setFormData({...formData, price_per_unit: e.target.value})} className="w-full px-3 py-1.5 border rounded-md text-[13px] focus:outline-none focus:border-[#2d7a50]" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#edf7f2] p-3 rounded-md border border-[#c5e8c5]">
                <span className="text-[13px] font-medium text-[#1a1a18]">Загальна сума:</span>
                <span className="text-[15px] font-bold text-[#2d7a50]">{formData.total_amount ? `${Number(formData.total_amount).toLocaleString()} грн` : '0 грн'}</span>
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-[#e0e0db]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-[13px] hover:bg-gray-50">Скасувати</button>
                <button type="submit" className="px-4 py-2 bg-[#2d7a50] text-white rounded-md text-[13px] hover:bg-opacity-90">Створити</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}