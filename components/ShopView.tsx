import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface ShopViewProps {
  onAddToCart: (item: OrderItem) => void;
  onCreateOrder: (orders: OrderItem[]) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ onAddToCart, onCreateOrder }) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number>(1); // เพิ่ม state สำหรับจำนวน
  const [unit, setUnit] = useState('ชิ้น');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (type: 'CART' | 'DIRECT') => {
    if (!productName) {
      alert("กรุณาระบุชื่อสินค้า");
      return;
    }

    let uploadedImageUrl = "";
    setIsUploading(true);

    if (imageFile) {
      try {
        // ใช้โหมด no-cors เพื่อเลี่ยงปัญหาความปลอดภัยเบื้องต้น หรือตรวจสอบ Script URL อีกครั้ง
        const response = await fetch('https://script.google.com/macros/s/AKfycby83_xi262iSGQUnadikpkj38iTwOLwvmePGxCLCirN8mwpneZZKXYG7fn3UVtcvQyh/exec', {
          method: 'POST',
          mode: 'no-cors', // เพิ่มโหมดนี้หากติดปัญหา CORS
          headers: { 'Content-Type': 'text/plain' }, 
          body: JSON.stringify({
            image: imageFile,
            fileName: `img_${Date.now()}.png`
          })
        });
        // หมายเหตุ: เมื่อใช้ no-cors จะอ่าน response.json() ไม่ได้ แต่รูปจะเข้า Drive ปกติ
        // หากต้องการ URL กลับมา ต้องตั้งค่าที่ Apps Script ให้รองรับ Options/CORS
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    const newItem: OrderItem = {
      id: `ORD-${Date.now()}`,
      userName: localStorage.getItem('greenbuild_user_name') || 'ไม่ระบุชื่อ',
      department: localStorage.getItem('greenbuild_department') || 'ไม่ระบุแผนก',
      name: productName.trim(), // ตรวจสอบว่าใน types.ts ใช้ 'name' หรือ 'productName'
      amount: Number(quantity), // ตรวจสอบว่าใน types.ts ใช้ 'amount' หรือ 'quantity'
      unit: unit,
      isGreen: true,
      imageAttachment: uploadedImageUrl,
      requestedAt: new Date().toISOString(),
      status: OrderStatus.PENDING
    };

    if (type === 'CART') onAddToCart(newItem);
    else onCreateOrder([newItem]);
    
    setIsUploading(false);
    setProductName('');
    setQuantity(1);
    setImageFile(null);
    alert("บันทึกข้อมูลเรียบร้อย!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span>📦</span> รายละเอียดรายการวัสดุ
      </h2>
      
      <div className="space-y-6">
        {/* ชื่อสินค้า */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อวัสดุ / สินค้า *</label>
          <input 
            type="text" 
            placeholder="เช่น กระดาษ A4, หมึกพิมพ์" 
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 transition-all"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* จำนวน และ หน่วย */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">จำนวน *</label>
            <input 
              type="number" 
              min="1"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 transition-all"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">หน่วยนับ</label>
            <input 
              type="text" 
              placeholder="รีม, กล่อง, ชิ้น"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 transition-all"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        
        {/* อัปโหลดรูปภาพ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ภาพประกอบ</label>
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative">
            <input 
              type="file" 
              accept="image/*" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">📸</div>
              <p className="text-gray-500 font-medium">{imageFile ? "เปลี่ยนรูปภาพ" : "กดเพื่ออัปโหลดรูปภาพ"}</p>
              {imageFile && (
                <div className="mt-4">
                  <img src={imageFile} alt="preview" className="max-h-32 mx-auto rounded-lg shadow-md" />
                  <p className="text-xs text-green-600 mt-2">✨ เตรียมพร้อมอัปโหลด</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* ปุ่มกดยืนยัน */}
        <div className="flex gap-4 pt-4">
          <button 
            disabled={isUploading}
            onClick={() => handleSubmit('CART')}
            className="flex-1 py-4 border-2 border-orange-500 text-orange-600 rounded-2xl font-bold hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50"
          >
            🛒 เพิ่มลงตะกร้า
          </button>
          <button 
            disabled={isUploading}
            onClick={() => handleSubmit('DIRECT')}
            className="flex-[1.5] py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isUploading ? "กำลังประมวลผล..." : "ส่งคำขอจัดซื้อทันที"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopView;
