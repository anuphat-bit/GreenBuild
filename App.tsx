import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import UserOrdersView from './components/UserOrdersView';
import AdminDashboard from './components/AdminDashboard';
import { OrderItem, OrderStatus } from './types';

// URL ของ SheetDB ที่คุณให้มา
const SHEETDB_URL = 'https://sheetdb.io/api/v1/0zxc9i3e6gg1z';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'SHOP' | 'CART' | 'USER_ORDERS' | 'ADMIN'>('SHOP');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  // 1. ดึงข้อมูลจาก Google Sheets ทันทีที่เปิดแอป (แก้ปัญหาเปลี่ยนเครื่องแล้วข้อมูลหาย)
  const fetchOrdersFromSheets = async () => {
    try {
      const response = await fetch(SHEETDB_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        // กรองข้อมูลเสีย (แถวที่ไม่มีชื่อสินค้า) ออกก่อนแสดงผล
        const validOrders = data.filter(item => item.name);
        setOrders(validOrders);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchOrdersFromSheets();
  }, []);

  // 2. ฟังก์ชันส่งข้อมูลไป Google Sheets (รองรับทั้งรายการเดียวและหลายรายการ)
  const sendToSheets = async (items: any[]) => {
    try {
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: items })
      });
      return response.ok;
    } catch (error) {
      console.error("Send to Sheets error:", error);
      return false;
    }
  };

  // 3. จัดการการสั่งซื้อ (ทั้งแบบสั่งทันที และ Checkout จากตะกร้า)
  const processOrder = async (orderItems: OrderItem[]) => {
    const userName = localStorage.getItem('greenbuild_user_name') || 'ไม่ระบุชื่อ';
    const department = localStorage.getItem('greenbuild_department') || 'ไม่ระบุแผนก';

    // เตรียมข้อมูลให้ตรงกับหัวตาราง Google Sheets ของคุณเป๊ะๆ
    const dataToUpload = orderItems.map(item => ({
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString('th-TH'),
      userName: userName,
      userId: department, // ใน Sheets ช่อง userId เราใช้เก็บชื่อแผนกตามที่คุณออกแบบ
      name: item.name,     // ชื่อสินค้า (ต้องมี)
      amount: item.amount, // จำนวน (ต้องมี)
      unit: item.unit || 'หน่วย',
      category: item.isGreen ? 'GREEN' : 'NORMAL',
      status: 'PENDING'
    }));

    const success = await sendToSheets(dataToUpload);
    if (success) {
      alert('บันทึกข้อมูลสำเร็จ!');
      await fetchOrdersFromSheets(); // ดึงข้อมูลล่าสุดกลับมาทันที
      setCart([]); // ล้างตะกร้า (ถ้ามี)
      setCurrentView('USER_ORDERS'); // ไปหน้าประวัติการสั่งซื้อ
    } else {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google Sheets');
    }
  };

  // ฟังก์ชันเพิ่มลงตะกร้า
  const handleAddToCart = (item: OrderItem) => {
    setCart(prev => [...prev, item]);
    alert(`เพิ่ม "${item.name}" ลงในตะกร้าแล้ว`);
  };

  // ฟังก์ชันอัปเดตสถานะ (สำหรับหน้าแอดมิน)
  const handleUpdateOrder = async (id: string, updates: Partial<OrderItem>) => {
    try {
      // อัปเดตที่ SheetDB (ต้องระบุ ID แถว)
      await fetch(`${SHEETDB_URL}/id/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updates })
      });
      await fetchOrdersFromSheets();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartCount={cart.length} 
        onNavigate={setCurrentView} 
        currentView={currentView}
      />
      <main className="container mx-auto px-4 py-8">
        {currentView === 'SHOP' && (
          <ShopView 
            onAddToCart={handleAddToCart} 
            onCreateOrder={(item) => processOrder([item])} // สั่งซื้อรายการเดียว
          />
        )}
        {currentView === 'CART' && (
          <CartView 
            items={cart} 
            onRemove={(id) => setCart(cart.filter(i => i.id !== id))}
            onCheckout={() => processOrder(cart)} // สั่งซื้อจากตะกร้า
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
