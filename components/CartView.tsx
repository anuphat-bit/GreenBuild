import React from 'react';
import { OrderItem } from '../types';

interface CartViewProps {
  items: OrderItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartView: React.FC<CartViewProps> = ({ items, onRemove, onCheckout }) => {
  const totalItems = items.length;
  const greenItems = items.filter(i => i.isGreen).length;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800">ตะกร้าของคุณว่างเปล่า</h2>
        <p className="text-gray-500 mt-2">ไปเลือกวัสดุที่ต้องการได้ที่หน้าหลักครับ</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">ตะกร้าของคุณ ({totalItems})</h2>
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${item.isGreen ? 'bg-green-50' : 'bg-gray-50'}`}>
              {item.isGreen ? '🌱' : '📦'}
            </div>
            <div className="flex-1">
              {/* จุดแก้ไขสำคัญ: ต้องใช้ item.name ให้ตรงกับที่ส่งมาจาก ShopView */}
              <h3 className="font-bold text-gray-800">{item.name || 'ไม่ได้ระบุชื่อสินค้า'}</h3>
              <p className="text-sm text-gray-500">จำนวน: {item.amount} {item.unit}</p>
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg h-fit sticky top-24">
        <h3 className="text-xl font-bold text-gray-900 mb-4">สรุปคำสั่งซื้อ</h3>
        <div className="space-y-3 border-b pb-4 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">รายการทั้งหมด</span>
            <span className="font-bold">{totalItems} รายการ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">วัสดุกรีน</span>
            <span className="font-bold text-green-600">{greenItems} รายการ</span>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-end mb-1">
            <span className="font-bold text-gray-800">ยอดรวมเบื้องต้น</span>
            <span className="text-xs text-gray-400 font-medium">รอแอดมินยืนยันราคา</span>
          </div>
        </div>
        <button 
          onClick={onCheckout}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all"
        >
          สั่งซื้อทั้งหมด ({totalItems})
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-tighter">
          * ข้อมูลจะถูกบันทึกลงในระบบจัดซื้อกลาง
        </p>
      </div>
    </div>
  );
};

export default CartView;
