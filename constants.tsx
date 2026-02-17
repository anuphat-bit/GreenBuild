
import { Product, OrderStatus, OrderItem, GreenLabel } from './types';

// Mock data for GreenBuild System
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'กระดาษถ่ายเอกสาร A4 80 แกรม (Recycled)',
    category: 'Paper',
    description: 'กระดาษถ่ายเอกสารผลิตจากเยื่อรีไซเคิล 100% คุณภาพสูง ลดการตัดไม้',
    unit: 'รีม',
    basePrice: 125,
    imageUrl: 'https://picsum.photos/seed/paper/400/300'
  },
  {
    id: '2',
    name: 'ปากกาลูกลื่นแบบกด (Eco-Friendly)',
    category: 'Stationery',
    description: 'ตัวด้ามผลิตจากพลาสติกรีไซเคิล เขียนลื่น หมึกแห้งไว',
    unit: 'ด้าม',
    basePrice: 15,
    imageUrl: 'https://picsum.photos/seed/pen/400/300'
  },
  {
    id: '3',
    name: 'ตลับหมึกเลเซอร์ (Remanufactured)',
    category: 'IT Supplies',
    description: 'ตลับหมึกเทียบเท่าคุณภาพสูง ผ่านการนำกลับมาใช้ใหม่เพื่อลดขยะอิเล็กทรอนิกส์',
    unit: 'ตลับ',
    basePrice: 1200,
    imageUrl: 'https://picsum.photos/seed/ink/400/300'
  },
  {
    id: '4',
    name: 'แฟ้มสะสมผลงาน 2 นิ้ว',
    category: 'Filing',
    description: 'แฟ้มทำจากกระดาษแข็งรีไซเคิลหุ้มพลาสติก PP แข็งแรง ทนทาน',
    unit: 'เล่ม',
    basePrice: 85,
    imageUrl: 'https://picsum.photos/seed/folder/400/300'
  }
];

export const MOCK_ORDERS: OrderItem[] = [];
