
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (id: string, code: string) => boolean;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [adminId, setAdminId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // จำลองการตรวจสอบเพื่อความปลอดภัย
    setTimeout(() => {
      const success = onLogin(adminId, accessCode);
      if (!success) {
        setError('รหัสผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (ตรวจสอบตัวพิมพ์เล็ก/ใหญ่)');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-blue-100 border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 backdrop-blur-md">
            🛡️
          </div>
          <h1 className="text-2xl font-bold">GreenBuild Portal</h1>
          <p className="text-blue-100 text-sm mt-1">เจ้าหน้าที่กรุณาระบุรหัสผ่านเพื่อเข้าจัดการ</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium animate-bounce">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Admin ID</label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Access Code</label>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังตรวจสอบ...
              </span>
            ) : 'เข้าสู่ระบบ'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
          >
            ยกเลิกและกลับสู่หน้าหลัก
          </button>
        </form>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 text-center uppercase tracking-widest font-medium">
          Secure Login Protocol • v1.0 (GreenBuild)
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
