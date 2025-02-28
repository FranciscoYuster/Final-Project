import React, { createContext, useEffect, useState, useContext } from "react";
import { baseUrl } from "../config";
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
                sessionStorage.setItem('access_token', data.access_token);
                setUser(data.user);
                return data;
            } else {
                return { error: data.error || 'Error desconocido' };
            }
        } catch (error) {
            return { error: 'Error de conexión' };
        }
    };

    const logout = async () => {
        if (sessionStorage.getItem("access_token")) {
            sessionStorage.clear()
            setUser(null)
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
            })
            const data = await response.json();
            return data
        } catch (error) {
            console.log(error.message);
            return { error: error.message };
        }
    };

    const updatedProfile = async (datos) => {
        try {
            if (!sessionStorage.getItem("access_token"))
                return <Navigate to="/login" replace />

            const token = sessionStorage.getItem("access_token");

            const response = await fetch(`${baseUrl}/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datos)

            })

            if (response.status == 401) <Navigate to="/login" replace />;

            const data = await response.json();
            setUser(data.user);
            return data

        } catch (error) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    }






    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuth, updatedProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook para consumir el contexto
export const useAuth = () => useContext(AuthContext);