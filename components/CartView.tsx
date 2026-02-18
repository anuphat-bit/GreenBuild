import React from 'react';
import { OrderItem } from '../types';

interface CartViewProps {
  items: OrderItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartView: React.FC<CartViewProps> = ({ items, onRemove, onCheckout }) => {
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-gray-800">ไม่มีสินค้าในตะกร้า</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold mb-4">ตะกร้าของคุณ</h2>
        {items.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${item.isGreen ? 'bg-green-50' : 'bg-gray-50'}`}>
              {item.isGreen ? '🌱' : '📦'}
            </div>
            <div className="flex-1">
              {/* ตรวจสอบว่าใช้ item.name และ item.amount */}
              <h3 className="font-bold text-gray-800 text-lg">
                {item.name || "ไม่ระบุชื่อสินค้า"}
              </h3>
              <p className="text-sm text-gray-500">
                จำนวน: <span className="font-bold text-gray-700">{item.amount || 0}</span> {item.unit || 'หน่วย'}
              </p>
              <div className="text-[10px] text-blue-500 mt-1 uppercase font-medium">
                {item.department}
              </div>
            </div>
            <button onClick={() => onRemove(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">🗑️</button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl h-fit">
        <h3 className="text-lg font-bold mb-4">สรุปการสั่งซื้อ</h3>
        <div className="flex justify-between mb-6">
          <span className="text-gray-500">รายการทั้งหมด</span>
          <span className="font-bold">{items.length} รายการ</span>
        </div>
        <button onClick={onCheckout} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all">
          ยืนยันการสั่งซื้อ
        </button>
      </div>
    </div>
  );
};

export default CartView;
