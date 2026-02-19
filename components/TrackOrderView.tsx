
import React, { useState, useMemo } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface TrackOrderViewProps {
  orders: OrderItem[];
}

const TrackOrderView: React.FC<TrackOrderViewProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // จัดกลุ่มข้อมูลตาม billId
  const groupedOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    // ค้นหาก่อนว่ามีออเดอร์ไหนเข้าข่ายบ้าง
    const matchedItems = orders.filter(order => 
      order.billId.toLowerCase().includes(query) || 
      order.userName.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query)
    );

    // นำเลข billId ทั้งหมดที่เจอ มาหาเพื่อนร่วมบิล (เพื่อให้แสดงครบทุกรายการในบิลนั้น)
    const billIds = Array.from(new Set(matchedItems.map(item => item.billId)));
    const allItemsInBills = orders.filter(order => billIds.includes(order.billId));

    // จัดกลุ่มเข้าด้วยกัน
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
      case OrderStatus.APPROVED: return { label: 'อนุมัติแล้ว', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
      case OrderStatus.REJECTED: return { label: 'ปฏิเสธคำขอ', color: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500' };
      case OrderStatus.SHIPPED: return { label: 'จัดส่งแล้ว', color: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-500' };
      default: return { label: 'รอตรวจสอบ', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">ค้นหาและติดตามสถานะ</h1>
        <p className="text-gray-500 text-sm px-4">ตรวจสอบความคืบหน้าด้วยเลขที่ใบสั่งซื้อ (BILL-xxx) หรือชื่อผู้สั่ง</p>
      </div>

      <div className="relative group px-2">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="กรอกเลขที่ใบสั่งซื้อ หรือชื่อผู้สั่ง..."
          className="w-full px-6 py-4 bg-white border-2 border-gray-50 rounded-2xl shadow-lg shadow-gray-100 focus:border-green-500 outline-none transition-all text-base md:text-lg"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
      </div>

      <div className="space-y-6 px-2">
        {searchQuery.trim() === '' ? (
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 text-center">
            <p className="text-blue-700 font-bold text-sm">💡 ใส่เลขที่ใบสั่งซื้อ (Bill ID)</p>
            <p className="text-blue-600/70 text-xs">เพื่อดูรายการวัสดุทั้งหมดที่คุณสั่งในบิลนั้น</p>
          </div>
        ) : groupedOrders.length > 0 ? (
          groupedOrders.map(([billId, items]) => {
            const firstItem = items[0];
            const status = getStatusDisplay(firstItem.status);
            const totalItems = items.length;
            const totalPrice = items.reduce((sum, i) => sum + (i.finalPrice || 0), 0);

            return (
              <div key={billId} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group">
                {/* Header Bill */}
                <div className="p-6 bg-gray-50/50 border-b flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">เลขที่ใบสั่งซื้อ (BILL ID)</div>
                    <div className="font-mono font-bold text-gray-900 text-lg">{billId}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      สั่งเมื่อ: {new Date(firstItem.requestedAt).toLocaleDateString('th-TH')} โดย {firstItem.userName}
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color} border shadow-sm`}>
                    {status.label}
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 space-y-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">รายการวัสดุ ({totalItems})</div>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-50">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                          {item.isGreen ? '🌱' : '📦'}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-gray-800">{item.productName}</h4>
                          <p className="text-[10px] text-gray-500">จำนวน {item.quantity} {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-600">
                            {item.finalPrice ? `฿${item.finalPrice.toLocaleString()}` : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Bill Detail */}
                  <div className="mt-6 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                       <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">{firstItem.department}</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">ราคาสรุปทั้งบิล</span>
                       <span className="text-2xl font-bold text-emerald-600">
                         {totalPrice > 0 ? `฿${totalPrice.toLocaleString()}` : 'รอยืนยันราคา'}
                       </span>
                    </div>
                  </div>

                  {firstItem.adminComment && (
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mt-4">
                      <span className="text-[9px] font-bold text-indigo-600 block uppercase mb-1">ข้อความจากแอดมิน</span>
                      <p className="text-xs text-indigo-900 leading-relaxed">{firstItem.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
            <div className="text-4xl mb-4 grayscale opacity-20">🕵️‍♂️</div>
            <h3 className="text-lg font-bold text-gray-400">ไม่พบเลขที่ใบสั่งซื้อหรือชื่อนี้</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderView;
