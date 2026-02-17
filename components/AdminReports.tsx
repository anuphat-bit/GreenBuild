
import React, { useState, useMemo } from 'react';
import { OrderItem } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface AdminReportsProps {
  orders: OrderItem[];
}

const AdminReports: React.FC<AdminReportsProps> = ({ orders }) => {
  const [reportType, setReportType] = useState<'CALENDAR' | 'FISCAL'>('CALENDAR');
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const date = new Date(order.requestedAt);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11

      if (reportType === 'CALENDAR') {
        return year === targetYear;
      } else {
        const fy = month >= 9 ? year + 1 : year;
        return fy === targetYear;
      }
    });
  }, [orders, reportType, targetYear]);

  const stats = useMemo(() => {
    const greenCount = filteredOrders.filter(o => o.isGreen).length;
    const totalCount = filteredOrders.length;
    const greenSpend = filteredOrders.filter(o => o.isGreen).reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
    const totalSpend = filteredOrders.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);

    return {
      greenCount,
      totalCount,
      greenRatio: totalCount > 0 ? (greenCount / totalCount) * 100 : 0,
      greenSpend,
      totalSpend,
      spendRatio: totalSpend > 0 ? (greenSpend / totalSpend) * 100 : 0
    };
  }, [filteredOrders]);

  const departmentGreenData = useMemo(() => {
    const deptMap: Record<string, { name: string, green: number, total: number }> = {};
    
    filteredOrders.forEach(order => {
      const deptName = order.department || 'ไม่ระบุแผนก';
      if (deptName === 'โปรดเลือกแผนก/ฝ่าย') return;

      if (!deptMap[deptName]) {
        deptMap[deptName] = { name: deptName, green: 0, total: 0 };
      }
      deptMap[deptName].total += 1;
      if (order.isGreen) {
        deptMap[deptName].green += 1;
      }
    });

    return Object.values(deptMap)
      .sort((a, b) => b.green - a.green);
  }, [filteredOrders]);

  const pieData = [
    { name: 'วัสดุกรีน', value: stats.greenCount },
    { name: 'วัสดุทั่วไป', value: stats.totalCount - stats.greenCount }
  ];

  const COLORS = ['#10b981', '#cbd5e1'];

  const exportCSV = () => {
    const headers = ['Order ID', 'Material', 'Quantity', 'Is Green', 'Label', 'Price', 'Date', 'User', 'Department'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.productName,
      o.quantity,
      o.isGreen ? 'Yes' : 'No',
      o.greenLabel || '-',
      o.finalPrice || 0,
      new Date(o.requestedAt).toLocaleDateString(),
      o.userName,
      o.department
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `green_report_${reportType}_${targetYear}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 px-1 md:px-0 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">รายงานวัสดุกรีนสำนักงาน</h1>
          <p className="text-gray-500 text-sm">ติดตามความคืบหน้าการจัดซื้อวัสดุที่เป็นมิตรต่อสิ่งแวดล้อม</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
           <button 
             onClick={exportCSV}
             className="flex-1 md:flex-none px-6 py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 flex items-center justify-center gap-2 text-sm shadow-lg shadow-gray-200"
           >
             📥 ส่งออกข้อมูล CSV
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase">ประเภท:</span>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value as 'CALENDAR' | 'FISCAL')}
            className="flex-1 md:flex-none border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="CALENDAR">ปีปฏิทิน</option>
            <option value="FISCAL">ปีงบประมาณ</option>
          </select>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-400 uppercase">ปี:</span>
          <input 
            type="number" 
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className="flex-1 md:flex-none border rounded-xl px-3 py-2 text-sm w-full md:w-24"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-green-500">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">รายการวัสดุกรีน</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{stats.greenCount} <span className="text-sm font-normal text-gray-400">/ {stats.totalCount}</span></div>
          <div className="mt-2 text-green-600 text-xs font-bold">{stats.greenRatio.toFixed(1)}% ของทั้งหมด</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-blue-500">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">ยอดจัดซื้อวัสดุกรีน</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">฿{stats.greenSpend.toLocaleString()}</div>
          <div className="mt-2 text-blue-600 text-xs font-bold">{stats.spendRatio.toFixed(1)}% ของงบรวม</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-l-4 border-l-orange-500 sm:col-span-2">
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">เป้าหมาย Green Office</div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(stats.greenRatio, 100)}%` }}></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
             <span>ปัจจุบัน {stats.greenRatio.toFixed(1)}%</span>
             <span>เป้าหมายองค์กร 60%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">สัดส่วนวัสดุที่ใช้</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
          <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">สถิติการสั่งซื้อวัสดุกรีนรายแผนก / ฝ่ายงาน</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentGreenData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="green" 
                  name="จำนวนรายการวัสดุกรีน" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
