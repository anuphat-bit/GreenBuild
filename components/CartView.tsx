
import React, { useState } from 'react';
import { OrderItem, ViewType } from '../types';

interface CartViewProps {
  cartItems: OrderItem[];
  onRemoveItem: (id: string) => void;
  // Change onCheckout to return a Promise to match the handleCheckout function in App.tsx
  onCheckout: () => Promise<string | undefined>;
  onContinueShopping: () => void;
  onNavigate?: (view: ViewType) => void;
}

const CartView: React.FC<CartViewProps> = ({ cartItems, onRemoveItem, onCheckout, onContinueShopping, onNavigate }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [successBillId, setSuccessBillId] = useState<string | null>(null);
  const [successItemCount, setSuccessItemCount] = useState(0);

  // Update handleCheckoutProcess to be async and await the onCheckout call
  const handleCheckoutProcess = async () => {
    const itemCount = cartItems.length;
    const billId = await onCheckout();
    if (billId) {
      setSuccessBillId(billId);
      setSuccessItemCount(itemCount);
      setShowConfirm(false);
    }
  };

  if (successBillId) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[40px] shadow-2xl border border-green-50 overflow-hidden text-center p-10 space-y-8">
           <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-5xl mx-auto">🎉</div>
           <div className="space-y-2">
             <h1 className="text-3xl font-bold text-gray-900">สั่งซื้อสำเร็จ!</h1>
             <p className="text-gray-500">สร้างใบสั่งซื้อสำหรับวัสดุ {successItemCount} รายการเรียบร้อยแล้ว</p>
           </div>

           <div className="bg-green-50 p-8 rounded-[32px] border-2 border-green-200 text-center space-y-3">
             <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest block">เลขที่ใบสั่งซื้อของคุณ (Bill ID)</span>
             <div className="text-4xl font-mono text-gray-900 font-bold tracking-widest">{successBillId}</div>
             <p className="text-[10px] text-gray-400 font-medium">ใช้เลขนี้เพียงเลขเดียวเพื่อติดตามสถานะของทั้ง {successItemCount} รายการ</p>
           </div>

           <div className="pt-4 flex flex-col gap-3">
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(successBillId);
                 if (onNavigate) onNavigate('USER_TRACK');
               }}
               className="w-full py-5 bg-green-600 text-white rounded-[24px] font-bold shadow-xl hover:bg-green-700 transition-all text-lg"
             >
               คัดลอกเลขและไปติดตามสถานะ
             </button>
             <button onClick={onContinueShopping} className="w-full py-4 bg-white text-gray-400 rounded-[20px] font-bold hover:bg-gray-50 transition-all">กลับไปหน้าสั่งของ</button>
           </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500 animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-6xl mb-6 grayscale opacity-40">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800">ตะกร้าว่างเปล่า</h2>
        <button onClick={onContinueShopping} className="mt-8 bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 shadow-lg">กลับไปเลือกซื้อวัสดุ</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-2">
      <h1 className="text-3xl font-bold text-gray-900">ตะกร้าของคุณ ({cartItems.length})</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4">
              <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-2xl bg-gray-50">{item.isGreen ? '🌱' : '📦'}</div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{item.productName}</h3>
                    <p className="text-sm text-gray-500">จำนวน: <span className="font-bold text-gray-800">{item.quantity} {item.unit}</span></p>
                  </div>
                  <button onClick={() => onRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">ลบ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">สรุปคำสั่งซื้อ</h2>
            <div className="flex justify-between mb-8">
              <span className="text-gray-500">จำนวนทั้งหมด</span>
              <span className="font-bold">{cartItems.length} รายการ</span>
            </div>
            <button onClick={() => setShowConfirm(true)} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 shadow-lg transition-all">ยืนยันการสั่งซื้อ</button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="text-4xl mx-auto mb-2">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900">ยืนยันการส่งคำขอ?</h3>
              <p className="text-gray-500 text-sm">รายการทั้งหมดจะถูกรวมในใบสั่งซื้อเลขที่เดียวกัน</p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3 border-t">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-white border font-bold rounded-xl">แก้ไขข้อมูล</button>
              <button onClick={handleCheckoutProcess} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg">ส่งคำขอทันที</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
