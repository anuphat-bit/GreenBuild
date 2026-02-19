
import React, { useState, useMemo } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface TrackOrderViewProps {
  orders: OrderItem[];
}

const TrackOrderView: React.FC<TrackOrderViewProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // คำนวณสถิติความยั่งยืน
  const sustainabilityStats = useMemo(() => {
    const total = orders.length;
    const green = orders.filter(o => o.isGreen).length;
    const ratio = total > 0 ? (green / total) * 100 : 0;
    
    let tier = "Green Beginner";
    let tierColor = "text-gray-400";
    let emoji = "🌱";

    if (ratio >= 80) { 
      tier = "Sustainability Champion"; 
      tierColor = "text-emerald-600"; 
      emoji = "🏆";
    } else if (ratio >= 50) { 
      tier = "Eco Explorer"; 
      tierColor = "text-green-500"; 
      emoji = "🌿";
    } else if (ratio > 0) { 
      tier = "Green Starter"; 
      tierColor = "text-emerald-400"; 
      emoji = "🌱";
    }

    return { total, green, ratio, tier, tierColor, emoji };
  }, [orders]);

  const groupedOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const matchedItems = orders.filter(order => 
      order.billId.toLowerCase().includes(query) || 
      order.userName.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query)
    );

    const billIds = Array.from(new Set(matchedItems.map(item => item.billId)));
    const allItemsInBills = orders.filter(order => billIds.includes(order.billId));

    const groups: Record<string, OrderItem[]> = {};
    allItemsInBills.forEach(item => {
      if (!groups[item.billId]) groups[item.billId] = [];
      groups[item.billId].push(item);
    });

    return Object.entries(groups).sort((a, b) => {
      const timeA = new Date(a[1][0].requestedAt).getTime();
      const timeB = new Date(b[1][0].requestedAt).getTime();
      return timeB - timeA;
    });
  }, [orders, searchQuery]);

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.APPROVED: return { label: 'อนุมัติแล้ว', color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case OrderStatus.REJECTED: return { label: 'ปฏิเสธคำขอ', color: 'text-rose-600', bg: 'bg-rose-50' };
      case OrderStatus.SHIPPED: return { label: 'จัดส่งแล้ว', color: 'text-indigo-600', bg: 'bg-indigo-50' };
      default: return { label: 'รอตรวจสอบ', color: 'text-amber-600', bg: 'bg-amber-50' };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-2 md:px-0">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">ติดตามสถานะการจัดซื้อ</h1>
        <p className="text-gray-500 text-sm">ตรวจสอบความคืบหน้าและคะแนนความยั่งยืนของคุณ</p>
      </div>

      {/* Sustainability Dashboard (แท่งเขียวๆ) */}
      {orders.length > 0 && (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-700">
          <div className="p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
               <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white shadow-lg text-4xl">
                  {sustainabilityStats.emoji}
               </div>
               <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md border-2 border-white">
                 ACTIVE
               </div>
            </div>
            <div className="flex-grow space-y-4 w-full">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Sustainability Score</h2>
                  <div className="flex items-center gap-2">
                     <span className="text-3xl font-bold text-gray-800">{sustainabilityStats.ratio.toFixed(0)}%</span>
                     <span className={`text-sm font-bold ${sustainabilityStats.tierColor}`}>{sustainabilityStats.tier}</span>
                  </div>
                </div>
                <div className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {sustainabilityStats.green} / {sustainabilityStats.total} รายการกรีน
                </div>
              </div>
              <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{ width: `${sustainabilityStats.ratio}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="relative group">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="กรอกเลขที่ใบสั่งซื้อ (Bill ID) หรือชื่อผู้สั่ง..."
          className="w-full px-6 py-4 bg-white border-2 border-gray-50 rounded-2xl shadow-xl shadow-gray-100 focus:border-green-500 outline-none transition-all pr-12"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">🔍</div>
      </div>

      <div className="space-y-6">
        {searchQuery.trim() === '' ? (
          <div className="bg-indigo-50/50 p-8 rounded-[32px] border border-indigo-100 text-center space-y-2">
            <p className="text-indigo-700 font-bold text-sm">💡 ค้นหาด้วยเลขที่ใบสั่งซื้อ</p>
            <p className="text-indigo-600/70 text-[11px] leading-relaxed">
              ระบุเลข BILL-xxx ที่คุณได้รับหลังส่งคำสั่งซื้อ<br/>
              ระบบจะดึงข้อมูล Real-time จาก Google Cloud
            </p>
          </div>
        ) : groupedOrders.length > 0 ? (
          groupedOrders.map(([billId, items]) => {
            const firstItem = items[0];
            const status = getStatusDisplay(firstItem.status);
            return (
              <div key={billId} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="p-6 bg-gray-50/50 border-b flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">เลขที่ใบสั่งซื้อ (BILL ID)</div>
                    <div className="font-mono font-bold text-gray-900 text-xl tracking-tight">{billId}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      โดย <span className="font-bold text-gray-700">{firstItem.userName}</span> ({firstItem.department})
                    </div>
                  </div>
                  <div className={`px-5 py-2 rounded-full text-xs font-bold ${status.bg} ${status.color} border shadow-sm self-start md:self-center`}>
                    {status.label}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-50 hover:border-emerald-100 transition-colors">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                        {item.imageAttachment ? (
                          <img src={item.imageAttachment} className="w-full h-full object-cover" alt="product" />
                        ) : (
                          <span className="text-xl">{item.isGreen ? '🌱' : '📦'}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-800">{item.productName}</h4>
                          {item.isGreen && <span className="text-[8px] bg-emerald-100 text-emerald-700 font-bold px-1 rounded">GREEN</span>}
                        </div>
                        <p className="text-[10px] text-gray-500">{item.quantity} {item.unit} {item.description && `| ${item.description}`}</p>
                      </div>
                      {item.finalPrice && (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-gray-400 font-bold uppercase">ราคา</div>
                          <div className="text-sm font-bold text-emerald-600">฿{item.finalPrice.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {firstItem.adminComment && (
                    <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">หมายเหตุจากเจ้าหน้าที่</span>
                      <p className="text-xs text-blue-800 italic leading-relaxed">"{firstItem.adminComment}"</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4 grayscale opacity-20">🕵️‍♂️</div>
            <h3 className="text-lg font-bold text-gray-400">ไม่พบข้อมูลในระบบ</h3>
            <p className="text-xs text-gray-300 mt-1">กรุณาตรวจสอบเลข Bill ID อีกครั้ง</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderView;
