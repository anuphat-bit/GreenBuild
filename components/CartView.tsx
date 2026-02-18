import React from 'react';
import { OrderItem } from '../types';

interface CartViewProps {
  items: OrderItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartView: React.FC<CartViewProps> = ({ items, onRemove, onCheckout }) => {
  // คำนวณจำนวนรายการทั้งหมด
  const totalItems = items.length;
  // กรองรายการที่เป็นวัสดุรักษ์โลก
  const greenItemsCount = items.filter(item => item.isGreen).length;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800">ตะกร้าของคุณยังว่างอยู่</h2>
        <p className="mt-2 text-gray-400">เลือกวัสดุที่คุณต้องการสั่งซื้อจากหน้าหลักได้เลย</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-800">ตะกร้าของคุณ ({totalItems})</h1>
        <button 
          onClick={() => window.location.reload()} // หรือใช้ navigation เพื่อกลับหน้า Shop
          className="text-sm text-green-600 font-bold hover:underline"
        >
          + เพิ่มรายการอื่น
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* รายการสินค้าในตะกร้า */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow"
            >
              {/* รูปภาพจำลอง */}
              <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl">
                📦
              </div>

              {/* รายละเอียดสินค้า */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    {/* ใช้ item.name แทน productName */}
                    <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      จำนวน: <span className="font-bold text-gray-800">{item.amount}</span> {item.unit}
                    </p>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="ลบรายการ"
                  >
                    🗑️
                  </button>
                </div>
                
                {item.isGreen && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-wider">
                    🌱 Green Choice
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ส่วนสรุปคำสั่งซื้อ */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">สรุปคำสั่งซื้อ</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-500 text-sm">
                <span>รายการทั้งหมด</span>
                <span className="font-bold text-gray-800">{totalItems} รายการ</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm">
                <span>วัสดุรักษ์โลก</span>
                <span className="font-bold text-green-600">{greenItemsCount} รายการ</span>
              </div>
              <hr className="border-dashed my-4" />
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-bold">ยอดรวมเบื้องต้น</span>
                <div className="text-right">
                  <div className="text-xs text-gray-400">รอแอดมินยืนยัน</div>
                  <div className="text-xl font-black text-green-600">ราคา</div>
                </div>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-100 hover:bg-green-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              สั่งซื้อทั้งหมด ({totalItems})
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              * ข้อมูลจะถูกบันทึกลงในระบบจัดซื้อกลาง<br />
              เพื่อรอแอดมินดำเนินการตรวจสอบและแจ้งราคาในภายหลัง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
