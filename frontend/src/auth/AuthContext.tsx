import * as React from "react";
import {
  getCurrentUser,
  removeCurrentUser,
  removeToken,
  setCurrentUser,
  isAuthenticated as hasToken,
  type UserProfile,
} from "../api/client";
import { normalizeRole, type UserRole } from "./roleAccess";

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole;
  setUser: (user: UserProfile) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<UserProfile | null>(() =>
    getCurrentUser(),
  );

  // Keep the in-memory user in sync across tabs.
  React.useEffect(() => {
    const sync = () => setUserState(getCurrentUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const setUser = React.useCallback((next: UserProfile) => {
    setCurrentUser(next);
    setUserState(next);
  }, []);

  const logout = React.useCallback(() => {
    removeCurrentUser();
    removeToken();
    setUserState(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      role: normalizeRole(user?.role),
      setUser,
      logout,
      isAuthenticated: hasToken,
    }),
    [user, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
