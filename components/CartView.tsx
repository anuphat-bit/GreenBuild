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
  const [animateTotal, setAnimateTotal] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      setAnimateTotal(true);
      const timer = setTimeout(() => setAnimateTotal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItems.length]);

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

  // --- จอแสดงผลเมื่อสั่งซื้อสำเร็จ ---
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

  // --- จอแสดงผลเมื่อตะกร้าว่าง ---
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 px-4">
      <h1 className="text-3xl font-bold text-gray-900">ตะกร้าของคุณ ({cartItems.length})</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* รายการสินค้าในตะกร้า */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 transition-all duration-300 ${
                removingItems.includes(item.id) ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'
              }`}
            >
              {/* ส่วนรูปภาพสินค้า */}
              <div className="w-20 h-20 rounded-xl shrink-0 flex items-center justify-center text-3xl bg-gray-50 overflow-hidden border border-gray-100 shadow-inner">
                {item.imageAttachment ? (
                  <img src={item.imageAttachment} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <span role="img" aria-label="product">
                    {item.isGreen ? '🌱' : '📦'}
                  </span>
                )}
              </div>

              {/* ส่วนข้อมูลสินค้า (จุดที่แก้ไขหลัก) */}
              <div className="flex-1 min-w-0"> 
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-gray-900 text-lg truncate">
                    {item.productName || "ไม่มีชื่อสินค้า"} 
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                      จำนวน: <span className="font-bold text-green-700">{item.quantity || 0}</span> {item.unit || 'หน่วย'}
                    </p>
                    
                    {item.isGreen && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        <span>✨</span> GREEN LABEL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ปุ่มลบรายการ */}
              <div className="shrink-0">
                <button 
                  onClick={() => handleRemoveClick(item.id)} 
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all group"
                  title="ลบรายการ"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform inline-block">🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ส่วนสรุปคำสั่งซื้อ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">สรุปคำสั่งซื้อ</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-gray-500">
                <span>รายการทั้งหมด</span>
                <span className={`font-bold transition-all duration-300 ${animateTotal ? 'text-green-600 scale-110' : 'text-gray-900'}`}>
                  {cartItems.length} รายการ
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>วัสดุรักษ์โลก</span>
                <span className="font-bold text-green-600">
                  {cartItems.filter(i => i.isGreen).length} รายการ
                </span>
              </div>
              <div className="pt-4 border-t border-dashed">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">ยอดรวมเบื้องต้น</span>
                  <span className="text-xs text-gray-400 font-medium">รอแอดมินยืนยันราคา</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowConfirm(true)} 
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 shadow-xl shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>สั่งซื้อทั้งหมด ({cartItems.length})</span>
            </button>
            <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
              * ข้อมูลจะถูกบันทึกในระบบจัดซื้อกลาง<br/>เพื่อให้แอดมินดำเนินการตรวจสอบและแจ้งราคาในภายหลัง
            </p>
          </div>
        </div>
      </div>

      {/* Modal ยืนยันการสั่งซื้อ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="text-4xl mx-auto mb-2">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900">ยืนยันการส่งคำขอ?</h3>
              <p className="text-gray-500 text-sm">รายการทั้งหมดจะถูกรวมในใบสั่งซื้อเลขที่เดียวกันเพื่อให้ง่ายต่อการติดตาม</p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3 border-t">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">แก้ไขข้อมูล</button>
              <button onClick={handleCheckoutProcess} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all">ส่งคำขอทันที</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
