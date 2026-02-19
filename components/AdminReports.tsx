
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
        // ปีงบประมาณไทย เริ่ม ต.ค. (9) ของปีที่แล้ว ถึง ก.ย. (8) ของปีปัจจุบัน
        const fy = month >= 9 ? year + 1 : year;
        return fy === targetYear;
      }
    });
  }, [orders, reportType, targetYear]);

  const stats = useMemo(() => {
    const totalCount = filteredOrders.length;
    const greenCount = filteredOrders.filter(o => o.isGreen).length;
    const greenRatio = totalCount > 0 ? (greenCount / totalCount) * 100 : 0;
    
    const totalSpend = filteredOrders.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
    const greenSpend = filteredOrders.filter(o => o.isGreen).reduce((acc, curr) => acc + (curr.finalPrice || 0), 0);
    const spendRatio = totalSpend > 0 ? (greenSpend / totalSpend) * 100 : 0;

    return { greenCount, totalCount, greenRatio, greenSpend, totalSpend, spendRatio };
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
    const headers = ['Order ID', 'Material', 'Quantity', 'Unit', 'Is Green', 'Label', 'Price', 'Date', 'User', 'Department'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.productName,
      o.quantity,
      o.unit || '-',
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
        <button 
          onClick={exportCSV}
          className="w-full md:w-auto px-6 py-2.5 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 flex items-center justify-center gap-2 text-sm shadow-lg shadow-gray-200"
        >
          📥 ส่งออกข้อมูล CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">ประเภท:</label>
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="border-none bg-gray-50 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-0"
          >
            <option value="CALENDAR">ปีปฏิทิน</option>
            <option value="FISCAL">ปีงบประมาณ</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">ปี:</label>
          <input 
            type="number"
            value={targetYear}
            onChange={(e) => setTargetYear(parseInt(e.target.value))}
            className="w-24 border-none bg-gray-50 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-l-4 border-l-green-500 shadow-sm space-y-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">รายการวัสดุกรีน</h3>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-800">{stats.greenCount}</span>
            <span className="text-gray-400 font-bold mb-1">/ {stats.totalCount}</span>
          </div>
          <p className="text-xs font-bold text-green-600">{stats.greenRatio.toFixed(1)}% ของทั้งหมด</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-l-4 border-l-blue-500 shadow-sm space-y-2">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ยอดจัดซื้อวัสดุกรีน</h3>
          <div className="text-3xl font-bold text-gray-800">฿{stats.greenSpend.toLocaleString()}</div>
          <p className="text-xs font-bold text-blue-600">{stats.spendRatio.toFixed(1)}% ของงบรวม</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-l-4 border-l-orange-500 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">เป้าหมาย GREEN OFFICE</h3>
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute h-full bg-green-500" style={{ width: `${Math.min(stats.greenRatio / 0.6, 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-gray-400 uppercase">ปัจจุบัน {stats.greenRatio.toFixed(1)}%</span>
            <span className="text-gray-400 uppercase">เป้าหมายองค์กร 60%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm h-[400px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6">สัดส่วนวัสดุที่ใช้</h3>
          <div className="flex-grow">
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
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border shadow-sm h-[400px] flex flex-col overflow-x-auto">
          <h3 className="font-bold text-gray-800 mb-6">สถิติการสั่งซื้อวัสดุกรีนรายแผนก / ฝ่ายงาน</h3>
          <div className="flex-grow min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentGreenData} margin={{ top: 5, right: 30, left: 0, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  angle={-15} 
                  textAnchor="end" 
                  interval={0} 
                  fontSize={10}
                  stroke="#94a3b8"
                />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="green" name="วัสดุกรีน" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
