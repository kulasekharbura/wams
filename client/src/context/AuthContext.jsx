import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. UPDATE: Check localStorage when the app first loads
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("wams_user");
    // If a user is saved in storage, parse the JSON string back into an object
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    // 2. UPDATE: Save the user data to localStorage so it survives a refresh
    localStorage.setItem("wams_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // 3. UPDATE: Clear the data when they explicitly log out
    localStorage.removeItem("wams_user");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
