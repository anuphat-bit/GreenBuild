
import React, { useState, useMemo } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface TrackOrderViewProps {
  orders: OrderItem[];
}

const TrackOrderView: React.FC<TrackOrderViewProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">ค้นหาและติดตามสถานะ</h1>
        <p className="text-gray-500 text-sm px-4">ระบบเชื่อมต่อ Google Sheets แบบ Real-time</p>
      </div>

      <div className="relative group px-2">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="กรอกเลขที่ใบสั่งซื้อ หรือชื่อผู้สั่ง..."
          className="w-full px-6 py-4 bg-white border-2 border-gray-50 rounded-2xl shadow-lg shadow-gray-100 focus:border-green-500 outline-none transition-all"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
      </div>

      <div className="space-y-6 px-2">
        {searchQuery.trim() === '' ? (
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 text-center">
            <p className="text-blue-700 font-bold text-sm">💡 ใส่เลขที่ใบสั่งซื้อ (Bill ID)</p>
            <p className="text-blue-600/70 text-xs">ข้อมูลจะถูกดึงจากฐานข้อมูล Google Cloud ของคุณ</p>
          </div>
        ) : groupedOrders.length > 0 ? (
          groupedOrders.map(([billId, items]) => {
            const firstItem = items[0];
            const status = getStatusDisplay(firstItem.status);
            return (
              <div key={billId} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 bg-gray-50/50 border-b flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">เลขที่ใบสั่งซื้อ (BILL ID)</div>
                    <div className="font-mono font-bold text-gray-900 text-lg">{billId}</div>
                    <div className="text-xs text-gray-500 mt-1">โดย {firstItem.userName} ({firstItem.department})</div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color} border shadow-sm`}>
                    {status.label}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-start gap-4 bg-white p-3 rounded-2xl border border-gray-50">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {item.imageAttachment ? (
                          <img src={item.imageAttachment} className="w-full h-full object-cover" alt="product" />
                        ) : (
                          <span className="text-xl">{item.isGreen ? '🌱' : '📦'}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold text-gray-800">{item.productName}</h4>
                        <p className="text-[10px] text-gray-500">{item.quantity} {item.unit} | {item.description || 'ไม่มีสเปคเพิ่มเติม'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
            <div className="text-4xl mb-4 grayscale opacity-20">🕵️‍♂️</div>
            <h3 className="text-lg font-bold text-gray-400">ไม่พบข้อมูลใน Google Sheets</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderView;
