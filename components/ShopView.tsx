import React, { useState, useEffect } from 'react';
import { OrderItem, OrderStatus, GreenLabel } from '../types';

interface ShopViewProps {
  onCreateOrder: (orders: OrderItem[]) => void;
  onAddToCart?: (item: OrderItem) => void;
}

const DEPARTMENTS = [
  'โปรดเลือกแผนก/ฝ่าย',
  'ผู้บริหาร',
  'งานบริหารงานทั่วไป',
  'งานทรัพยากรสารสนเทศ',
  'งานบริการสารสนเทศและส่งเสริมการเรียนรู้',
  'งานเทคโนโลยีสารสนเทศ'
];

const ShopView: React.FC<ShopViewProps> = ({ onCreateOrder, onAddToCart }) => {
  // --- ส่วนที่แก้ไข: ดึงค่าจาก LocalStorage มาเป็นค่าเริ่มต้น ---
  const [userName, setUserName] = useState(localStorage.getItem('greenbuild_user_name') || '');
  const [department, setDepartment] = useState(localStorage.getItem('greenbuild_department') || DEPARTMENTS[0]);

  // Form State
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

  // --- ส่วนที่แก้ไข: บันทึกชื่อ/แผนก ทุกครั้งที่เปลี่ยน ---
  useEffect(() => {
    localStorage.setItem('greenbuild_user_name', userName);
    localStorage.setItem('greenbuild_department', department);
  }, [userName, department]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateSubmit = (e: React.FormEvent, type: 'DIRECT' | 'CART') => {
    e.preventDefault();
    if (department === DEPARTMENTS[0]) {
      alert('กรุณาเลือกแผนก / ฝ่าย');
      return;
    }
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
    
    // --- ส่วนที่แก้ไข: เปลี่ยนชื่อ Key ให้ตรงกับ Google Sheets (name, amount) ---
    const newItem: any = {
      id: `ORD-${Date.now()}`,
      productId: 'MANUAL-ENTRY',
      name: productName.trim(), // ส่งไปที่คอลัมน์ name ใน Sheets
      amount: Number(quantity),  // ส่งไปที่คอลัมน์ amount ใน Sheets
      unit: unit.trim(),
      isGreen,
      greenLabel: isGreen ? greenLabel : undefined,
      imageAttachment: image || undefined,
      requestedAt: new Date().toISOString(),
      status: OrderStatus.PENDING,
      userId: department, 
      userName: userName.trim(),
      department: department,
      category: isGreen ? 'GREEN' : 'NORMAL'
    };

    setTimeout(() => {
      if (submitType === 'DIRECT') {
        onCreateOrder([newItem]);
      } else if (onAddToCart) {
        onAddToCart(newItem);
      }
      
      setProductName('');
      setDescription('');
      setQuantity(1);
      setUnit('');
      setIsGreen(false);
      setImage(null);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">แบบฟอร์มขอจัดซื้อวัสดุสำนักงาน</h1>
        <p className="text-gray-500">กรุณากรอกรายละเอียดผู้สั่งซื้อและวัสดุที่ต้องการ</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        <form className="p-8 space-y-8">
          
          {/* User Info Section */}
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
                  placeholder="กรอกชื่อของคุณ"
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
                  {DEPARTMENTS.map((dept, index) => (
                    <option key={dept} value={dept} disabled={index === 0}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Item Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xl">📦</span>
              <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">รายละเอียดรายการวัสดุ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อวัสดุ / รายการสินค้า *</label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="เช่น กระดาษ A4, ปากกาเคมี, หมึกพิมพ์..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวน *</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">หน่วยนับ *</label>
                <input 
                  type="text" 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="เช่น รีม, กล่อง, ชุด..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
                  required
                />
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

          {/* Sustainability Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xl">🌱</span>
              <h2 className="font-bold text-gray-800 uppercase tracking-wider text-sm">ความยั่งยืน</h2>
            </div>

            <div className={`p-6 rounded-2xl border-2 transition-all ${isGreen ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-transparent'}`}>
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative flex items-center h-5">
                  <input 
                    type="checkbox" 
                    checked={isGreen}
                    onChange={(e) => setIsGreen(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-gray-300 text-green-600 focus:ring-green-500 accent-green-600 cursor-pointer"
                  />
                </div>
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
          <button 
            type="button"
            onClick={(e) => handleInitiateSubmit(e, 'CART')}
            disabled={isSubmitting}
            className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${
              isSubmitting ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-orange-600 border-orange-500 hover:bg-orange-50 active:scale-[0.98]'
            }`}
          >
            <span>🛒</span> เพิ่มลงตะกร้า
          </button>
          
          <button 
            type="button"
            onClick={(e) => handleInitiateSubmit(e, 'DIRECT')}
            disabled={isSubmitting}
            className={`flex-[1.5] py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
              isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอจัดซื้อทันที'}
          </button>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="text-4xl mx-auto mb-2">📋</div>
              <h3 className="text-2xl font-bold text-gray-900">ยืนยันข้อมูลจัดซื้อ</h3>
              
              <div className="bg-gray-50 p-4 rounded-2xl text-left border border-gray-100 mt-4 space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ผู้สั่ง / แผนก</div>
                  <div className="font-bold text-gray-800">{userName}</div>
                  <div className="text-xs text-blue-600 font-medium">{department}</div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">รายการ</div>
                  <div className="font-bold text-gray-800">{productName}</div>
                  <div className="text-sm text-gray-600">จำนวน {quantity} {unit}</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleFinalSubmit}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg"
              >
                ยืนยันข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopView;
