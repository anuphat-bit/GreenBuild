
import React, { useState, useEffect } from 'react';
import { ViewType, OrderItem } from './types';
import Header from './components/Header';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminReports from './components/AdminReports';
import TrackOrderView from './components/TrackOrderView';
import { GoogleSheetService } from './services/googleSheetService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('USER_SHOP');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    setIsSyncing(true);
    // ดึงข้อมูลจาก Sheets
    const sheetOrders = await GoogleSheetService.fetchOrders();
    
    // ถ้าไม่มีข้อมูลใน Sheets ให้ลองดู LocalStorage (เป็น Backup)
    if (sheetOrders.length > 0) {
      setOrders(sheetOrders);
    } else {
      const savedOrders = localStorage.getItem('greenbuild_orders');
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (e) { setOrders([]); }
      }
    }

    const savedCart = localStorage.getItem('greenbuild_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) { setCart([]); }
    }

    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAdminAuthenticated(true);
    
    setIsDataLoaded(true);
    setIsSyncing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync เฉพาะตะกร้าลง LocalStorage (เพราะไม่ต้องลง Sheet จนกว่าจะสั่งซื้อ)
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

  const handleCreateOrder = async (newOrders: OrderItem[]) => {
    setIsSyncing(true);
    // บันทึกลง Local ทันทีเพื่อความเร็ว
    setOrders(prev => [...prev, ...newOrders]);
    // ส่งขึ้น Google Sheets
    await GoogleSheetService.createOrders(newOrders);
    setIsSyncing(false);
  };

  const handleAddToCart = (item: OrderItem) => {
    setCart(prev => [...prev, item]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSyncing(true);
    const billId = `BILL-${Date.now()}`;
    const checkoutItems = cart.map(item => ({
      ...item,
      billId: billId
    }));

    setOrders(prev => [...prev, ...checkoutItems]);
    setCart([]);
    
    // ส่งขึ้น Google Sheets
    await GoogleSheetService.createOrders(checkoutItems);
    setIsSyncing(false);
    return billId;
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<OrderItem>) => {
    setIsSyncing(true);
    // อัปเดตใน UI
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    
    // ส่งขึ้น Google Sheets
    if (updates.status) {
      await GoogleSheetService.updateOrder(
        orderId, 
        updates.status, 
        updates.finalPrice || 0, 
        updates.adminComment || ''
      );
    }
    setIsSyncing(false);
  };

  if (!isDataLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-green-600 font-bold animate-pulse">กำลังเชื่อมต่อฐานข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isAdmin={isAdminAuthenticated} 
        onLogout={handleAdminLogout}
        cartCount={cart.length}
      />
      
      {isSyncing && (
        <div className="bg-orange-500 text-white text-[10px] text-center py-1 font-bold animate-pulse uppercase tracking-widest sticky top-16 z-40">
          กำลังซิงค์ข้อมูลกับ Google Sheets...
        </div>
      )}

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

      <footer className="bg-white border-t py-4 text-center text-gray-400 text-[10px] uppercase tracking-widest flex flex-col items-center gap-1">
        <div>Google Sheets & Drive Integrated System</div>
        <div className="text-[8px] opacity-50">Data synced to your workspace cloud</div>
      </footer>
    </div>
  );
};

export default App;
