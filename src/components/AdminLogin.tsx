import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminLoginSchema, type AdminLoginData } from '../schemas';

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AdminLogin({ onBack, onSuccess }: AdminLoginProps) {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      rememberMe: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data: AdminLoginData) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await login(data.username, data.password, data.rememberMe);
      onSuccess();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
      setIsLoading(false);
    }
  };

  // เช็คว่าเป็น server error หรือไม่
  const isServerError = errorMessage.includes('เซิร์ฟเวอร์') || errorMessage.includes('เชื่อมต่อ') || errorMessage.includes('หมดเวลา');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-violet-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">กลับหน้าหลัก</span>
          </button>
          
          <div className="text-center">
            <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-slate-800">
              เข้าสู่ระบบ Admin
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              กรุณาล็อกอินเพื่อเข้าสู่ระบบจัดการ
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-purple-100/50 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {errorMessage && (
              <div className={`rounded-xl p-4 ${isServerError ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start space-x-3">
                  <AlertCircle className={`w-5 h-5 mt-0.5 ${isServerError ? 'text-orange-600' : 'text-red-600'}`} />
                  <div>
                    <h3 className={`font-medium text-sm ${isServerError ? 'text-orange-800' : 'text-red-800'}`}>
                      {isServerError ? 'เซิร์ฟเวอร์ไม่พร้อมใช้งาน' : 'ข้อผิดพลาดการเข้าสู่ระบบ'}
                    </h3>
                    <p className={`text-sm mt-1 ${isServerError ? 'text-orange-700' : 'text-red-700'}`}>
                      {errorMessage}
                    </p>
                    {isServerError && (
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        💡 กำลังแก้ไขปัญหา กรุณารอสักครู่แล้วลองใหม่
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  {...register('username', { required: 'กรุณากรอกชื่อผู้ใช้' })}
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="กรอกชื่อผู้ใช้"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm sm:text-base font-medium text-slate-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="กรอกรหัสผ่าน"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500 focus:ring-2 transition-colors"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700">
                จำการเข้าสู่ระบบ <span className="text-xs text-slate-500">(1 วัน)</span>
              </label>
            </div>

            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm sm:text-base font-bold rounded-xl hover:from-purple-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </div>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </div>

            <div className="text-center pt-3 sm:pt-4 border-t border-purple-100">
              <p className="text-xs sm:text-sm text-slate-500 bg-purple-50 rounded-xl px-3 sm:px-4 py-2 font-medium">
                🔑 กรุณาใช้ข้อมูลผู้ดูแลระบบที่ได้รับจากหน่วยงาน
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}