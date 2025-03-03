// frontend/src/pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      <p>Bienvenido al panel de control. Aquí verás estadísticas, notificaciones y accesos rápidos a las funcionalidades del sistema.</p>
      
      {/* Ejemplo de tarjetas informativas */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Productos</h5>
              <p className="card-text">Visualiza el estado de inventario de productos.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ventas</h5>
              <p className="card-text">Revisa las ventas recientes y métricas clave.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Compras</h5>
              <p className="card-text">Accede a información de compras y proveedores.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Puedes agregar gráficos, tablas u otros componentes personalizados */}
    </div>
  );
};

export default Dashboard;
