import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Admin {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  isActive: boolean;
  createdAt: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    admin: Admin;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminData');
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
  }, []);

  const verifyToken = useCallback(async (authToken: string) => {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Token verification attempt ${attempt}/${maxRetries}`);
        
        // ใช้ proxy ใน development หรือ production URL โดยตรง
        const apiUrl = import.meta.env.DEV ? '/api/auth/me' : 'https://cfw-bun-hono-drizzle.apiarm.workers.dev/auth/me';
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (response.ok) {
          console.log('✅ Token verification successful');
          return; // สำเร็จ ออกจาก function
        } else if (response.status === 401) {
          // ถ้าเป็น 401 Unauthorized แสดงว่า token หมดอายุจริงๆ
          console.log('🔒 Token expired or invalid (401)');
          logout();
          return;
        } else {
          // ถ้าเป็น error อื่นๆ (เช่น 503) ลองใหม่
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Token verification attempt ${attempt} failed:`, error);
        
        // ถ้าเป็นความพยายามสุดท้าย
        if (attempt === maxRetries) {
          break;
        }
        
        // รอก่อน retry
        const waitTime = 1000 * attempt; // 1s, 2s
        console.log(`⏳ Waiting ${waitTime}ms before token retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // ถ้าลองหมดแล้วยังไม่สำเร็จ แต่ไม่ logout ทันที
    console.warn('🚨 Token verification failed after all retries, but keeping session:', lastError);
    console.log('💡 Backend seems unstable, keeping user logged in for better UX');
    
    // ไม่ logout เพื่อให้ user ใช้งานต่อได้ แม้ backend จะไม่เสถียร
    // จะ logout เฉพาะเมื่อได้ 401 Unauthorized เท่านั้น
  }, [logout]);

  // Check for existing auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedAdmin = localStorage.getItem('adminData');

      if (storedToken && storedAdmin) {
        try {
          const adminData = JSON.parse(storedAdmin);
          
          // ตั้งค่า state ก่อน
          setToken(storedToken);
          setAdmin(adminData);
          setIsAuthenticated(true);
          
          console.log('🔐 Found stored credentials, initializing session...');
          
          // Verify token with backend แบบ silent (ไม่ logout ถ้าล้มเหลว)
          await verifyToken(storedToken);
          
        } catch (error) {
          console.error('Error parsing stored admin data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [verifyToken, logout]);

  const login = async (username: string, password: string): Promise<void> => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Login attempt ${attempt}/${maxRetries}`);
        
        const apiUrl = import.meta.env.DEV ? '/api/auth/login' : 'https://cfw-bun-hono-drizzle.apiarm.workers.dev/auth/login';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password }),
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        // ตรวจสอบว่าเป็น JSON response หรือไม่
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('เซิร์ฟเวอร์ไม่สามารถใช้งานได้ในขณะนี้ กรุณาลองอีกครั้งในภายหลัง');
        }

        const data: LoginResponse = await response.json();

        if (data.success) {
          const { token: authToken, admin: adminData } = data.data;
          
          // Store in localStorage
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('adminData', JSON.stringify(adminData));
          
          // Update state
          setToken(authToken);
          setAdmin(adminData);
          setIsAuthenticated(true);
          
          console.log('✅ Login successful');
          return; // สำเร็จ ออกจาก loop
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Login attempt ${attempt} failed:`, error);
        
        // ถ้าเป็น credential error ไม่ต้อง retry
        if (error instanceof Error && error.message.includes('ชื่อผู้ใช้หรือรหัสผ่าน')) {
          throw error;
        }
        
        // ถ้าเป็นความพยายามสุดท้าย
        if (attempt === maxRetries) {
          break;
        }
        
        // รอก่อน retry (exponential backoff)
        const waitTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // ถ้าลองหมดแล้วยังไม่สำเร็จ
    console.error('🚨 All login attempts failed:', lastError);
    
    if (lastError instanceof TypeError && lastError.message.includes('Failed to fetch')) {
      throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    } else if (lastError instanceof SyntaxError && lastError.message.includes('JSON')) {
      throw new Error('เซิร์ฟเวอร์ส่งข้อมูลผิดรูปแบบ กรุณาลองอีกครั้งในภายหลัง');
    } else if (lastError instanceof Error && lastError.name === 'AbortError') {
      throw new Error('การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้งในภายหลัง');
    }
    
    throw lastError || new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้งในภายหลัง');
  };



  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      admin,
      loading,
      login,
      logout,
      token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 