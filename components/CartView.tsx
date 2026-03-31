import React, { useState, useEffect } from 'react';
import { OrderItem, ViewType } from '../types';

interface CartViewProps {
  cartItems: OrderItem[];
  onRemoveItem: (id: string) => void;
  onCheckout: () => Promise<string | undefined>;
  onContinueShopping: () => void;
  onNavigate?: (view: ViewType) => void;
}

const CartView: React.FC<CartViewProps> = ({ cartItems, onRemoveItem, onCheckout, onContinueShopping, onNavigate }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [successBillId, setSuccessBillId] = useState<string | null>(null);
  const [successItemCount, setSuccessItemCount] = useState(0);
  const [removingItems, setRemovingItems] = useState<string[]>([]);

  const handleRemoveClick = (id: string) => {
    setRemovingItems(prev => [...prev, id]);
    setTimeout(() => {
      onRemoveItem(id);
      setRemovingItems(prev => prev.filter(itemId => itemId !== id));
    }, 300);
  };

  const handleCheckoutProcess = async () => {
    const itemCount = cartItems.length;
    const billId = await onCheckout();
    if (billId) {
      setSuccessBillId(billId);
      setSuccessItemCount(itemCount);
      setShowConfirm(false);
    }
  };

  if (cartItems.length === 0 && !successBillId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6">🛒</div>
        <h2 className="text-xl font-bold text-gray-800">ตะกร้าของคุณยังว่างอยู่</h2>
        <button onClick={onContinueShopping} className="mt-6 text-green-600 font-bold hover:underline">+ เพิ่มรายการอื่น</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ตะกร้าของคุณ ({cartItems.length})</h1>
        <button onClick={onContinueShopping} className="text-green-600 font-bold flex items-center gap-1 hover:text-green-700 transition-colors">
          <span>+</span> เพิ่มรายการอื่น
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex items-center gap-6 transition-all duration-300 ${
                removingItems.includes(item.id) ? 'opacity-0 scale-95' : 'opacity-100'
              }`}
            >
              {/* Item Icon */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${item.isGreen ? 'bg-green-50' : 'bg-gray-50'}`}>
                {item.imageAttachment ? (
                  <img src={item.imageAttachment} className="w-full h-full object-cover rounded-2xl" alt="" />
                ) : (
                  item.isGreen ? '🌱' : '📦'
                )}
              </div>

              {/* Item Details */}
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-lg">{item.productName || 'ไม่ระบุชื่อสินค้า'}</h3>
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-500 text-sm">จำนวน: <span className="font-medium text-gray-700">{item.quantity} {item.unit}</span></p>
                        {item.isGreen && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold w-fit uppercase tracking-wider">
                                Green Label (ฉลากเขียว)
                            </span>
                        )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveClick(item.id)}
                    className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <span className="text-xl">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-100/50 border border-gray-50 sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">สรุปคำสั่งซื้อ</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>รายการทั้งหมด</span>
                <span className="text-gray-900">{cartItems.length} รายการ</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>วัสดุกรีน</span>
                <span className="text-green-600 font-bold">{cartItems.filter(i => i.isGreen).length} รายการ</span>
              </div>
              <hr className="border-gray-50" />
              <div className="flex justify-between items-start">
                <span className="font-bold text-gray-900">ยอดรวมเบื้องต้น</span>
                <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium leading-tight">รอแอดมินยืนยัน<br/>ราคา</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-[18px] font-bold text-lg shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
            >
              สั่งซื้อทั้งหมด ({cartItems.length})
            </button>
            
            <p className="mt-6 text-[11px] text-gray-400 text-center leading-relaxed">
              * ข้อมูลจะถูกบันทึกในระบบจัดซื้อกลาง เพื่อให้แอดมินดำเนินการตรวจสอบและแจ้งราคาในภายหลัง
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
             <div className="text-center space-y-4">
                <div className="text-4xl">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900">ยืนยันการส่งคำขอ?</h3>
                <p className="text-gray-500">รายการทั้งหมดจะถูกรวมในใบสั่งซื้อเดียวเพื่อให้คุณติดตามสถานะได้ง่ายขึ้น</p>
             </div>
             <div className="flex gap-3 mt-8">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all">แก้ไข</button>
                <button onClick={handleCheckoutProcess} className="flex-1 py-3 bg-[#10b981] text-white font-bold rounded-xl shadow-lg hover:bg-[#059669] transition-all">ส่งคำขอทันที</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
