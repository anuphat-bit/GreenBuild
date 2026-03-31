import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); // เปลี่ยน '.' เป็น process.cwd() เพื่อความแม่นยำ
    return {
      base: '/GreenBuild/', // สำคัญมากสำหรับการลงท้าย URL บน GitHub
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          // แนะนำให้แก้ alias เป็นแบบนี้เพื่อให้ดึงไฟล์จาก folder src ได้แม่นยำ
          '@': path.resolve(__dirname, './src'), 
        },
      },
      build: {
        outDir: 'dist', // โฟลเดอร์ที่จะเอาไปอัปโหลดขึ้น GitHub
      }
    };
});
