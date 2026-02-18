import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface ShopViewProps {
  onAddToCart: (item: OrderItem) => void;
  onCreateOrder: (item: OrderItem) => void;
}

const AVAILABLE_PRODUCTS = [
  { id: 'P1', name: 'กระดาษ A4 80 แกรม', unit: 'รีม', isGreen: true },
  { id: 'P2', name: 'ปากกาลูกลื่น น้ำเงิน', unit: 'โหล', isGreen: false },
  { id: 'P3', name: 'ยางลบ', unit: 'ก้อน', isGreen: false },
  { id: 'P4', name: 'ซองเอกสารน้ำตาล', unit: 'แพ็ค', isGreen: true },
];

const ShopView: React.FC<ShopViewProps> = ({ onAddToCart, onCreateOrder }) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (id: string, value: number) => {
    if (value < 1) return;
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  // ✅ จุดสำคัญ: ต้องเตรียมข้อมูลให้มีโครงสร้างเหมือนกันทั้งตะกร้าและสั่งทันที
  const prepareOrderItem = (product: typeof AVAILABLE_PRODUCTS[0]): OrderItem => {
    return {
      id: `ORD-${Date.now()}-${product.id}`,
      name: product.name,      // ต้องใช้ name
      amount: quantities[product.id] || 1, // ต้องใช้ amount
      unit: product.unit,
      isGreen: product.isGreen,
      status: OrderStatus.PENDING,
      requestedAt: new Date().toISOString()
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {AVAILABLE_PRODUCTS.map((product) => (
        <div key={product.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center text-5xl">📦</div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
          <p className="text-gray-400 text-xs mb-4">หน่วย: {product.unit}</p>

          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl mb-4">
            <button onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm">-</button>
            <span className="font-bold">{quantities[product.id] || 1}</span>
            <button onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm">+</button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onAddToCart(prepareOrderItem(product))} className="py-2 bg-gray-100 rounded-xl font-bold text-xs">ใส่ตะกร้า</button>
            {/* ✅ ปุ่มสั่งซื้อทันที ต้องเรียก onCreateOrder */}
            <button onClick={() => onCreateOrder(prepareOrderItem(product))} className="py-2 bg-green-600 text-white rounded-xl font-bold text-xs">สั่งซื้อทันที</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShopView;
