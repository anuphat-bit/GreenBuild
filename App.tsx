
import React, { useState, useEffect } from 'react';
import { ViewType, OrderItem } from './types';
import { MOCK_ORDERS } from './constants';
import Header from './components/Header';
import ShopView from './components/ShopView';
import UserOrdersView from './components/UserOrdersView';
import CartView from './components/CartView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminReports from './components/AdminReports';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('USER_SHOP');
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const savedOrders = localStorage.getItem('greenbuild_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to parse orders", e);
      }
    }
    const savedCart = localStorage.getItem('greenbuild_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    // ตรวจสอบ Session เมื่อโหลดหน้าใหม่
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = (id: string, code: string): boolean => {
    // ยืนยันรหัสผ่านแบบ Case-sensitive (ตัวพิมพ์เล็ก/ใหญ่มีผล)
    // ID: admin, Code: green1234
    if (id === 'admin' && code === 'green1234') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setCurrentView('ADMIN_DASHBOARD');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setCurrentView('USER_SHOP');
  };

  const handleCreateOrder = (newOrders: OrderItem[]) => {
    const updated = [...orders, ...newOrders];
    setOrders(updated);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updated));
    setCurrentView('USER_ORDERS');
  };

  const handleAddToCart = (item: OrderItem) => {
    const updated = [...cart, item];
    setCart(updated);
    localStorage.setItem('greenbuild_cart', JSON.stringify(updated));
  };

  const handleRemoveFromCart = (id: string) => {
    const updated = cart.filter(item => item.id !== id);
    setCart(updated);
    localStorage.setItem('greenbuild_cart', JSON.stringify(updated));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const updatedOrders = [...orders, ...cart];
    setOrders(updatedOrders);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updatedOrders));
    setCart([]);
    localStorage.removeItem('greenbuild_cart');
    setCurrentView('USER_ORDERS');
  };

  const handleUpdateOrder = (orderId: string, updates: Partial<OrderItem>) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
    setOrders(updated);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isAdmin={isAdminAuthenticated} 
        onLogout={handleAdminLogout}
        cartCount={cart.length}
      />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {currentView === 'USER_SHOP' && (
          <ShopView 
            onCreateOrder={handleCreateOrder} 
            onAddToCart={handleAddToCart}
          />
        )}
        
        {currentView === 'USER_CART' && (
          <CartView 
            cartItems={cart} 
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onContinueShopping={() => setCurrentView('USER_SHOP')}
          />
        )}

        {currentView === 'USER_ORDERS' && (
          <UserOrdersView orders={orders.filter(o => o.userId === 'U001')} />
        )}

        {currentView === 'ADMIN_LOGIN' && (
          <AdminLogin 
            onLogin={handleAdminLogin} 
            onBack={() => setCurrentView('USER_SHOP')} 
          />
        )}
        
        {currentView === 'ADMIN_DASHBOARD' && isAdminAuthenticated && (
          <AdminDashboard orders={orders} onUpdateOrder={handleUpdateOrder} />
        )}

        {currentView === 'ADMIN_REPORTS' && isAdminAuthenticated && (
          <AdminReports orders={orders} />
        )}
      </main>

      <footer className="bg-white border-t py-4 text-center text-gray-500 text-sm">
        © 2026 GreenBuild - Office Material Procurement System.
      </footer>
    </div>
  );
};

export default App;
