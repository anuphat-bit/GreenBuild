import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import UserOrdersView from './components/UserOrdersView';
import AdminDashboard from './components/AdminDashboard';
import { OrderItem, OrderStatus } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'SHOP' | 'CART' | 'USER_ORDERS' | 'ADMIN'>('SHOP');
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('greenbuild_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('greenbuild_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('greenbuild_cart', JSON.stringify(cart));
  }, [cart]);

  // --- ส่วนแก้ไข: ตรวจสอบการรับค่าชื่อสินค้า (item.name) ---
  const handleAddToCart = (item: OrderItem) => {
    setCart(prev => [...prev, item]);
    alert(`เพิ่ม "${item.name}" ลงในตะกร้าแล้ว`);
  };

  const handleCreateOrder = (newOrders: OrderItem[]) => {
    const updatedOrders = [...orders, ...newOrders];
    setOrders(updatedOrders);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updatedOrders));
    
    // ส่งข้อมูลไป Google Sheets ทันที (กรณีสั่งซื้อทันที)
    sendToGoogleSheets(newOrders);
    setCurrentView('USER_ORDERS');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    await sendToGoogleSheets(cart);
    
    const updatedOrders = [...orders, ...cart];
    setOrders(updatedOrders);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updatedOrders));
    setCart([]);
    setCurrentView('USER_ORDERS');
  };

  const sendToGoogleSheets = async (items: OrderItem[]) => {
    try {
      await fetch('https://sheetdb.io/api/v1/0zxc9i3e6gg1z', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: items.map(item => ({
            id: item.id,
            timestamp: new Date().toLocaleString('th-TH'),
            userName: item.userName,
            userId: item.department,
            name: item.name, // ชื่อสินค้า
            amount: item.amount,
            unit: item.unit,
            category: item.isGreen ? 'GREEN' : 'NORMAL',
            status: 'PENDING'
          }))
        })
      });
    } catch (error) {
      console.error("SheetDB Error:", error);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updated));
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
