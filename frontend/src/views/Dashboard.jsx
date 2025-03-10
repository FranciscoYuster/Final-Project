import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [kpiData, setKpiData] = useState({
    moneyCollected: 0,
    moneyPending: 0,
    totalInvoices: 0,
    totalCustomers: 0,
  });

  const [latestInvoices, setLatestInvoices] = useState([]);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [{
      label: 'Ingresos Recientes',
      data: [],
      fill: false,
      borderColor: '#4bc0c0',
    }]
  });

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    // 1. Traer facturas del backend
    axios.get('/api/invoices', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const allInvoices = response.data; // Array con todas las facturas del usuario

      // 2. Últimas 3 facturas (o las que quieras mostrar)
      const lastThree = allInvoices.slice(-3); // Ajusta según el criterio que prefieras
      setLatestInvoices(lastThree);

      // 3. Calcular KPIs
      // - totalInvoices: número total de facturas
      const totalInvoices = allInvoices.length;

      // - moneyCollected: suma de 'total' de facturas con status "Paid" (o tu criterio)
      const moneyCollected = allInvoices
        .filter(inv => inv.status === 'Paid')
        .reduce((acc, inv) => acc + inv.total, 0);

      // - moneyPending: suma de 'total' de facturas con status "Pending"
      const moneyPending = allInvoices
        .filter(inv => inv.status === 'Pending')
        .reduce((acc, inv) => acc + inv.total, 0);

      // - totalCustomers: número de clientes únicos usando la propiedad "email" del objeto customer
      const uniqueCustomers = new Set(
        allInvoices
          .filter(inv => inv.customer && inv.customer.email)
          .map(inv => inv.customer.email)
      );
      const totalCustomers = uniqueCustomers.size;

      setKpiData({
        moneyCollected,
        moneyPending,
        totalInvoices,
        totalCustomers,
      });

      // 4. Agrupar facturas por mes para el gráfico de ingresos recientes
      const monthlyData = {};
      allInvoices.forEach(invoice => {
        const date = new Date(invoice.invoice_date);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + invoice.total;
      });

      const labels = Object.keys(monthlyData);
      const dataValues = Object.values(monthlyData);

      setRevenueData({
        labels,
        datasets: [{
          label: 'Ingresos Recientes',
          data: dataValues,
          fill: false,
          borderColor: '#4bc0c0',
        }]
      });
    })
    .catch(error => {
      console.error('Error fetching invoices:', error);
    });
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>
      {/* Tarjetas de KPIs */}
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Dinero Recogido</h5>
              <p className="card-text">${kpiData.moneyCollected.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Dinero Pendiente</h5>
              <p className="card-text">${kpiData.moneyPending.toFixed(2)}</p>
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
                    {/* Se muestra el nombre del cliente a través del objeto customer */}
                    <strong>{invoice.customer ? invoice.customer.name : 'Sin Cliente'}</strong>: {' $' + invoice.total.toFixed(2)} <br/>
                    <small>{new Date(invoice.invoice_date).toLocaleDateString()}</small>
                  </li>
                ))}
                {latestInvoices.length === 0 && (
                  <li className="list-group-item">
                    No hay facturas recientes
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
