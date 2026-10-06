import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loginUser, registerUser, updateName as updateNameApi } from '../api/client';

const AuthContext = createContext(null);

const TOKEN_KEY = 'tokenizado_token';
const USER_KEY = 'tokenizado_user';

function loadStored() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const initial = loadStored();
  const [token, setToken] = useState(initial.token);
  const [user, setUser] = useState(initial.user);
  const [loading, setLoading] = useState(false);

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const res = await loginUser({ email, password });
        persist(res.data.token, res.data.user);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      setLoading(true);
      try {
        const res = await registerUser({ name, email, password });
        // Auto-login after register
        const loginRes = await loginUser({ email, password });
        persist(loginRes.data.token, loginRes.data.user);
        return { register: res, login: loginRes };
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const updateName = useCallback(
    async (name) => {
      setLoading(true);
      try {
        const res = await updateNameApi(name);
        const nextUser = res.data.user;
        persist(token, nextUser);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [persist, token]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      updateName,
    }),
    [token, user, loading, login, register, logout, updateName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
