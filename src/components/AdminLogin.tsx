import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface LoginForm {
  username: string;
  password: string;
}

export function AdminLogin({ onBack, onSuccess }: AdminLoginProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      await login(data.username, data.password);
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">
                  ชื่อผู้ใช้
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register('username', { required: 'กรุณากรอกชื่อผู้ใช้' })}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 font-medium text-sm sm:text-base transition-all duration-200"
                    placeholder="กรอกชื่อผู้ใช้"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 font-medium">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    {...register('password', { required: 'กรุณากรอกรหัสผ่าน' })}
                    className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/80 font-medium text-sm sm:text-base transition-all duration-200"
                    placeholder="กรอกรหัสผ่าน"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>
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
                🔑 Demo: <span className="font-bold text-purple-600">armoff122</span> / <span className="font-bold text-purple-600">armoff122</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}