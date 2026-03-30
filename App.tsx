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

  // --- 1. ฟังก์ชันโหลดข้อมูล (ปรับปรุงเพื่อลดการค้าง) ---
  const loadData = useCallback(async () => {
    setIsSyncing(true);
    try {
      // ดึงข้อมูลสดจาก Google Sheets ก่อนเสมอ
      const sheetOrders = await GoogleSheetService.fetchOrders();
      
      if (sheetOrders && sheetOrders.length > 0) {
        setOrders(sheetOrders);
        // อัปเดต Backup ในเครื่องให้ตรงกับ Cloud
        localStorage.setItem('greenbuild_orders', JSON.stringify(sheetOrders));
      } else {
        // ถ้าใน Cloud ว่างเปล่า ให้ลองดูว่าในเครื่องมีไหม
        const savedOrders = localStorage.getItem('greenbuild_orders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      }
    } catch (error) {
      console.error("Error syncing with Google Sheets:", error);
      // ถ้า Error (เช่น เน็ตหลุด) ให้ดึงจาก LocalStorage แทน
      const savedOrders = localStorage.getItem('greenbuild_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    }

    // โหลดข้อมูลตะกร้าสินค้า
    const savedCart = localStorage.getItem('greenbuild_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) { setCart([]); }
    }

    // ตรวจสอบสถานะ Admin
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') setIsAdminAuthenticated(true);
    
    setIsDataLoaded(true);
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- 2. Sync ตะกร้าลงเครื่องอัตโนมัติ ---
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('greenbuild_cart', JSON.stringify(cart));
    }
  }, [cart, isDataLoaded]);

  // --- 3. ฟังก์ชันจัดการคำสั่งซื้อ ---
  const handleCreateOrder = async (newOrders: OrderItem[]) => {
    setIsSyncing(true);
    const updatedOrders = [...orders, ...newOrders];
    setOrders(updatedOrders);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updatedOrders));
    
    await GoogleSheetService.createOrders(newOrders);
    setIsSyncing(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsSyncing(true);
    const billId = `BILL-${Date.now()}`;
    const checkoutItems = cart.map(item => ({
      ...item,
      billId: billId
    }));

    const updatedOrders = [...orders, ...checkoutItems];
    setOrders(updatedOrders);
    localStorage.setItem('greenbuild_orders', JSON.stringify(updatedOrders));
    setCart([]); // ล้างตะกร้าหลังสั่งซื้อ
    
    await GoogleSheetService.createOrders(checkoutItems);
    setIsSyncing(false);
    return billId;
  };

  // --- 4. ฟังก์ชัน Admin & Reset ---
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

  // ฟังก์ชันพิเศษสำหรับล้างค่าที่ค้างในเครื่อง (กดใช้เมื่อข้อมูลรวน)
  const handleHardReset = () => {
    if (window.confirm("คุณต้องการล้างข้อมูลแคชในเครื่องทั้งหมดใช่หรือไม่?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  // --- 5. Render Logic ---
  if (!isDataLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-green-600 font-bold animate-pulse">GreenBuild กำลังเตรียมความพร้อม...</p>
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
        <div className="bg-green-600 text-white text-[10px] text-center py-1 font-bold animate-pulse uppercase tracking-widest sticky top-16 z-40">
          กำลังซิงค์ข้อมูลกับระบบ Cloud...
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-6">
        {currentView === 'USER_SHOP' && (
          <ShopView 
            onCreateOrder={handleCreateOrder} 
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
                onUpdateOrder={(id, updates) => {
                  const updated = orders.map(o => o.id === id ? { ...o, ...updates } : o);
                  setOrders(updated);
                  // อัปเดตไปยัง Cloud (สมมติว่าใช้ GoogleSheetService.updateOrder)
                  if (updates.status) GoogleSheetService.updateOrder(id, updates.status, updates.finalPrice || 0, updates.adminComment || '');
                }} 
              />
            )}
            {currentView === 'ADMIN_REPORTS' && <AdminReports orders={orders} />}
          </>
        )}
      </main>

      <footer className="bg-white border-t py-4 text-center text-gray-400 text-[10px] uppercase tracking-widest flex flex-col items-center gap-1">
        <div>GreenBuild v1.0 • Sustainability System</div>
        <button 
          onClick={handleHardReset}
          className="mt-2 text-[8px] border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
        >
          Reset Local Cache
        </button>
      </footer>
    </div>
  );
};

export default App;
