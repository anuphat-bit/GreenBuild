import React, { useState, useEffect, useCallback } from 'react';
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

  // --- 1. ฟังก์ชันโหลดข้อมูล (ดึงจาก Cloud เป็นหลัก) ---
  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // ดึงข้อมูลสดจาก Google Sheets
      const sheetOrders = await GoogleSheetService.fetchOrders();
      
      if (sheetOrders) {
        setOrders(sheetOrders);
        // เก็บลง LocalStorage ไว้แค่สำรองเผื่อเน็ตหลุดเท่านั้น
        localStorage.setItem('greenbuild_orders', JSON.stringify(sheetOrders));
      }
    } catch (error) {
      console.error("Sync Error:", error);
      const savedOrders = localStorage.getItem('greenbuild_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    }

    // โหลดตะกร้า (อันนี้แยกตามเครื่อง ถูกต้องแล้ว)
    const savedCart = localStorage.getItem('greenbuild_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { setCart([]); }
    }

    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAdminAuthenticated(true);
    
    setIsDataLoaded(true);
    setIsSyncing(false);
  }, []);

  // โหลดครั้งแรกตอนเปิดแอป
  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- 2. ใหม่! ดึงข้อมูลใหม่ทุกครั้งที่เปลี่ยนหน้าจอ ---
  useEffect(() => {
    if (isDataLoaded) {
      loadData();
    }
  }, [currentView]); // เมื่อหน้าจอเปลี่ยน ข้อมูลจะถูกดึงใหม่ทันที

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('greenbuild_cart', JSON.stringify(cart));
    }
  }, [cart, isDataLoaded]);

  // --- 3. ฟังก์ชันจัดการคำสั่งซื้อ (ปรับให้รอ Cloud) ---
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSyncing(true);
    const billId = `BILL-${Date.now()}`;
    const checkoutItems = cart.map(item => ({ ...item, billId: billId }));

    try {
      // 1. ส่งขึ้น Cloud
      await GoogleSheetService.createOrders(checkoutItems);
      
      // 2. ล้างตะกร้า
      setCart([]);
      localStorage.removeItem('greenbuild_cart');

      // 3. บังคับโหลดข้อมูลใหม่จาก Cloud เพื่อให้เห็นออเดอร์ที่เราเพิ่งสั่งไป
      await loadData(); 
      
      setIsSyncing(false);
      return billId;
    } catch (error) {
      alert("ไม่สามารถบันทึกข้อมูลได้ โปรดตรวจสอบอินเทอร์เน็ต");
      setIsSyncing(false);
    }
  };

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

  const handleHardReset = () => {
    if (window.confirm("ต้องการล้างแคชทั้งหมดใช่หรือไม่?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-green-600 font-bold">GreenBuild กำลังซิงค์ข้อมูล...</p>
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
        <div className="bg-green-600 text-white text-[10px] text-center py-1 font-bold animate-pulse sticky top-16 z-40">
          กำลังอัปเดตข้อมูลจากระบบส่วนกลาง (Google Sheets)...
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-6">
        {currentView === 'USER_SHOP' && (
          <ShopView 
            onCreateOrder={async (newOrders) => {
              setIsSyncing(true);
              await GoogleSheetService.createOrders(newOrders);
              await loadData();
            }} 
            onAddToCart={(item) => setCart(prev => [...prev, item])}
            onNavigate={setCurrentView}
          />
        )}
        
        {currentView === 'USER_TRACK' && <TrackOrderView orders={orders} />}

        {currentView === 'USER_CART' && (
          <CartView 
            cartItems={cart} 
            onRemoveItem={(id) => setCart(prev => prev.filter(i => i.id !== id))}
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
        
        {isAdminAuthenticated && (
          <>
            {currentView === 'ADMIN_DASHBOARD' && (
              <AdminDashboard 
                orders={orders} 
                onUpdateOrder={async (id, updates) => {
                  setIsSyncing(true);
                  if (updates.status) {
                    await GoogleSheetService.updateOrder(id, updates.status, updates.finalPrice || 0, updates.adminComment || '');
                    await loadData(); // โหลดใหม่เพื่อให้หน้าจอแอดมินอัปเดตสถานะล่าสุดจาก Cloud
                  }
                }} 
              />
            )}
            {currentView === 'ADMIN_REPORTS' && <AdminReports orders={orders} />}
          </>
        )}
      </main>

      <footer className="bg-white border-t py-4 text-center text-gray-400 text-[10px] flex flex-col items-center gap-1">
        <div>GreenBuild v1.1 • Centralized Sync System</div>
        <button onClick={handleHardReset} className="mt-2 border border-gray-200 px-2 py-1 rounded">
          ล้างข้อมูลที่ค้างในเบราว์เซอร์
        </button>
      </footer>
    </div>
  );
};

export default App;
