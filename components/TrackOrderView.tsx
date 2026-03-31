import React, { useState, useMemo } from 'react';
import { OrderItem } from '../types';
import { GoogleSheetService } from '../services/googleSheetService';

interface TrackOrderViewProps {
  orders: OrderItem[];
}

const TrackOrderView: React.FC<TrackOrderViewProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. ส่วนคำนวณ Sustainability Score (Sync กับ Cloud) ---
  const sustainabilityStats = useMemo(() => {
    // กรองเอาเฉพาะออเดอร์ที่ไม่ใช่ REJECTED มาคำนวณคะแนน
    const activeOrders = orders.filter(o => o.status !== 'REJECTED');
    const total = activeOrders.length;
    const green = activeOrders.filter(o => o.isGreen).length;
    const ratio = total > 0 ? (green / total) * 100 : 0;

    // กำหนด Tier ตามสัดส่วนสินค้ากรีน
    let tier = "Green Starter";
    let tierColor = "text-gray-400";
    let icon = "🌱";
    if (ratio >= 80) { 
      tier = "Sustainability Champion"; tierColor = "text-emerald-600"; icon = "🏆";
    } else if (ratio >= 50) { 
      tier = "Eco Explorer"; tierColor = "text-green-500"; icon = "🌲";
    } else if (ratio > 0) { 
      tier = "Green Starter"; tierColor = "text-emerald-400"; icon = "🌱";
    }

    return { total, green, ratio, tier, tierColor, icon };
  }, [orders]); // คำนวณใหม่ทุกครั้งที่ข้อมูล orders อัปเดตจาก Cloud

  // --- 2. ส่วน Logic การค้นหาออเดอร์ ---
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerSearch = searchTerm.toLowerCase();
    // ค้นหาจาก Bill ID หรือ ชื่อผู้สั่ง
    return orders.filter(order => 
      (order.billId && order.billId.toLowerCase().includes(lowerSearch)) ||
      (order.userName && order.userName.toLowerCase().includes(lowerSearch))
    ).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [orders, searchTerm]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">ติดตามสถานะการจัดซื้อ</h1>
        <p className="text-gray-500 mt-2 text-sm">ตรวจสอบความคืบหน้าและคะแนนความยั่งยืนของคุณ</p>
      </div>

      {/* 🟢 ส่วนที่ 1: Sustainability Score Card (เหมือนในรูป) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-center gap-8 relative overflow-hidden">
        {/* 🌱 ไอคอนซ้ายมือ */}
        <div className="w-28 h-28 rounded-full border-4 border-emerald-50 flex flex-col items-center justify-center bg-white shadow-inner shrink-0 gap-1">
          <span className="text-5xl">{sustainabilityStats.icon}</span>
          <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>
        </div>

        {/* 📊 รายละเอียดคะแนน */}
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Sustainability Score</h2>
              <div className="flex items-center gap-3">
                {/* ดึงคะแนน % มาแสดงสดๆ */}
                <span className="text-4xl font-bold text-gray-800">{sustainabilityStats.ratio.toFixed(0)}%</span>
                <span className={`text-sm font-bold ${sustainabilityStats.tierColor}`}>{sustainabilityStats.tier}</span>
              </div>
            </div>
            {/* แสดงสัดส่วน 0 / 0 */}
            <div className="text-right text-gray-500 text-sm">
              <span className="text-2xl font-semibold text-gray-800">{sustainabilityStats.green} / {sustainabilityStats.total}</span>
              <div className="text-xs font-medium text-gray-400">รายการกรีน</div>
            </div>
          </div>

          {/* ➖ Progress Bar */}
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${sustainabilityStats.ratio}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 ส่วนที่ 2: ช่องค้นหาออเดอร์ */}
      <div className="relative group">
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="กรอกเลขใบสั่งซื้อ (Bill ID) หรือชื่อผู้สั่ง..."
          className="w-full px-6 py-4 rounded-full border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all text-sm pl-14"
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-emerald-500 transition-colors">
          🔍
        </span>
        <button 
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        >
          🔎
        </button>
      </div>

      {/* 📦 ส่วนที่ 3: แสดงผลการค้นหา (Empty State หรือ รายการออเดอร์) */}
      <div className="min-h-[250px] bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
        {!searchTerm.trim() ? (
          // หน้าตาตอนยังไม่ได้ค้นหา (เหมือนในรูป)
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">💡</div>
            <h3 className="text-lg font-bold text-gray-800">ค้นหาด้วยเลขที่ใบสั่งซื้อ</h3>
            <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">ระบบจะแสดงข้อมูลแบบ Real-time จาก Google Cloud</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          // หน้าตาตอนค้นหาแล้วไม่เจอ
          <div className="space-y-3 text-gray-500">
            <div className="text-6xl">🤷‍♂️</div>
            <p className="font-medium">ไม่พบข้อมูลใบสั่งซื้อ "{searchTerm}"</p>
            <p className="text-xs">โปรดตรวจสอบ Bill ID หรือชื่อผู้สั่งอีกครั้ง</p>
          </div>
        ) : (
          // หน้าตาตอนเจอออเดอร์ (คุณสามารถนำ UserOrdersView ของคุณมาใส่ตรงนี้ได้)
          <div className="w-full text-left space-y-4">
            <p className="text-xs text-gray-400 mb-4">พบ {filteredOrders.length} รายการสำหรับ "{searchTerm}"</p>
            {filteredOrders.map(order => (
              <div key={order.id} className="border-b pb-3 text-sm text-gray-700">
                [{order.status}] {order.productName} - {order.quantity} {order.unit} ({order.userName})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderView;
