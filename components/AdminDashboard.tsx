
import React, { useState, useMemo } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface AdminDashboardProps {
  orders: OrderItem[];
  onUpdateOrder: (id: string, updates: Partial<OrderItem>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, onUpdateOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = query === '' || 
        (order.productName || '').toLowerCase().includes(query) || 
        (order.userName || '').toLowerCase().includes(query) ||
        (order.department || '').toLowerCase().includes(query) ||
        (order.id || '').toLowerCase().includes(query) ||
        (order.billId || '').toLowerCase().includes(query);
      
      return matchStatus && matchSearch;
    }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [orders, statusFilter, searchQuery]);

  const handleProcessOrder = (order: OrderItem) => {
    setSelectedOrder(order);
    setFinalPrice(order.finalPrice?.toString() || '');
    setComment(order.adminComment || '');
  };

  const handleUpdate = (status: OrderStatus) => {
    if (!selectedOrder) return;
    onUpdateOrder(selectedOrder.id, {
      status,
      finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
      adminComment: comment
    });
    setSelectedOrder(null);
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.APPROVED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case OrderStatus.REJECTED: return 'bg-rose-50 text-rose-700 border-rose-100';
      case OrderStatus.SHIPPED: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">📑</div>
        <h2 className="text-xl font-bold text-gray-800">ยังไม่มีรายการคำสั่งซื้อในระบบ</h2>
        <p className="text-sm">ข้อมูลจะถูกเก็บไว้เฉพาะใน Browser นี้เท่านั้น</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl font-bold text-gray-800">จัดการคำสั่งซื้อ</h1>
        <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
          ทั้งหมด: {orders.length} รายการ
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-4 mx-2 md:mx-0">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อผู้สั่ง, เลขที่ใบสั่งซื้อ (BILL-xxx) หรือวัสดุ..."
          className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
            className="flex-1 border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value={OrderStatus.PENDING}>รออนุมัติ</option>
            <option value={OrderStatus.APPROVED}>อนุมัติแล้ว</option>
            <option value={OrderStatus.SHIPPED}>ส่งแล้ว</option>
            <option value={OrderStatus.REJECTED}>ปฏิเสธ</option>
          </select>
          <button onClick={() => {setStatusFilter('ALL'); setSearchQuery('');}} className="px-4 py-2 text-blue-600 text-xs font-bold hover:bg-blue-50 rounded-xl transition-colors">ล้างค่า</button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-4">ผู้สั่งซื้อ & แผนก</th>
              <th className="px-6 py-4">รายการวัสดุ</th>
              <th className="px-6 py-4">จำนวน</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{order.userName}</div>
                  <div className="text-[10px] text-gray-400 font-mono">BILL: {order.billId}</div>
                  <div className="text-xs text-blue-600">{order.department}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{order.productName}</div>
                  {order.isGreen && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">🌱 GREEN</span>}
                </td>
                <td className="px-6 py-4 font-bold text-gray-600">{order.quantity} {order.unit}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleProcessOrder(order)} className="text-blue-600 font-bold hover:underline">ตรวจสอบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 px-2 pb-10">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-800">{order.userName}</div>
                <div className="text-[10px] text-blue-600 font-medium uppercase">{order.department}</div>
                <div className="text-[9px] text-gray-400 font-mono">BILL: {order.billId}</div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <div className="font-bold text-gray-800 text-lg">{order.productName}</div>
              <div className="text-sm text-gray-600">จำนวน: <span className="font-bold">{order.quantity} {order.unit}</span></div>
            </div>
            <button 
              onClick={() => handleProcessOrder(order)}
              className="w-full py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm mt-2"
            >
              ตรวจสอบรายการ
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h2 className="font-bold text-gray-800">ตรวจสอบคำขอ</h2>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border text-gray-400 hover:text-gray-900 transition-colors">×</button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
              {/* Product Info Section */}
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div>
                     <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">ผู้สั่ง</span>
                     <span className="font-bold text-gray-800">{selectedOrder.userName}</span>
                   </div>
                   <div>
                     <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">แผนก</span>
                     <span className="font-bold text-blue-600">{selectedOrder.department}</span>
                   </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-widest">รายการที่ต้องการ</span>
                  <div className="text-2xl font-bold text-gray-800 mt-1">{selectedOrder.productName}</div>
                  <div className="text-xl font-bold text-green-600">จำนวน: {selectedOrder.quantity} {selectedOrder.unit}</div>
                  
                  {selectedOrder.description && (
                    <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 italic text-sm text-gray-600 leading-relaxed">
                      "{selectedOrder.description}"
                    </div>
                  )}
                </div>
              </div>

              {/* Sustainability Section */}
              {selectedOrder.isGreen && (
                <div className="p-6 rounded-[32px] bg-green-50 border border-green-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <h3 className="font-bold text-green-800">ข้อมูลความยั่งยืน</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-green-100">
                      <span className="text-[10px] font-bold text-green-600 block uppercase tracking-widest">ประเภทการรับรอง</span>
                      <span className="font-bold text-gray-800">{selectedOrder.greenLabel}</span>
                    </div>
                    {selectedOrder.imageAttachment && (
                      <div className="bg-white p-2 rounded-2xl border border-green-100">
                        <img 
                          src={selectedOrder.imageAttachment} 
                          alt="Proof" 
                          className="w-full h-auto max-h-40 object-contain rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">ระบุราคาสรุป (บาท)</label>
                  <input 
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-lg"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2 ml-1">หมายเหตุ/ข้อความถึงผู้สั่ง</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all text-sm"
                    rows={3}
                    placeholder="ระบุเหตุผลการปฏิเสธ หรือข้อมูลการจัดส่ง..."
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-4 border-t shrink-0">
              <button onClick={() => handleUpdate(OrderStatus.REJECTED)} className="flex-1 py-4 bg-white border-2 border-rose-100 text-rose-600 rounded-[20px] font-bold hover:bg-rose-50 transition-all">ปฏิเสธคำขอ</button>
              <button onClick={() => handleUpdate(OrderStatus.APPROVED)} className="flex-[1.5] py-4 bg-emerald-600 text-white rounded-[20px] font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all text-lg">อนุมัติคำขอจัดซื้อ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
