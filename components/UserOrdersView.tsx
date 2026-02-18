import React from 'react';
import { OrderItem, OrderStatus } from '../types';

interface UserOrdersViewProps {
  orders: OrderItem[];
}

const UserOrdersView: React.FC<UserOrdersViewProps> = ({ orders }) => {
  // คำนวณคะแนนความยั่งยืน (ตัวอย่าง)
  const greenItems = orders.filter(o => o.category === 'GREEN' || o.isGreen).length;
  const sustainabilityScore = orders.length > 0 ? Math.round((greenItems / orders.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ส่วนแสดง Sustainability Score เหมือนในรูปภาพของคุณ */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full border-8 border-emerald-50 flex items-center justify-center relative">
             <div className="text-center">
                <span className="text-3xl font-black text-gray-800">{sustainabilityScore}%</span>
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Eco Score</div>
             </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sustainability Score</h2>
            <p className="text-gray-500 text-sm mt-1">"คุณช่วยองค์กรลดการปล่อยก๊าซเรือนกระจกผ่านการเลือกวัสดุที่เป็นมิตรต่อสิ่งแวดล้อม เยี่ยมมาก!"</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800">รายการสั่งซื้อของฉัน</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${order.status === OrderStatus.APPROVED ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                {order.status === OrderStatus.APPROVED ? '✅' : '📦'}
              </div>
              <div>
                {/* ✅ แก้จุดสำคัญ: ใช้ order.name และ order.amount */}
                <h3 className="font-bold text-gray-800">{order.name || 'ไม่ระบุชื่อสินค้า'}</h3>
                <p className="text-xs text-gray-400">จำนวน: {order.amount || 0} {order.unit} | {new Date(order.requestedAt || Date.now()).toLocaleDateString('th-TH')}</p>
                <p className="text-[10px] text-gray-300 uppercase mt-1">ID: {order.id}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                order.status === OrderStatus.APPROVED ? 'bg-emerald-500 text-white' : 
                order.status === OrderStatus.REJECTED ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-600'
              }`}>
                {order.status}
              </span>
              {order.finalPrice && (
                <div className="mt-2 font-bold text-gray-800">฿{order.finalPrice}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrdersView;
