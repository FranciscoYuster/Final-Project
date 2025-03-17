// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState, useContext } from "react";
import { baseUrl } from "../config"; // se extrae desde config.js     
import { Navigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!sessionStorage.getItem("access_token")) {
        return { error: "No token" };
      }
      const token = sessionStorage.getItem("access_token");

      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        return { error: "Unauthorized" };
      }

      const data = await response.json();
      setUser(data.user);
      return { success: true, user: data.user };

    } catch (error) {
      console.log(error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (response.ok) {
        // Guardar el token y establecer el tiempo de expiración (1 hora)
        const expiresIn = 3600 * 1000; // 1 hora en milisegundos
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('tokenExpirationTime', Date.now() + expiresIn);
        setUser(data.user);
        return data;
      } else {
        return { error: data.error || 'Error desconocido' };
      }
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  };

  const loginWithGoogle = async (googleResponse) => {
    try {
      const res = await fetch(`${baseUrl}/api/verificar-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        // Guarda el token y el tiempo de expiración (en ms) en sessionStorage
        sessionStorage.setItem('access_token', data.access_token);
        const expiresIn = data.expires_in; // Por ejemplo, 3600000 (1 hora)
        sessionStorage.setItem('tokenExpirationTime', Date.now() + expiresIn);
        setUser(data.user);
        return data;
      } else {
        return { error: data.error || 'Error desconocido' };
      }
    } catch (error) {
      return { error: error.message };
    }
  };
  

  const logout = async () => {
    if (sessionStorage.getItem("access_token")) {
      sessionStorage.clear();
      setUser(null);
    }
  };

  const register = async (datos) => {
    try {
      const response = await fetch(`${baseUrl}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error.message);
      return { error: error.message };
    }
  };

  const updatedProfile = async (datos) => {
    try {
      if (!sessionStorage.getItem("access_token"))
        return <Navigate to="/login" replace />;

      const token = sessionStorage.getItem("access_token");

      const response = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datos)
      });

      if (response.status === 401) <Navigate to="/login" replace />;
      const data = await response.json();
      setUser(data.user);
      return data;

    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${baseUrl}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Check your email for password reset instructions.' };
      } else {
        return { error: data.error || 'An error occurred.' };
      }
    } catch (err) {
      return { error: 'Failed to connect to the server.' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(`${baseUrl}/api/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }), // Asegúrate de enviar el parámetro correcto
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Your password has been successfully reset.' };
      } else {
        return { error: data.error || 'An error occurred while resetting your password.' };
      }
    } catch (err) {
      return { error: 'Failed to connect to the server.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading, checkAuth, updatedProfile, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
