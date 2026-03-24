import React, { useState } from 'react';
import { OrderItem, OrderStatus, GreenLabel, ViewType } from '../types';

interface ShopViewProps {
  onCreateOrder: (orders: OrderItem[]) => void;
  onAddToCart?: (item: OrderItem) => void;
  onNavigate?: (view: ViewType) => void;
}

const DEPARTMENTS = [
  'โปรดเลือกแผนก/ฝ่าย',
  'ผู้บริหาร',
  'งานบริหารงานทั่วไป',
  'งานทรัพยากรสารสนเทศ',
  'งานบริการสารสนเทศและส่งเสริมการเรียนรู้',
  'งานเทคโนโลยีสารสนเทศ'
];

const ShopView: React.FC<ShopViewProps> = ({ onCreateOrder, onAddToCart, onNavigate }) => {
  // --- States ---
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unit, setUnit] = useState('');
  const [isGreen, setIsGreen] = useState(false);
  const [greenLabel, setGreenLabel] = useState<GreenLabel>(GreenLabel.GREEN_LABEL);
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitType, setSubmitType] = useState<'DIRECT' | 'CART'>('DIRECT');
  const [lastGeneratedId, setLastGeneratedId] = useState<string | null>(null);

  // --- ฟังก์ชันล้างข้อมูลในฟอร์มทั้งหมด (จุดที่แก้ไข) ---
  const resetForm = () => {
    setUserName(''); // ล้างชื่อผู้สั่ง
    setDepartment(DEPARTMENTS[0]); // ล้างแผนกกลับเป็นค่าเริ่มต้น
    setProductName('');
    setDescription('');
    setQuantity(1);
    setUnit('');
    setIsGreen(false);
    setImage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateSubmit = (e: React.FormEvent, type: 'DIRECT' | 'CART') => {
    e.preventDefault();
    if (department === DEPARTMENTS[0]) { alert('กรุณาเลือกแผนก / ฝ่าย'); return; }
    if (!userName.trim() || !productName.trim() || !quantity || !unit.trim()) { 
      alert('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน'); 
      return; 
    }
    setSubmitType(type);
    setShowConfirm(true);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setShowConfirm(false);
    
    const timestamp = Date.now();
    const newId = `ITEM-${timestamp}`;
    const billId = `BILL-${timestamp}`;
    
    const newItem: OrderItem = {
      id: newId,
      billId: billId,
      productId: 'MANUAL-ENTRY',
      productName: productName.trim(),
      description: description.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      isGreen,
      greenLabel: isGreen ? greenLabel : undefined,
      imageAttachment: image || undefined,
      requestedAt: new Date().toISOString(),
      status: OrderStatus.PENDING,
      userId: 'U001',
      userName: userName.trim(),
      department: department
    };

    setTimeout(() => {
      if (submitType === 'DIRECT') {
        onCreateOrder([newItem]);
        setLastGeneratedId(billId);
        resetForm(); // เรียกใช้ฟังก์ชันล้างข้อมูลทั้งหมดที่นี่
      } else if (onAddToCart) {
        onAddToCart(newItem);
        resetForm(); // เรียกใช้ฟังก์ชันล้างข้อมูลทั้งหมดที่นี่
        alert('เพิ่มลงตะกร้าเรียบร้อยแล้ว');
      }
      setIsSubmitting(false);
    }, 800);
  };

  const copyAndGo = () => {
    if (lastGeneratedId) {
      navigator.clipboard.writeText(lastGeneratedId);
      if (onNavigate) onNavigate('USER_TRACK');
      setLastGeneratedId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">แบบฟอร์มขอจัดซื้อวัสดุสำนักงาน</h1>
        <p className="text-gray-500">กรุณากรอกรายละเอียดผู้สั่งซื้อและวัสดุที่ต้องการ</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        {/* เพิ่ม autoComplete="off" เพื่อป้องกัน Browser จำค่าเก่ามาเติมเอง */}
        <form className="p-8 space-y-8" autoComplete="off">
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xl">👤</span>
              <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">ข้อมูลผู้สั่งซื้อ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ-นามสกุล ผู้สั่งซื้อ *</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">แผนก / ฝ่าย *</label>
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all cursor-pointer ${department === DEPARTMENTS[0] ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}`} 
                  required 
                >
                  {DEPARTMENTS.map((dept, index) => <option key={dept} value={dept} disabled={index === 0}>{dept}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xl">📦</span>
              <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">รายละเอียดรายการวัสดุ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อวัสดุ / รายการสินค้า *</label>
                <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="เช่น กระดาษ A4, ปากกาเคมี, หมึกพิมพ์..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวน *</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">หน่วยนับ *</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="เช่น รีม, กล่อง, ชุด..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">สเปคเพิ่มเติม</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="สี, ยี่ห้อ, หรือขนาด..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all resize-none"
                  rows={2}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xl">🌱</span>
              <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">ความยั่งยืน</h2>
            </div>
            <div className={`p-6 rounded-2xl border-2 transition-all ${isGreen ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}>
              <label className="flex items-start gap-4 cursor-pointer">
                <input type="checkbox" checked={isGreen} onChange={(e) => setIsGreen(e.target.checked)} className="w-6 h-6 rounded-lg border-gray-300 text-green-600 focus:ring-green-500 accent-green-600 cursor-pointer" />
                <div className="flex-grow">
                  <span className="block font-bold text-gray-800 text-lg">เป็นวัสดุรักษ์โลก (Green Material)</span>
                  <p className="text-sm text-gray-500">เลือกข้อนี้หากวัสดุมีฉลากเขียว หรือทำจากวัสดุรีไซเคิล</p>
                </div>
              </label>

              {isGreen && (
                <div className="mt-6 pt-6 border-t border-green-100 space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">ประเภทการรับรอง</label>
                    <select 
                      value={greenLabel}
                      onChange={(e) => setGreenLabel(e.target.value as GreenLabel)}
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-sm"
                    >
                      {Object.values(GreenLabel).map(label => (
                        <option key={label} value={label}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-800 mb-2">แนบภาพประกอบ (ถ้ามี)</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-2xl p-6 bg-white/50 hover:bg-white transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {image ? (
                        <div className="w-full">
                          <img src={image} alt="Preview" className="max-h-40 mx-auto rounded-xl object-contain shadow-sm" />
                          <p className="text-center text-xs text-green-600 mt-2">คลิกเพื่อเปลี่ยนรูป</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-3xl mb-1">📷</div>
                          <p className="text-sm font-semibold text-green-700">อัปโหลดรูปภาพ</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </form>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row gap-4">
          <button type="button" onClick={(e) => handleInitiateSubmit(e, 'CART')} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl font-bold transition-all bg-white text-orange-600 border-2 border-orange-500 hover:bg-orange-50 active:scale-[0.98]"><span>🛒</span> เพิ่มลงตะกร้า</button>
          <button type="button" onClick={(e) => handleInitiateSubmit(e, 'DIRECT')} disabled={isSubmitting} className="flex-[1.5] py-4 rounded-2xl font-bold text-white shadow-xl bg-green-600 hover:bg-green-700 active:scale-[0.99]">{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอจัดซื้อทันที'}</button>
        </div>
      </div>
      
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="text-4xl mx-auto mb-2">📋</div>
              <h3 className="text-2xl font-bold text-gray-900">ยืนยันข้อมูลจัดซื้อ</h3>
              <div className="bg-gray-50 p-4 rounded-2xl text-left border border-gray-100 mt-4 space-y-3">
                <div className="font-bold text-gray-800">{userName} ({department})</div>
                <div className="pt-2 border-t font-bold text-gray-800">{productName} - {quantity} {unit}</div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3 border-t">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-white border font-bold rounded-xl">ยกเลิก</button>
              <button onClick={handleFinalSubmit} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg">ยืนยันส่งข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {lastGeneratedId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="p-10 text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto animate-bounce">✅</div>
              <h3 className="text-3xl font-bold text-gray-900">สั่งซื้อสำเร็จ!</h3>
              <div className="bg-green-50 p-8 rounded-[32px] border-2 border-green-200">
                <div className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em] mb-2">เลขที่ใบสั่งซื้อ (จดไว้ติดตามสถานะ)</div>
                <div className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{lastGeneratedId}</div>
              </div>
              <div className="pt-4 space-y-4">
                <button onClick={copyAndGo} className="w-full py-5 bg-green-600 text-white rounded-[24px] font-bold shadow-xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all text-lg">คัดลอกเลขและไปติดตามสถานะ</button>
                <button onClick={() => setLastGeneratedId(null)} className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors">ปิดหน้านี้</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopView;
