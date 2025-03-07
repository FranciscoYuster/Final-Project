// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [kpiData, setKpiData] = useState({
    moneyCollected: 0,
    moneyPending: 0,
    totalInvoices: 0,
    totalCustomers: 0,
  });

  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [{
      label: 'Recent Revenues',
      data: [],
      fill: false,
      borderColor: '#4bc0c0',
    }]
  });

  const [latestInvoices, setLatestInvoices] = useState([]);

  // En un caso real, aquí harías fetch de los datos desde tu API
  useEffect(() => {
    // Datos de ejemplo para los KPIs
    setKpiData({
      moneyCollected: 50000,
      moneyPending: 15000,
      totalInvoices: 120,
      totalCustomers: 80,
    });

    // Datos de ejemplo para el gráfico de ingresos recientes
    setRevenueData({
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Ingresos Recientes',
        data: [8000, 9000, 7500, 8500, 9500, 10000],
        fill: false,
        borderColor: '#4bc0c0',
      }]
    });

    // Datos de ejemplo para las últimas facturas
    setLatestInvoices([
      { id: 1, customer: 'Empresa A', amount: 1500, date: '2023-09-01' },
      { id: 2, customer: 'Empresa B', amount: 2500, date: '2023-09-03' },
      { id: 3, customer: 'Empresa C', amount: 1800, date: '2023-09-05' },
    ]);
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      <p>Bienvenido al panel de control. Aquí verás estadísticas, notificaciones y accesos rápidos a las funcionalidades del sistema.</p>
      
      {/* Tarjetas de KPIs */}
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Dinero Recogido</h5>
              <p className="card-text">${kpiData.moneyCollected}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Dinero Pendiente</h5>
              <p className="card-text">${kpiData.moneyPending}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Facturas</h5>
              <p className="card-text">{kpiData.totalInvoices}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Total Clientes</h5>
              <p className="card-text">{kpiData.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de ingresos recientes y card de últimas facturas */}
      <div className="row">
        <div className="col-md-8 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ingresos Recientes</h5>
              <Line data={revenueData} />
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Últimas Facturas</h5>
              <ul className="list-group list-group-flush">
                {latestInvoices.map(invoice => (
                  <li key={invoice.id} className="list-group-item">
                    <strong>{invoice.customer}</strong>: ${invoice.amount} <br/>
                    <small>{invoice.date}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
