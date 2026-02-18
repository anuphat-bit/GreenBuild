import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import UserOrdersView from './components/UserOrdersView';
import AdminDashboard from './components/AdminDashboard';
import { OrderItem, OrderStatus } from './types';

const SHEETDB_URL = 'https://sheetdb.io/api/v1/0zxc9i3e6gg1z';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'SHOP' | 'CART' | 'USER_ORDERS' | 'ADMIN'>('SHOP');
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('greenbuild_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<OrderItem[]>([]);

  // 1. ดึงข้อมูลจาก Google Sheets ทันทีที่เปิดแอป (แก้ปัญหาเปลี่ยนเครื่องแล้วข้อมูลหาย)
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch(SHEETDB_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
          // แปลงข้อมูลจาก Sheets กลับเป็นรูปแบบที่แอปเข้าใจ (ถ้าจำเป็น)
          setOrders(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchAllOrders();
  }, []);

  // 2. บันทึกตะกร้าลง LocalStorage (เฉพาะสินค้าที่ยังไม่ได้สั่ง)
  useEffect(() => {
    localStorage.setItem('greenbuild_cart', JSON.stringify(cart));
  }, [cart]);

  // ฟังก์ชันกลางสำหรับส่งข้อมูลไป Google Sheets
  const sendToGoogleSheets = async (items: OrderItem[]) => {
    const dataToUpload = items.map(item => ({
      id: item.id,
      timestamp: new Date().toLocaleString('th-TH'),
      userName: item.userName || localStorage.getItem('greenbuild_user_name') || 'ไม่ระบุชื่อ',
      userId: item.department || localStorage.getItem('greenbuild_department') || 'ไม่ระบุแผนก',
      name: item.name,      // ชื่อสินค้า (ต้องตรงกับหัวตาราง Sheets)
      amount: item.amount,  // จำนวน (ต้องตรงกับหัวตาราง Sheets)
      unit: item.unit || 'หน่วย',
      category: item.isGreen ? 'GREEN' : 'NORMAL',
      status: 'PENDING'
    }));

    try {
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToUpload })
      });
      return response.ok;
    } catch (error) {
      console.error("SheetDB Post Error:", error);
      return false;
    }
  };

  const handleAddToCart = (item: OrderItem) => {
    setCart(prev => [...prev, item]);
    alert(`เพิ่ม "${item.name}" ลงในตะกร้าแล้ว`);
  };

  // 3. แก้ไขการสั่งซื้อทันที (Direct Order)
  const handleCreateOrder = async (newOrders: OrderItem[]) => {
    const success = await sendToGoogleSheets(newOrders);
    if (success) {
      // ดึงข้อมูลใหม่เพื่อ Update หน้าประวัติ
      const res = await fetch(SHEETDB_URL);
      const latestData = await res.json();
      setOrders(latestData);
      setCurrentView('USER_ORDERS');
      alert('สั่งซื้อสำเร็จ!');
    }
  };

  // 4. แก้ไขการสั่งซื้อจากตะกร้า (Checkout)
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const success = await sendToGoogleSheets(cart);
    if (success) {
      const res = await fetch(SHEETDB_URL);
      const latestData = await res.json();
      setOrders(latestData);
      setCart([]); // ล้างตะกร้าหลังสั่งซื้อสำเร็จ
      setCurrentView('USER_ORDERS');
      alert('สั่งซื้อรายการในตะกร้าสำเร็จ!');
    } else {
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // ในที่นี้ถ้าจะแก้สถานะใน Sheets ต้องใช้คำสั่ง PUT ของ SheetDB
    // แต่เบื้องต้นให้ Update ในหน้าจอเพื่อให้แอดมินทำงานได้ก่อน
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
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
          <ShopView onAddToCart={handleAddToCart} onCreateOrder={handleCreateOrder} />
        )}
        {currentView === 'CART' && (
          <CartView 
            items={cart} 
            onRemove={(id) => setCart(cart.filter(i => i.id !== id))}
            onCheckout={handleCheckout}
          />
        )}
        {currentView === 'USER_ORDERS' && <UserOrdersView orders={orders} />}
        {currentView === 'ADMIN' && (
          <AdminDashboard orders={orders} onUpdateStatus={updateOrderStatus} />
        )}
      </main>
    </div>
  );
};

export default App;
