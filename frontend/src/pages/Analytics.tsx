import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Типи для наших графіків
interface PieData {
  name: string;
  value: number;
}

interface BarData {
  name: string;
  amount: number;
}

export default function Analytics() {
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [barData, setBarData] = useState<BarData[]>([]);

  // Кольори для кругової діаграми
  const COLORS = ['#2A5C4A', '#72A072', '#A3C4A3', '#D1E2D1'];

  useEffect(() => {
    axios.get('http://localhost:5000/api/analytics/dashboard')
      .then(response => {
        setPieData(response.data.pieData);
        setBarData(response.data.barData);
      })
      .catch(error => console.error('Помилка завантаження аналітики:', error));
  }, []);

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
      
      {/* Верхні картки (KPIs) */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Загальні витрати (грн)</div>
          <div className="text-2xl font-bold text-agro-dark">
            {pieData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Активні постачальники</div>
          <div className="text-2xl font-bold text-agro-dark">{pieData.length}</div>
        </div>
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Видів хімікатів використано</div>
          <div className="text-2xl font-bold text-agro-dark">{barData.length}</div>
        </div>
      </div>

      {/* Графіки */}
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-[400px]">
        
        {/* Кругова діаграма */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-lg border-b pb-3 mb-4">Витрати за постачальниками</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${Number(value).toLocaleString()} грн`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Стовпчаста діаграма */}
        <div className="bg-white p-5 rounded border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-lg border-b pb-3 mb-4">Використання хімікатів (кг/л)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value} од.`} cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="amount" fill="#72A072" radius={[4, 4, 0, 0]} name="Кількість" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}