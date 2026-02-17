
import React, { useMemo } from 'react';
import { OrderItem, OrderStatus } from '../types';

interface UserOrdersViewProps {
  orders: OrderItem[];
}

const UserOrdersView: React.FC<UserOrdersViewProps> = ({ orders }) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.APPROVED:
        return {
          icon: '✅',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          badgeBg: 'bg-emerald-600 text-white',
          label: 'อนุมัติแล้ว',
          iconBg: 'bg-emerald-100'
        };
      case OrderStatus.REJECTED:
        return {
          icon: '❌',
          bg: 'bg-rose-50 text-rose-700 border-rose-100',
          badgeBg: 'bg-rose-600 text-white',
          label: 'ไม่ได้รับอนุมัติ',
          iconBg: 'bg-rose-100'
        };
      case OrderStatus.SHIPPED:
        return {
          icon: '🚚',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          badgeBg: 'bg-indigo-600 text-white',
          label: 'จัดส่งเรียบร้อยแล้ว',
          iconBg: 'bg-indigo-100'
        };
      default:
        return {
          icon: '⏳',
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          badgeBg: 'bg-amber-500 text-white',
          label: 'กำลังรอการอนุมัติ',
          iconBg: 'bg-amber-100'
        };
    }
  };

  const sustainabilityStats = useMemo(() => {
    const total = orders.length;
    const green = orders.filter(o => o.isGreen).length;
    const ratio = total > 0 ? (green / total) * 100 : 0;
    
    let tier = "Green Beginner";
    let tierColor = "text-gray-400";
    if (ratio >= 80) { tier = "Sustainability Champion"; tierColor = "text-emerald-600"; }
    else if (ratio >= 50) { tier = "Eco Explorer"; tierColor = "text-green-500"; }
    else if (ratio > 0) { tier = "Green Starter"; tierColor = "text-emerald-400"; }

    return { total, green, ratio, tier, tierColor };
  }, [orders]);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-in fade-in duration-500">
        <div className="text-6xl mb-4">📦</div>
        <p className="text-xl font-medium">ยังไม่มีรายการสั่งซื้อ</p>
        <p className="text-sm mt-1">เริ่มสั่งซื้อวัสดุที่หน้า Marketplace ได้เลย</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">รายการสั่งซื้อของฉัน</h1>
          <p className="text-gray-500 text-sm">ติดตามสถานะและตรวจสอบสถิติความยั่งยืนของคุณ</p>
        </div>
      </div>

      {/* Sustainability Dashboard */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row items-center gap-8">
          <div className="relative flex-shrink-0">
             <div className="w-24 h-24 rounded-full border-4 border-emerald-100 flex items-center justify-center bg-white shadow-inner">
                <span className="text-4xl">🌱</span>
             </div>
             <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
               LVL 1
             </div>
          </div>

          <div className="flex-grow space-y-4 w-full">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Sustainability Score</h2>
                <div className="flex items-center gap-2">
                   <span className="text-3xl font-bold text-gray-800">{sustainabilityStats.ratio.toFixed(0)}%</span>
                   <span className={`text-sm font-bold ${sustainabilityStats.tierColor}`}>{sustainabilityStats.tier}</span>
                </div>
              </div>
              <div className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                วัสดุกรีน {sustainabilityStats.green} จาก {sustainabilityStats.total} รายการ
              </div>
            </div>

            {/* Personalized Bar Chart / Progress Bar */}
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${sustainabilityStats.ratio}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed italic">
              "คุณช่วยองค์กรลดการปล่อยก๊าซเรือนกระจกผ่านการเลือกวัสดุที่เป็นมิตรต่อสิ่งแวดล้อม เยี่ยมมาก!"
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {orders.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map(order => {
          const config = getStatusConfig(order.status);
          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 ${config.iconBg}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{order.productName}</h3>
                      {order.isGreen && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-200">🌱 GREEN</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      โดย: <span className="font-medium">{order.userName}</span> | <span className="text-blue-600">{order.department}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">จำนวน: {order.quantity} | {new Date(order.requestedAt).toLocaleDateString('th-TH')}</p>
                    <p className="text-[10px] text-gray-300 font-mono uppercase tracking-tighter">ID: {order.id}</p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-widest">สถานะปัจจุบัน</div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold inline-block shadow-sm ${config.badgeBg}`}>
                    {config.label}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ราคาวัสดุสรุป</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    {order.finalPrice ? `฿${order.finalPrice.toLocaleString()}` : (
                      <span className="text-amber-600">รอยืนยันราคา</span>
                    )}
                  </div>
                </div>
                {order.adminComment && (
                  <div className="md:col-span-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">ข้อความจากแอดมิน:</span>
                    <p className="text-sm text-indigo-900 mt-1 leading-relaxed">{order.adminComment}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserOrdersView;
