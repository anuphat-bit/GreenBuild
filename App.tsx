
import React, { useState, useEffect } from 'react';
import { ViewType, OrderItem } from './types';
import { MOCK_ORDERS } from './constants';
import Header from './components/Header';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminReports from './components/AdminReports';
import TrackOrderView from './components/TrackOrderView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('USER_SHOP');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const savedOrders = localStorage.getItem('greenbuild_orders');
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        setOrders(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setOrders([]);
      }
    }
    
    const savedCart = localStorage.getItem('greenbuild_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCart([]);
      }
    }

    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAdminAuthenticated(true);
    }
    
    setIsDataLoaded(true);
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('greenbuild_orders', JSON.stringify(orders));
    }
  }, [orders, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('greenbuild_cart', JSON.stringify(cart));
    }
  }, [cart, isDataLoaded]);

  const handleAdminLogin = (id: string, code: string): boolean => {
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
    setOrders(prev => [...prev, ...newOrders]);
  };

  const handleAddToCart = (item: OrderItem) => {
    setCart(prev => [...prev, item]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // สร้าง Bill ID เดียวสำหรับทั้งตะกร้า
    const billId = `BILL-${Date.now()}`;
    const checkoutItems = cart.map(item => ({
      ...item,
      billId: billId
    }));

    setOrders(prev => [...prev, ...checkoutItems]);
    setCart([]);
    return billId; // คืนค่าเพื่อให้ CartView แสดงผล
  };

  const handleUpdateOrder = (orderId: string, updates: Partial<OrderItem>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  if (!isDataLoaded) return null;

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
            onNavigate={setCurrentView}
          />
        )}
        
        {currentView === 'USER_TRACK' && (
          <TrackOrderView orders={orders} />
        )}

        {currentView === 'USER_CART' && (
          <CartView 
            cartItems={cart} 
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onContinueShopping={() => setCurrentView('USER_SHOP')}
            onNavigate={setCurrentView}
          />
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

      <footer className="bg-white border-t py-4 text-center text-gray-400 text-[10px] uppercase tracking-widest">
        Local Database System • Data stored in browser only
      </footer>
    </div>
  );
};

export default App;
