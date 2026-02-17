
import React from 'react';
import { OrderItem } from '../types';

interface CartViewProps {
  cartItems: OrderItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const CartView: React.FC<CartViewProps> = ({ cartItems, onRemoveItem, onCheckout, onContinueShopping }) => {
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-6xl mb-6 grayscale opacity-40">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-gray-800">ตะกร้าว่างเปล่า</h2>
        <p className="text-gray-500 mt-2 mb-8 max-w-xs text-center">
          ดูเหมือนว่าคุณจะยังไม่มีรายการในตะกร้า เริ่มเลือกวัสดุที่คุณต้องการได้เลย
        </p>
        <button 
          onClick={onContinueShopping}
          className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
        >
          ไปที่หน้าแรก
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ตะกร้าของคุณ ({cartItems.length})</h1>
        <button 
          onClick={onContinueShopping}
          className="text-green-600 font-semibold hover:underline"
        >
          + เพิ่มรายการอื่น
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 group">
              <div className={`w-16 h-16 rounded-xl shrink-0 flex items-center justify-center text-2xl ${item.isGreen ? 'bg-green-100' : 'bg-gray-100'}`}>
                {item.isGreen ? '🌱' : '📦'}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.productName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      จำนวน: <span className="font-semibold text-gray-700">{item.quantity}</span>
                    </p>
                    {item.isGreen && (
                      <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase">
                        {item.greenLabel}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="ลบรายการ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">สรุปคำสั่งซื้อ</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>รายการทั้งหมด</span>
                <span className="font-semibold">{cartItems.length} รายการ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>วัสดุกรีน</span>
                <span className="font-semibold text-green-600">{cartItems.filter(i => i.isGreen).length} รายการ</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="font-bold text-gray-900">ยอดรวมเบื้องต้น</span>
                <span className="text-xs text-gray-400 font-medium">รอแอดมินยืนยันราคา</span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-[0.98]"
            >
              สั่งซื้อทั้งหมด ({cartItems.length})
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
              * ข้อมูลจะถูกบันทึกลงในระบบจัดซื้อกลางเพื่อรอแอดมินดำเนินการตรวจสอบและแจ้งราคาในภายหลัง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
