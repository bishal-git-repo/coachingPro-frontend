'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  async function login(role, email, password) {
    const loginFn = { admin: api.adminLogin, teacher: api.teacherLogin, student: api.studentLogin }[role];
    const res = await loginFn.call(api, { email, password });
    api.setTokens(res.accessToken, res.refreshToken);
    const userData = { ...res.data, role };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }

  async function logout() {
    try { await api.logout(); } catch {}
    api.clearTokens();
    setUser(null);
    router.push('/login');
  }

  function updateUser(updates) {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
