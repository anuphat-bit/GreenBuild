import React, { useState, useEffect } from 'react';
import { OrderItem, OrderStatus, GreenLabel } from '../types';

interface ShopViewProps {
  onCreateOrder: (orders: OrderItem[]) => void;
  onAddToCart: (item: OrderItem) => void;
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
  const [userName, setUserName] = useState(localStorage.getItem('greenbuild_user_name') || '');
  const [department, setDepartment] = useState(localStorage.getItem('greenbuild_department') || DEPARTMENTS[0]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [isGreen, setIsGreen] = useState(false);

  useEffect(() => {
    localStorage.setItem('greenbuild_user_name', userName);
    localStorage.setItem('greenbuild_department', department);
  }, [userName, department]);

  const handleSubmit = (type: 'DIRECT' | 'CART') => {
    if (department === DEPARTMENTS[0] || !productName || !userName) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const newItem: OrderItem = {
      id: `ORD-${Date.now()}`,
      userName: userName.trim(),
      department: department,
      name: productName.trim(), // ส่งไปใน key 'name'
      amount: Number(quantity), // ส่งไปใน key 'amount'
      unit: unit.trim(),
      isGreen: isGreen,
      requestedAt: new Date().toISOString(),
      status: OrderStatus.PENDING,
      category: isGreen ? 'GREEN' : 'NORMAL'
    };

    if (type === 'CART') {
      onAddToCart(newItem);
    } else {
      onCreateOrder([newItem]);
    }

    // Reset เฉพาะชื่อสินค้าและจำนวน
    setProductName('');
    setQuantity(1);
    setUnit('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-xl font-bold">แบบฟอร์มขอจัดซื้อ</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อผู้สั่ง</label>
            <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">แผนก</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อวัสดุสินค้า *</label>
            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="เช่น กระดาษ A4" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">จำนวน</label>
              <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full p-3 bg-gray-50 rounded-xl border-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">หน่วย</label>
              <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="รีม/กล่อง" className="w-full p-3 bg-gray-50 rounded-xl border-none" />
            </div>
          </div>
          <label className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl cursor-pointer">
            <input type="checkbox" checked={isGreen} onChange={e => setIsGreen(e.target.checked)} className="w-5 h-5 accent-green-600" />
            <span className="font-bold text-green-700">เป็นวัสดุรักษ์โลก (Green Material)</span>
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button onClick={() => handleSubmit('CART')} className="flex-1 py-4 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-all">🛒 เพิ่มลงตะกร้า</button>
          <button onClick={() => handleSubmit('DIRECT')} className="flex-[1.5] py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:bg-green-700 transition-all">สั่งซื้อทันที</button>
        </div>
      </div>
    </div>
  );
};

export default ShopView;
