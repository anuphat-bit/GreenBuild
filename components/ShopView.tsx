import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface ShopViewProps {
  onAddToCart: (item: OrderItem) => void;
  onCreateOrder: (orders: OrderItem[]) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ onAddToCart, onCreateOrder }) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ฟังก์ชันจัดการการเลือกไฟล์รูปภาพ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string); // เก็บเป็น Base64 ไว้ส่ง
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (type: 'CART' | 'DIRECT') => {
    let uploadedImageUrl = "";

    // ถ้ามีการเลือกรูป ให้ส่งไปที่ Apps Script ก่อน
    if (imageFile) {
      setIsUploading(true);
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycby83_xi262iSGQUnadikpkj38iTwOLwvmePGxCLCirN8mwpneZZKXYG7fn3UVtcvQyh/exec', { // วาง URL ที่ได้จากข้อ 1 ตรงนี้
          method: 'POST',
          body: JSON.stringify({
            image: imageFile,
            fileName: `img_${Date.now()}.png`
          })
        });
        const result = await response.json();
        if (result.result === "success") {
          uploadedImageUrl = result.url; // ได้ลิงก์รูปภาพใน Drive มาแล้ว
        }
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }

    const newItem: OrderItem = {
      id: `ORD-${Date.now()}`,
      userName: localStorage.getItem('greenbuild_user_name') || '',
      department: localStorage.getItem('greenbuild_department') || '',
      name: productName,
      amount: quantity,
      unit: 'หน่วย',
      isGreen: true,
      imageAttachment: uploadedImageUrl, // เก็บลิงก์รูปภาพลงใน Google Sheets
      requestedAt: new Date().toISOString(),
      status: OrderStatus.PENDING
    };

    if (type === 'CART') onAddToCart(newItem);
    else onCreateOrder([newItem]);
    
    alert("บันทึกข้อมูลและอัปโหลดรูปเรียบร้อย!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6">รายละเอียดรายการวัสดุ</h2>
      
      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="ชื่อวัสดุสินค้า" 
          className="w-full p-3 bg-gray-50 rounded-xl"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <input 
            type="file" 
            accept="image/*" 
            id="file-upload" 
            className="hidden" 
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-500">{imageFile ? "เลือกรูปใหม่" : "อัปโหลดรูปภาพ"}</p>
            {imageFile && <p className="text-xs text-green-600 mt-2 italic">เตรียมอัปโหลดแล้ว</p>}
          </label>
        </div>

        <div className="flex gap-4">
          <button 
            disabled={isUploading}
            onClick={() => handleSubmit('CART')}
            className="flex-1 py-4 border-2 border-orange-500 text-orange-600 rounded-2xl font-bold"
          >
            {isUploading ? "กำลังอัปโหลด..." : "เพิ่มลงตะกร้า"}
          </button>
          <button 
            disabled={isUploading}
            onClick={() => handleSubmit('DIRECT')}
            className="flex-[1.5] py-4 bg-green-600 text-white rounded-2xl font-bold"
          >
            {isUploading ? "กำลังอัปโหลด..." : "ส่งคำขอจัดซื้อทันที"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopView;
