
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
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
      
      const orderDate = new Date(order.requestedAt).getTime();
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      
      const matchStart = start ? orderDate >= start : true;
      const matchEnd = end ? orderDate <= end : true;

      const query = searchQuery.toLowerCase().trim();
      const matchSearch = query === '' || 
        order.productName.toLowerCase().includes(query) || 
        order.userName.toLowerCase().includes(query) ||
        order.department.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query);
      
      return matchStatus && matchStart && matchEnd && matchSearch;
    }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [orders, statusFilter, startDate, endDate, searchQuery]);

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
      case OrderStatus.APPROVED:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case OrderStatus.REJECTED:
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">📑</div>
        <h2 className="text-xl font-bold text-gray-800">ยังไม่มีรายการคำสั่งซื้อ</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 md:px-0">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">จัดการคำสั่งซื้อ</h1>
        <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
          รอจัดการ: {orders.filter(o => o.status === OrderStatus.PENDING).length}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-4">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อผู้สั่ง, แผนก หรือชื่อวัสดุ..."
          className="w-full px-4 py-2.5 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
            className="border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value={OrderStatus.PENDING}>PENDING</option>
            <option value={OrderStatus.APPROVED}>APPROVED</option>
            <option value={OrderStatus.SHIPPED}>SHIPPED</option>
            <option value={OrderStatus.REJECTED}>REJECTED</option>
          </select>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-xl px-3 py-2 text-xs"
          />
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-xl px-3 py-2 text-xs"
          />
          <button onClick={() => {setStatusFilter('ALL'); setSearchQuery(''); setStartDate(''); setEndDate('');}} className="text-blue-600 text-xs font-bold hover:underline">ล้างทั้งหมด</button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-4">ID / วันที่</th>
              <th className="px-6 py-4">ผู้สั่งซื้อ & แผนก</th>
              <th className="px-6 py-4">รายการวัสดุ</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{order.id}</div>
                  <div className="text-[10px] text-gray-400 uppercase">{new Date(order.requestedAt).toLocaleDateString('th-TH')}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">👤 {order.userName}</div>
                  <div className="text-xs text-blue-600 font-medium">🏢 {order.department}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-800">{order.productName}</div>
                  <div className="text-xs text-gray-500">จำนวน: {order.quantity}</div>
                </td>
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

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800">รายละเอียดคำขอจัดซื้อ</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ผู้สั่งซื้อ</label>
                  <p className="font-bold text-gray-800">👤 {selectedOrder.userName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">แผนก/ฝ่าย</label>
                  <p className="font-bold text-blue-600">🏢 {selectedOrder.department}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-2xl border">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">วัสดุที่ต้องการ</label>
                <div className="text-xl font-bold text-gray-800">{selectedOrder.productName}</div>
                <div className="text-sm text-gray-600">จำนวนที่ขอ: {selectedOrder.quantity}</div>
                {selectedOrder.isGreen && (
                  <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                    🌱 {selectedOrder.greenLabel}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">ราคาสรุป (บาท)</label>
                  <input 
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ระบุราคาสุทธิ..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">หมายเหตุ</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="ข้อความถึงผู้สั่ง..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => handleUpdate(OrderStatus.REJECTED)} className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold border border-rose-100">ไม่อนุมัติ</button>
                <button onClick={() => handleUpdate(OrderStatus.APPROVED)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg">อนุมัติคำขอ</button>
              </div>
              <button onClick={() => handleUpdate(OrderStatus.SHIPPED)} className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold border border-indigo-100">จัดส่งแล้ว</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
