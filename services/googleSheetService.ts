
import { OrderItem } from '../types';

// ใส่ URL ที่ได้จากการ Deploy Google Apps Script Web App
const GAS_WEB_APP_URL = 'YOUR_GAS_WEB_APP_URL_HERE';

export const GoogleSheetService = {
  async fetchOrders(): Promise<OrderItem[]> {
    if (GAS_WEB_APP_URL.includes('YOUR_GAS')) return [];
    try {
      const response = await fetch(GAS_WEB_APP_URL);
      const data = await response.json();
      // แมพข้อมูลจาก Sheet กลับเป็น OrderItem Object
      return data.map((row: any) => ({
        billId: row["billId"] || row["Bill ID"],
        id: row["id"] || row["Item ID"],
        requestedAt: row["requestedAt"] || row["Date"],
        userName: row["userName"] || row["Name"],
        department: row["department"] || row["Dept"],
        productName: row["productName"] || row["Product"],
        quantity: Number(row["quantity"] || row["Qty"]),
        unit: row["unit"] || row["Unit"],
        isGreen: row["isGreen"] === true || row["isGreen"] === "TRUE",
        greenLabel: row["greenLabel"],
        description: row["description"],
        imageAttachment: row["imageUrl"], // ใน Sheet จะเก็บเป็น URL ของ Drive
        status: row["status"],
        finalPrice: Number(row["finalPrice"] || 0),
        adminComment: row["adminComment"]
      }));
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      return [];
    }
  },

  async createOrders(orders: OrderItem[]): Promise<boolean> {
    if (GAS_WEB_APP_URL.includes('YOUR_GAS')) return false;
    try {
      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // GAS ต้องการ no-cors สำหรับการ POST แบบง่าย
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createOrder', data: orders })
      });
      return true;
    } catch (error) {
      console.error('Error saving to Google Sheets:', error);
      return false;
    }
  },

  async updateOrder(orderId: string, status: string, finalPrice: number, adminComment: string): Promise<boolean> {
    if (GAS_WEB_APP_URL.includes('YOUR_GAS')) return false;
    try {
      await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateOrder', 
          orderId, 
          status, 
          finalPrice, 
          adminComment 
        })
      });
      return true;
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      return false;
    }
  }
};
