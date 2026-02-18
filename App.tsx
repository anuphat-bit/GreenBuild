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

  // ✅ 1. ฟังก์ชันดึงข้อมูลจาก Google Sheets (ทำให้ข้อมูลเหมือนกันทุกเบราว์เซอร์)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(SHEETDB_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        // กรองเฉพาะข้อมูลที่มีชื่อสินค้า เพื่อป้องกันสรุปผลคลาดเคลื่อน
        const validData = data.filter(item => item.name);
        setOrders(validData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 2. ดึงข้อมูลทันทีที่เปิดแอป
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ✅ 3. ฟังก์ชันส่งคำสั่งซื้อและอัปเดตสถานะทันที
  const handleProcessOrder = async (orderItems: OrderItem[]) => {
    const userName = localStorage.getItem('greenbuild_user_name') || 'Unknown';
    const department = localStorage.getItem('greenbuild_department') || 'Unknown';

    const dataToUpload = orderItems.map(item => ({
      id: `ORD-${Date.now()}`,
      timestamp: new Date().toLocaleString('th-TH'),
      userName: userName,
      userId: department,
      name: item.name,      // ชื่อสินค้า (ต้องตรงกับหัวตาราง)
      amount: item.amount,  // จำนวน (ต้องตรงกับหัวตาราง)
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
        alert('ส่งคำสั่งซื้อสำเร็จ!');
        setCart([]); // ล้างตะกร้า
        await fetchAllData(); // ดึงข้อมูลใหม่จาก Server ทันที
        setCurrentView('USER_ORDERS');
      }
    } catch (error) {
      alert('การเชื่อมต่อผิดพลาด');
    }
  };

  // ✅ 4. ฟังก์ชันอัปเดตสถานะจากหน้าแอดมิน (Patch ไปยัง Google Sheets)
  const handleUpdateOrder = async (id: string, updates: Partial<OrderItem>) => {
    try {
      // อัปเดตไปยัง SheetDB โดยอ้างอิงจากคอลัมน์ id
      const response = await fetch(`${SHEETDB_URL}/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updates })
      });

      if (response.ok) {
        await fetchAllData(); // ดึงข้อมูลที่อัปเดตแล้วมาแสดงใหม่
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cart.length} onNavigate={setCurrentView} currentView={currentView} />
      
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-green-500 animate-pulse z-[200]" />
      )}

      <main className="container mx-auto px-4 py-8">
        {currentView === 'SHOP' && (
          <ShopView 
            onAddToCart={(item) => setCart([...cart, item])} 
            onCreateOrder={(item) => handleProcessOrder([item])} 
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
        {currentView === 'ADMIN' && (
          <AdminDashboard orders={orders} onUpdateOrder={handleUpdateOrder} />
        )}
      </main>
    </div>
  );
};

export default App;
