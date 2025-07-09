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
      const response = await fetch('https://cfw-bun-hono-drizzle.apiarm.workers.dev/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
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
      const response = await fetch('https://cfw-bun-hono-drizzle.apiarm.workers.dev/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

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
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
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