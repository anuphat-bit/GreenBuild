import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface ShopViewProps {
  onAddToCart: (item: OrderItem) => void;
  onCreateOrder: (item: OrderItem) => void;
}

// ข้อมูลวัสดุตัวอย่าง (คุณสามารถเพิ่มหรือแก้ไขรายการตรงนี้ได้)
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

  const prepareOrderItem = (product: typeof AVAILABLE_PRODUCTS[0]): OrderItem => {
    const amount = quantities[product.id] || 1;
    return {
      id: `ITEM-${Date.now()}-${product.id}`,
      name: product.name,      // เปลี่ยนจาก productName เป็น name
      amount: amount,          // เปลี่ยนจาก quantity เป็น amount
      unit: product.unit,
      isGreen: product.isGreen,
      status: OrderStatus.PENDING,
      userName: '',            // จะถูกเติมใน App.tsx
      department: '',          // จะถูกเติมใน App.tsx
      requestedAt: new Date().toISOString()
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">เลือกซื้อวัสดุ</h1>
          <p className="text-gray-500">เลือกวัสดุอุปกรณ์สำนักงานที่คุณต้องการ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {AVAILABLE_PRODUCTS.map((product) => (
          <div key={product.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center text-5xl relative">
              📦
              {product.isGreen && (
                <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  🌱 GREEN
                </span>
              )}
            </div>

            <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">{product.name}</h3>
            <p className="text-gray-400 text-xs mb-4">หน่วย: {product.unit}</p>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
                <button 
                  onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="font-bold text-gray-800">{quantities[product.id] || 1}</span>
                <button 
                  onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddToCart(prepareOrderItem(product))}
                  className="py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
                >
                  ใส่ตะกร้า
                </button>
                <button
                  onClick={() => onCreateOrder(prepareOrderItem(product))}
                  className="py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                >
                  สั่งซื้อทันที
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopView;
