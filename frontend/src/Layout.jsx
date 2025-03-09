// src/Layout.jsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Menu from './components/Menu/Menu';
import SideNav from './components/SideNav/SideNav';
import Home from './views/Home';
import Register from './views/Register';
import Login from './views/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './views/PrivateRoute';
import Error404 from './views/Error404';
import Productos from './views/Productos';
import Ventas from './views/Ventas';
import Compras from './views/Compras';
import Usuarios from './views/Usuarios';
import Proveedores from './views/Proveedores';
import Reportes from './views/Reportes';
import Services from './views/Services';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import Facturas from './views/Facturas';
import Dashboard from './views/Dashboard';
import Clientes from './views/Clientes';


const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <div className="d-flex" style={{ minHeight: '100vh', width: '100vw' }}>
          <SideNav />
          <div className="flex-grow-1" style={{
            marginLeft: '205px',
            padding: '30px',
            textAlign: 'left'
          }}
          >
            <Routes>
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/facturas"
                element={
                  <PrivateRoute>
                    <Facturas />
                  </PrivateRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <PrivateRoute>
                    <Clientes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/productos"
                element={
                  <PrivateRoute>
                    <Productos />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ventas"
                element={
                  <PrivateRoute>
                    <Ventas />
                  </PrivateRoute>
                }
              />
              <Route
                path="/compras"
                element={
                  <PrivateRoute>
                    <Compras />
                  </PrivateRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <PrivateRoute>
                    <Usuarios />
                  </PrivateRoute>
                }
              />
              <Route
                path="/proveed"
                element={
                  <PrivateRoute>
                    <Proveedores />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reportes />
                  </PrivateRoute>
                }
              />
              <Route path="/services" element={<Services />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </div>
        </div>
      ) : (
        <>
          <Menu />
          <div className="container mt-3">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/services" element={<Services />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </div>
        </>
      )}
    </>
  );
};

const Layout = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default Layout;
