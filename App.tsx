import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import UserOrdersView from './components/UserOrdersView';
import AdminDashboard from './components/AdminDashboard';
import { OrderItem, OrderStatus } from './types';

const SHEETDB_URL = 'https://sheetdb.io/api/v1/0zxc9i3e6gg1z';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'SHOP' | 'CART' | 'USER_ORDERS' | 'ADMIN'>('SHOP');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. ดึงข้อมูลจาก Sheets (ยึดตามหน้าชีทเป็นหลัก)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SHEETDB_URL}?t=${Date.now()}`); // ป้องกัน Cache
      const data = await response.json();
      if (Array.isArray(data)) {
        // กรองแถวที่ไม่มีชื่อสินค้าออก (กัน Error)
        const validData = data.filter(item => item.name);
        setOrders(validData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // 2. ฟังก์ชันส่งคำสั่งซื้อ (รองรับทั้งตะกร้าและสั่งทันที)
  const handleProcessOrder = async (orderItems: OrderItem[]) => {
    const userName = localStorage.getItem('greenbuild_user_name') || 'Guest';
    const department = localStorage.getItem('greenbuild_department') || 'General';

    const dataToUpload = orderItems.map(item => ({
      id: item.id || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleString('th-TH'),
      userName: userName,
      userId: department,
      name: item.name,      // ชื่อสินค้า
      amount: item.amount,  // จำนวน
      unit: item.unit,
      category: item.isGreen ? 'GREEN' : 'NORMAL',
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    }));

    try {
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToUpload })
      });

      if (response.ok) {
        alert('บันทึกข้อมูลลง Google Sheets สำเร็จ!');
        setCart([]); 
        await fetchAllData(); 
        setCurrentView('USER_ORDERS');
      }
    } catch (error) {
      alert('ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const handleUpdateOrder = async (id: string, updates: Partial<OrderItem>) => {
    try {
      const response = await fetch(`${SHEETDB_URL}/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updates })
      });
      if (response.ok) await fetchAllData();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cart.length} onNavigate={setCurrentView} currentView={currentView} />
      {loading && <div className="fixed top-0 left-0 w-full h-1 bg-green-500 animate-pulse z-[200]" />}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'SHOP' && (
          <ShopView 
            onAddToCart={(item) => setCart([...cart, item])} 
            onCreateOrder={(item) => handleProcessOrder([item])} // ส่งเป็น Array [item]
          />
        )}
        {currentView === 'CART' && (
          <CartView 
            items={cart} 
            onRemove={(id) => setCart(cart.filter(i => i.id !== id))}
            onCheckout={() => handleProcessOrder(cart)}
          />
        )}
        {currentView === 'USER_ORDERS' && <UserOrdersView orders={orders} />}
        {currentView === 'ADMIN' && <AdminDashboard orders={orders} onUpdateOrder={handleUpdateOrder} />}
      </main>
    </div>
  );
};

export default App;
