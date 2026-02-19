import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface UserOrdersViewProps {
  orders: OrderItem[];
}

const UserOrdersView: React.FC<UserOrdersViewProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. คำนวณสถิติ Green Items (คงไว้ตามความต้องการ)
  const greenItems = orders.filter(o => o.category === 'GREEN' || o.isGreen).length;
  const sustainabilityScore = orders.length > 0 ? Math.round((greenItems / orders.length) * 100) : 0;

  // 2. ฟังก์ชันค้นหาออร์เดอร์ (กรองจากหมายเลข ID หรือ ชื่อสินค้า)
  const filteredOrders = orders.filter(order => 
    order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ส่วนแสดง Sustainability Score (Eco Bar) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full border-8 border-emerald-50 flex items-center justify-center relative bg-white">
             <div className="text-center">
                <span className="text-3xl font-black text-gray-800">{sustainabilityScore}%</span>
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Eco Score</div>
             </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sustainability Score</h2>
            <p className="text-gray-500 text-sm mt-1">
              "คุณสั่งซื้อวัสดุกรีนไปแล้ว {greenItems} จาก {orders.length} รายการ ช่วยลดคาร์บอนได้เยี่ยมมาก!"
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-3 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000" 
                style={{ width: `${sustainabilityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนของช่องค้นหา (Search Bar) */}
      <div className="relative">
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อสินค้า หรือ หมายเลขคำสั่งซื้อ (เช่น ORD-123...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all pl-14"
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">รายการสั่งซื้อของฉัน</h2>
        <span className="text-sm text-gray-400">พบ {filteredOrders.length} รายการ</span>
      </div>
      
      {/* รายการออร์เดอร์ */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                  order.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                  order.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {order.status === 'APPROVED' ? '✅' : order.status === 'REJECTED' ? '❌' : '📦'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{order.name}</h3>
                    {(order.category === 'GREEN' || order.isGreen) && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">GREEN</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    จำนวน: {order.amount} {order.unit} | {order.timestamp || new Date(order.requestedAt).toLocaleDateString('th-TH')}
                  </p>
                  <p className="text-[10px] text-gray-300 uppercase mt-1 tracking-wider font-mono">ID: {order.id}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  order.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                  order.status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-600'
                }`}>
                  {order.status === 'APPROVED' ? 'อนุมัติแล้ว' : 
                   order.status === 'REJECTED' ? 'ปฏิเสธ' : 'รอตรวจสอบ'}
                </span>
                {order.finalPrice && (
                  <div className="mt-2 font-bold text-gray-800">฿{order.finalPrice}</div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="text-4xl mb-4">🏜️</div>
            <p className="text-gray-400">ไม่พบรายการที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersView;
