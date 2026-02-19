import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import UserOrdersView from './components/UserOrdersView';
import AdminDashboard from './components/AdminDashboard';
import { OrderItem, OrderStatus } from './types';

// ตรวจสอบ URL นี้ให้ตรงกับใน SheetDB ของคุณ
const SHEETDB_URL = 'https://sheetdb.io/api/v1/0zxc9i3e6gg1z';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'SHOP' | 'CART' | 'USER_ORDERS' | 'ADMIN'>('SHOP');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ แก้จุดที่ 1: ฟังก์ชันดึงข้อมูล (เพิ่มตรรกะการเช็คข้อมูลให้ชัวร์ขึ้น)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SHEETDB_URL}?t=${Date.now()}`); // ใส่ timestamp กันแคช
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // กรองข้อมูล: ต้องมีชื่อสินค้า (name) หรือ (Name) และต้องไม่ใช่แถวว่าง
        const validData = data.filter(item => (item.name || item.Name) && item.id);
        setOrders(validData);
        console.log("ดึงข้อมูลสำเร็จ:", validData);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("ดึงข้อมูลจาก Sheets ไม่ได้:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ✅ แก้จุดที่ 2: ฟังก์ชันบันทึกข้อมูล (แก้ให้ส่งแบบ Array ชัวร์ๆ)
  const handleProcessOrder = async (orderItems: OrderItem[]) => {
    const userName = localStorage.getItem('greenbuild_user_name') || 'Guest User';
    const department = localStorage.getItem('greenbuild_department') || 'General';

    // เตรียมข้อมูลให้ตรงกับหัวตารางใน Sheets (ตัวเล็กทั้งหมด)
    const dataToUpload = orderItems.map(item => ({
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('th-TH'),
      userName: userName,
      userId: department,
      name: item.name,      // ชื่อคอลัมน์ต้องตรงกับใน Sheets
      amount: item.amount,  // ชื่อคอลัมน์ต้องตรงกับใน Sheets
      unit: item.unit,
      category: item.isGreen ? 'GREEN' : 'NORMAL',
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    }));

    try {
      // ⚠️ จุดตาย: ต้องส่งเป็น { "data": [ ... ] }
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToUpload })
      });

      if (response.ok) {
        alert('บันทึกสำเร็จ! ข้อมูลกำลังลง Google Sheets');
        setCart([]);
        await fetchAllData(); // ดึงข้อมูลใหม่มาโชว์ทันที
        setCurrentView('USER_ORDERS');
      } else {
        const err = await response.json();
        alert('API ปฏิเสธการบันทึก: ' + JSON.stringify(err));
      }
    } catch (error) {
      alert('การเชื่อมต่ออินเทอร์เน็ตมีปัญหา');
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
      {loading && <div className="fixed top-0 left-0 w-full h-1 bg-green-500 z-[200]" />}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'SHOP' && (
          <ShopView 
            onAddToCart={(item) => setCart([...cart, item])} 
            onCreateOrder={(item) => handleProcessOrder([item])} // ส่งเป็น Array เสมอ
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
