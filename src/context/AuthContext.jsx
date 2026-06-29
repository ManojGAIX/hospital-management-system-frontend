import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    localStorage.setItem("token", data.token);

    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");

    setUser(null);
  };

  const hasPrivilege = (page) => {
    return user?.privileges?.includes(page);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasPrivilege,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);