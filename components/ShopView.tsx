import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface ShopViewProps {
  onAddToCart: (item: OrderItem) => void;
  onCreateOrder: (item: OrderItem) => void;
}

const PRODUCTS = [
  { id: 'P1', name: 'กระดาษ A4 80 แกรม', unit: 'รีม', isGreen: true },
  { id: 'P2', name: 'ปากกาลูกลื่น น้ำเงิน', unit: 'โหล', isGreen: false },
  { id: 'P3', name: 'ตลับหมึกพิมพ์ HP', unit: 'ตลับ', isGreen: true },
];

const ShopView: React.FC<ShopViewProps> = ({ onAddToCart, onCreateOrder }) => {
  const [qtys, setQtys] = useState<{[key: string]: number}>({});

  // ✅ แก้ไขส่วน prepareItem ในไฟล์ ShopView.tsx
const prepareItem = (p: typeof PRODUCTS[0]): OrderItem => {
  const newItem = {
    // เพิ่มสุ่มตัวเลขข้างหลัง id เพื่อป้องกัน id ซ้ำกันเป๊ะๆ
    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: p.name,
    amount: qtys[p.id] || 1,
    unit: p.unit,
    isGreen: p.isGreen,
    status: OrderStatus.PENDING,
    requestedAt: new Date().toISOString()
  };
  
  // เพิ่มบรรทัดนี้เพื่อ Check ในหน้าจอ Console (F12)
  console.log("กำลังเตรียมส่งสินค้าชิ้นเดียว:", newItem);
  
  return newItem as OrderItem;
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PRODUCTS.map(p => (
        <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl mb-4 flex items-center justify-center text-2xl">📦</div>
          <h3 className="font-bold text-gray-800">{p.name}</h3>
          <p className="text-gray-400 text-sm mb-4">หน่วย: {p.unit}</p>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 mb-4">
            <button onClick={() => setQtys({...qtys, [p.id]: Math.max(1, (qtys[p.id] || 1) - 1)})} className="px-3">-</button>
            <span className="font-bold">{qtys[p.id] || 1}</span>
            <button onClick={() => setQtys({...qtys, [p.id]: (qtys[p.id] || 1) + 1})} className="px-3">+</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onAddToCart(prepareItem(p))} className="py-2 bg-gray-100 rounded-xl text-xs font-bold">ใส่ตะกร้า</button>
            <button onClick={() => onCreateOrder(prepareItem(p))} className="py-2 bg-green-600 text-white rounded-xl text-xs font-bold">สั่งซื้อทันที</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopView;
