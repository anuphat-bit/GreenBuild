import { OrderItem, OrderStatus } from '../types';

// *** ใส่ URL ของ Google Apps Script ที่คุณ Deploy ได้จาก Google Sheets ***
const API_URL = 'https://script.google.com/macros/s/AKfycby34x_QxhkFHt6MRq3YK_SV81nDNVMioIXQcg-MDjiwvgQ8QaIB2sIemX5k8jN7FaiT/exec'; 

export const GoogleSheetService = {
  // ดึงข้อมูล: เพิ่ม ?t= เพื่อป้องกัน Browser จำค่าเก่า
  fetchOrders: async (): Promise<OrderItem[]> => {
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store' // บังคับไม่ให้เก็บ cache
      });
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      return [];
    }
  },

  // ส่งข้อมูลใหม่: ส่งขึ้น Cloud ทันที
  createOrders: async (orders: OrderItem[]) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(orders),
      });
    } catch (error) {
      console.error("Create error:", error);
    }
  },

  // อัปเดตสถานะ (สำหรับ Admin): ส่งไปเปลี่ยนค่าใน Sheet
  updateOrder: async (id: string, status: OrderStatus, price: number, comment: string) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'UPDATE', id, status, price, comment }),
      });
    } catch (error) {
      console.error("Update error:", error);
    }
  }
};
