import { createContext, useContext, useEffect, useState } from "react";

// Standalone Auth context for the cloned "Espírito Santo AI" pages.
// Uses localStorage only — independent of Supabase auth used elsewhere.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lf_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    setLoading(false);
  }, []);

  const login = async (email, _password) => {
    const u = { id: "demo", email, name: email.split("@")[0] || "Demo", role: "admin" };
    localStorage.setItem("lf_token", "mock-token");
    localStorage.setItem("lf_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const u = {
      id: "demo",
      email: payload?.email || "demo@local",
      name: payload?.name || "Demo",
      role: "admin",
    };
    localStorage.setItem("lf_token", "mock-token");
    localStorage.setItem("lf_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("lf_token");
    localStorage.removeItem("lf_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
