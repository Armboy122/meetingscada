import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-violet-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            <span className="text-lg text-slate-600">กำลังตรวจสอบการเข้าสู่ระบบ...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-violet-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">จำเป็นต้องเข้าสู่ระบบ</h2>
          <p className="text-slate-600 mb-6">
            กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 