import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import type { PurchaseOrder } from '../types';

export default function Purchases() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/purchases')
      .then(response => {
        setOrders(response.data);
        if (response.data.length > 0) setSelectedOrder(response.data[0]);
      })
      .catch(error => console.error('Помилка завантаження:', error));
  }, []);

  return (
    <div className="flex-1 overflow-auto p-6 flex gap-6">
      {/* Ліва колонка: Фільтри та Таблиця */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Фільтри */}
        <div className="flex items-end gap-4 bg-white p-4 rounded border">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Дата з:</label>
            <div className="relative">
              <input type="text" defaultValue="01.01.2024" className="pl-3 pr-10 py-1.5 border rounded text-sm w-36" />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Дата по:</label>
            <div className="relative">
              <input type="text" defaultValue="31.12.2024" className="pl-3 pr-10 py-1.5 border rounded text-sm w-36" />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Постачальник:</label>
            <select className="w-full px-3 py-1.5 border rounded text-sm appearance-none bg-white">
              <option>Всі</option>
              <option>АгроХім Сервіс</option>
            </select>
          </div>
          <button className="bg-agro-dark text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-opacity-90">
            Фільтр
          </button>
        </div>

        {/* Таблиця */}
        <div className="bg-white border rounded overflow-hidden flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Дата</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Постачальник</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Сума</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`border-b cursor-pointer hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-green-50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium">{order.id}</td>
                  <td className="px-4 py-3">{format(new Date(order.order_date), 'dd.MM.yyyy')}</td>
                  <td className="px-4 py-3">{order.supplier.name}</td>
                  <td className="px-4 py-3 font-medium">{Number(order.total_amount).toLocaleString()} грн</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${order.status === 'Отримано' ? 'bg-agro-light' : 'bg-agro-dark'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 border-t flex justify-between items-center bg-gray-50">
            <div className="flex gap-2">
              <button className="bg-agro-dark text-white px-4 py-1.5 rounded flex items-center gap-1 text-sm">
                <span className="text-lg leading-none">+</span> Додати
              </button>
              <button className="bg-white border px-4 py-1.5 rounded text-sm hover:bg-gray-50">Редагувати</button>
            </div>
          </div>
        </div>
      </div>

      {/* Права колонка: Деталі закупівлі */}
      <div className="w-80 bg-white border rounded p-5 flex flex-col gap-4 flex-shrink-0">
        <h3 className="font-semibold text-lg border-b pb-2">Деталі закупівлі</h3>
        {selectedOrder ? (
          <>
            <div className="text-sm flex flex-col gap-2">
              <div><span className="text-gray-500">Замовлення ID:</span> <span className="font-medium">{selectedOrder.id}</span></div>
              <div><span className="text-gray-500">Дата:</span> {format(new Date(selectedOrder.order_date), 'dd.MM.yyyy')}</div>
              <div><span className="text-gray-500">Постачальник:</span> {selectedOrder.supplier.name}</div>
              <div className="pt-2"><span className="text-gray-500">Загальна сума:</span> <span className="font-bold">{Number(selectedOrder.total_amount).toLocaleString()} грн</span></div>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-3">Товари:</div>
              <div className="flex flex-col gap-3">
                {selectedOrder.orderItems.map(item => (
                  <div key={item.id} className="text-sm bg-gray-50 p-3 rounded border border-gray-100">
                    <div className="font-semibold mb-1">• {item.chemical.name}</div>
                    <div className="pl-3 text-gray-600 flex flex-col gap-1 text-xs">
                      <div>• Кількість: {Number(item.quantity)} кг</div>
                      <div>• Ціна: {Number(item.price_per_unit).toLocaleString()} грн</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto pt-4 border-t flex justify-between items-center text-sm">
              <span className="text-gray-500">Статус:</span>
              <span className="font-bold text-gray-800">{selectedOrder.status}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500 text-center py-10">Оберіть замовлення</div>
        )}
      </div>
    </div>
  );
}