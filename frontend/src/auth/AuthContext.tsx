import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { AuthUser } from "../types";
import { tokenStorage } from "../api/client";
import { fetchMe, login as apiLogin } from "../api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restore() {
      if (!tokenStorage.getAccess()) {
        if (active) setLoading(false);
        return;
      }
      try {
        const authUser = await fetchMe();
        if (active) setUser(authUser);
      } catch {
        tokenStorage.clear();
      } finally {
        if (active) setLoading(false);
      }
    }

    void restore();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiLogin({ email, password });
    tokenStorage.set(tokens.accessToken, tokens.refreshToken);
    setUser(await fetchMe());
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return context;
}
