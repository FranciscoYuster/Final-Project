import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box
} from '@mui/material';
import styled from '@emotion/styled';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const StyledCard = ({ title, children }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

// Opciones personalizadas para el gráfico
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 14,
        },
      },
    },
    title: {
      display: true,
      text: 'Ingresos Recientes',
      font: {
        size: 16,
      },
    },
  },
  elements: {
    line: {
      tension: 0.4, // Líneas con curvatura
      borderWidth: 3,
    },
    point: {
      radius: 5,
      hoverRadius: 7,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: 'rgba(0,0,0,0.1)',
      },
      ticks: {
        beginAtZero: true,
      },
    },
  },
};

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

    axios.get('/api/invoices', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      const allInvoices = response.data;

      // Últimas 3 facturas
      const lastThree = allInvoices.slice(-3);
      setLatestInvoices(lastThree);

      // Calcular KPIs
      const totalInvoices = allInvoices.length;
      const moneyCollected = allInvoices
        .filter(inv => inv.status === 'Paid')
        .reduce((acc, inv) => acc + (inv.total_final || 0), 0);
      const moneyPending = allInvoices
        .filter(inv => inv.status === 'Pending')
        .reduce((acc, inv) => acc + (inv.total_final || 0), 0);
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

      // Agrupar facturas por mes para el gráfico
      const monthlyData = {};
      allInvoices.forEach(invoice => {
        const date = new Date(invoice.invoice_date);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + (invoice.total_final || 0);
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Tarjetas de KPIs */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Dinero Recogido">
            <Typography variant="h5">
              ${kpiData.moneyCollected.toFixed(2)}
            </Typography>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Dinero Pendiente">
            <Typography variant="h5">
              ${kpiData.moneyPending.toFixed(2)}
            </Typography>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Total Facturas">
            <Typography variant="h5">
              {kpiData.totalInvoices}
            </Typography>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Total Clientes">
            <Typography variant="h5">
              {kpiData.totalCustomers}
            </Typography>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Gráfico y lista de últimas facturas */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <StyledCard title="Ingresos Recientes">
            <Box sx={{ height: 300 }}>
              <Line data={revenueData} options={chartOptions} />
            </Box>
          </StyledCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledCard title="Últimas Facturas">
            <List>
              {latestInvoices.length > 0 ? (
                latestInvoices.map(invoice => (
                  <ListItem key={invoice.id} divider>
                    <ListItemText
                      primary={invoice.customer ? invoice.customer.name : 'Sin Cliente'}
                      secondary={
                        <>
                          ${ (invoice.total_final || 0).toFixed(2) } <br />
                          { new Date(invoice.invoice_date).toLocaleDateString() }
                        </>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No hay facturas recientes" />
                </ListItem>
              )}
            </List>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
