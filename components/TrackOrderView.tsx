import React, { useState } from 'react';
import { ViewType, OrderItem } from '../types';

interface UserTrackViewProps {
  orders: OrderItem[];
  onNavigate?: (view: ViewType) => void;
}

const UserTrackView: React.FC<UserTrackViewProps> = ({ orders, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // --- คำนวณ Sustainability Score ---
  // สมมติว่าคะแนนมาจากการเปรียบเทียบรายการที่เป็น Green เทียบกับทั้งหมด
  const totalItems = orders.length;
  const greenItems = orders.filter(item => item.isGreen).length;
  const sustainabilityPercent = totalItems > 0 ? Math.round((greenItems / totalItems) * 100) : 0;

  // กรองรายการตามการค้นหา (Bill ID หรือ ชื่อผู้สั่ง)
  const filteredOrders = orders.filter(order => 
    order.billId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 px-4 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-3 py-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ติดตามสถานะการจัดซื้อ</h1>
        <p className="text-gray-500 font-medium">ตรวจสอบความคืบหน้าและคะแนนความยั่งยืนของคุณ</p>
      </div>

      {/* --- 1. Sustainability Score Dashboard Card --- */}
      <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-xl shadow-gray-100 border border-gray-50 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Badge & Level Icon */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-8 border-gray-50 flex items-center justify-center bg-white shadow-inner">
              <span className="text-5xl">🌱</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter">
              Active
            </div>
          </div>

          {/* Progress Info */}
          <div className="flex-grow w-full space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="block text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Sustainability Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-gray-900">{sustainabilityPercent}%</span>
                  <span className="text-xl font-bold text-green-500">Green Starter</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{greenItems} / {totalItems}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">รายการกรีน</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${sustainabilityPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Search Bar Section --- */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
          <span className="text-xl">🔍</span>
        </div>
        <input 
          type="text"
          placeholder="กรอกเลขใบสั่งซื้อ (Bill ID) หรือชื่อผู้สั่ง..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-6 bg-white border-2 border-transparent shadow-lg rounded-3xl outline-none focus:border-green-500/20 focus:ring-4 focus:ring-green-500/5 transition-all text-lg font-medium text-gray-700 placeholder:text-gray-300"
        />
      </div>

      {/* --- 3. Search Results / Empty State --- */}
      <div className="bg-blue-50/50 rounded-[40px] border-2 border-dashed border-blue-100 p-12 text-center">
        {searchQuery === '' ? (
          <div className="space-y-4">
            <div className="text-4xl animate-pulse">💡</div>
            <h3 className="text-xl font-bold text-blue-900">ค้นหาด้วยเลขที่ใบสั่งซื้อ</h3>
            <p className="text-blue-500 text-sm max-w-xs mx-auto leading-relaxed">
              ระบบจะแสดงข้อมูลแบบ Real-time จากระบบฐานข้อมูล เพื่อให้คุณติดตามสถานะได้ทันที
            </p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 text-left">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase">{order.billId}</span>
                  <h4 className="font-bold text-gray-800">{order.productName}</h4>
                  <p className="text-xs text-gray-500">ผู้สั่ง: {order.userName}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600 uppercase">
                    {order.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(order.requestedAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10">
            <div className="text-4xl mb-4">🏜️</div>
            <p className="text-gray-400 font-bold">ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTrackView;
