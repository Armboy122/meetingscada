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
    try {
      // ใช้ proxy ใน development หรือ production URL โดยตรง
      const apiUrl = import.meta.env.DEV ? '/api/auth/me' : 'https://cfw-bun-hono-drizzle.apiarm.workers.dev/auth/me';
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  }, [logout]);

  // Check for existing auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedAdmin = localStorage.getItem('adminData');

    if (storedToken && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        setToken(storedToken);
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        // Verify token with backend
        verifyToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored admin data:', error);
        logout();
      }
    }
    setLoading(false);
  }, [verifyToken, logout]);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const apiUrl = import.meta.env.DEV ? '/api/auth/login' : 'https://cfw-bun-hono-drizzle.apiarm.workers.dev/auth/login';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
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
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // ตรวจสอบว่าเป็น network error หรือ server error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        throw new Error('เซิร์ฟเวอร์ส่งข้อมูลผิดรูปแบบ กรุณาลองอีกครั้งในภายหลัง');
      } else if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้งในภายหลัง');
      }
      
      throw error;
    }
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