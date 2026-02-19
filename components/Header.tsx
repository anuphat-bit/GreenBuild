
import React, { useEffect, useState } from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  isAdmin: boolean;
  onLogout: () => void;
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isAdmin, onLogout, cartCount }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const isAdminView = currentView.startsWith('ADMIN_');

  return (
    <header className={`bg-white shadow-sm sticky top-0 z-50 border-b transition-colors duration-300 ${isAdminView ? 'border-blue-100' : 'border-green-100'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <div 
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          onClick={() => onNavigate('USER_SHOP')}
        >
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl transition-colors ${isAdminView ? 'bg-blue-600' : 'bg-green-600'}`}>
            GB
          </div>
          <span className="text-lg font-bold text-gray-800 hidden lg:block group-hover:text-gray-600 transition-colors">GreenBuild</span>
        </div>

        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 flex-1 md:flex-none">
          {!isAdminView ? (
            <>
              <button 
                onClick={() => onNavigate('USER_SHOP')}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap text-xs md:text-sm font-bold ${currentView === 'USER_SHOP' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                เลือกซื้อวัสดุ
              </button>
              <button 
                onClick={() => onNavigate('USER_TRACK')}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap text-xs md:text-sm font-bold ${currentView === 'USER_TRACK' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                ติดตามสถานะ
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onNavigate('ADMIN_DASHBOARD')}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap text-xs md:text-sm font-bold ${currentView === 'ADMIN_DASHBOARD' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                จัดการคำสั่ง
              </button>
              <button 
                onClick={() => onNavigate('ADMIN_REPORTS')}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap text-xs md:text-sm font-bold ${currentView === 'ADMIN_REPORTS' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                รายงานสรุป
              </button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {!isAdminView && (
            <button 
              onClick={() => onNavigate('USER_CART')}
              className={`relative p-2 hover:bg-gray-100 rounded-full transition-all outline-none ${isAnimating ? 'scale-110' : 'scale-100'} ${currentView === 'USER_CART' ? 'bg-green-50 text-green-600' : ''}`}
              title="ตะกร้า"
            >
              <span className="text-xl md:text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] md:text-[10px] font-bold h-4 w-4 md:h-5 md:w-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          
          <div className="h-6 w-px bg-gray-200 mx-0.5 hidden sm:block"></div>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] md:text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-600 transition-all border border-transparent"
              >
                ออก
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('ADMIN_LOGIN')}
              className="px-2 md:px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] md:text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
            >
              แอดมิน
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
