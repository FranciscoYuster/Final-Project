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
  Box,
  ListItemAvatar,
  Avatar
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

// Función para formatear números en dinero (CLP, sin decimales)
const formatMoney = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
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
    datasets: []
  });

  // Estado para almacenar comparativas de KPIs (mes actual vs mes anterior)
  const [comparativeKpi, setComparativeKpi] = useState({
    collected: { current: 0, previous: 0, percentage: 0 },
    pending: { current: 0, previous: 0, percentage: 0 },
    totalInvoices: { current: 0, previous: 0, percentage: 0 },
    totalCustomers: { current: 0, previous: 0, percentage: 0 },
  });

  // Función para calcular la variación porcentual
  const calculatePercentage = (current, previous) => {
    if (previous > 0) {
      return Math.round(((current - previous) / previous) * 100);
    }
    return current > 0 ? 100 : 0;
  };

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

      // KPIs globales (todas las facturas)
      const totalInvoices = allInvoices.length;
      const moneyCollected = allInvoices
        .filter(inv => inv.status === 'Pagada')
        .reduce((acc, inv) => acc + (inv.total_final || 0), 0);
      const moneyPending = allInvoices
        .filter(inv => inv.status === 'Pendiente')
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
      const monthlyDataCollected = {};
      const monthlyDataPending = {};

      allInvoices.forEach(invoice => {
        const date = new Date(invoice.invoice_date);
        // Obtén el mes en formato corto (por ejemplo, "ene", "feb", etc.)
        const month = date.toLocaleString('default', { month: 'short' });
        if (invoice.status === 'Pagada') {
          monthlyDataCollected[month] = (monthlyDataCollected[month] || 0) + (invoice.total_final || 0);
        } else if (invoice.status === 'Pendiente') {
          monthlyDataPending[month] = (monthlyDataPending[month] || 0) + (invoice.total_final || 0);
        }
      });

      const allMonthsSet = new Set([
        ...Object.keys(monthlyDataCollected),
        ...Object.keys(monthlyDataPending)
      ]);
      const monthsOrder = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const sortedLabels = [...allMonthsSet].sort(
        (a, b) => monthsOrder.indexOf(a.toLowerCase()) - monthsOrder.indexOf(b.toLowerCase())
      );

      const collectedValues = sortedLabels.map(month => monthlyDataCollected[month] || 0);
      const pendingValues = sortedLabels.map(month => monthlyDataPending[month] || 0);

      setRevenueData({
        labels: sortedLabels,
        datasets: [
          {
            label: 'Dinero Recogido',
            data: collectedValues,
            fill: false,
            borderColor: 'green',
          },
          {
            label: 'Dinero Pendiente',
            data: pendingValues,
            fill: false,
            borderColor: 'orange',
          }
        ]
      });

      // Cálculo de KPIs para mes actual y mes anterior
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentInvoices = allInvoices.filter(invoice => {
        const d = new Date(invoice.invoice_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const previousInvoices = allInvoices.filter(invoice => {
        const d = new Date(invoice.invoice_date);
        return d.getMonth() === previousMonth && d.getFullYear() === previousYear;
      });

      // Dinero Recogido
      const currentCollected = currentInvoices
        .filter(inv => inv.status === 'Pagada')
        .reduce((acc, inv) => acc + (inv.total_final || 0), 0);
      const previousCollected = previousInvoices
        .filter(inv => inv.status === 'Pagada')
        .reduce((acc, inv) => acc + (inv.total_final || 0), 0);

      // Dinero Pendiente
      const currentPending = currentInvoices
        .filter(inv => inv.status === 'Pendiente')
        .reduce((acc, inv) => acc + (inv.total_final || 0), 0);
      const previousPending = previousInvoices
        .filter(inv => inv.status === 'Pendiente')
        .reduce((acc, inv) => acc + (inv.total_final || 0), 0);

      // Total Facturas
      const currentTotalInvoices = currentInvoices.length;
      const previousTotalInvoices = previousInvoices.length;

      // Total Clientes (únicos por email)
      const currentCustomers = new Set(
        currentInvoices
          .filter(inv => inv.customer && inv.customer.email)
          .map(inv => inv.customer.email)
      ).size;
      const previousCustomers = new Set(
        previousInvoices
          .filter(inv => inv.customer && inv.customer.email)
          .map(inv => inv.customer.email)
      ).size;

      setComparativeKpi({
        collected: {
          current: currentCollected,
          previous: previousCollected,
          percentage: calculatePercentage(currentCollected, previousCollected),
        },
        pending: {
          current: currentPending,
          previous: previousPending,
          percentage: calculatePercentage(currentPending, previousPending),
        },
        totalInvoices: {
          current: currentTotalInvoices,
          previous: previousTotalInvoices,
          percentage: calculatePercentage(currentTotalInvoices, previousTotalInvoices),
        },
        totalCustomers: {
          current: currentCustomers,
          previous: previousCustomers,
          percentage: calculatePercentage(currentCustomers, previousCustomers),
        }
      });
    })
    .catch(error => {
      console.error('Error fetching invoices:', error);
    });
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ color: 'white' }}>
        Dashboard
      </Typography>
      
      {/* Tarjetas de KPIs con comparativas integradas */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Dinero Recogido">
            <Typography variant="h5">
              {formatMoney(kpiData.moneyCollected)}
            </Typography>
            <Typography variant="body2">
              Mes anterior: {formatMoney(comparativeKpi.collected.previous)}
            </Typography>
            <Typography variant="body2" sx={{ color: comparativeKpi.collected.percentage >= 0 ? 'green' : 'red' }}>
              {comparativeKpi.collected.percentage >= 0 ? '↑' : '↓'} {Math.abs(comparativeKpi.collected.percentage)}%
            </Typography>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Dinero Pendiente">
            <Typography variant="h5">
              {formatMoney(kpiData.moneyPending)}
            </Typography>
            <Typography variant="body2">
              Mes anterior: {formatMoney(comparativeKpi.pending.previous)}
            </Typography>
            <Typography variant="body2" sx={{ color: comparativeKpi.pending.percentage >= 0 ? 'green' : 'red' }}>
              {comparativeKpi.pending.percentage >= 0 ? '↑' : '↓'} {Math.abs(comparativeKpi.pending.percentage)}%
            </Typography>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Total Facturas">
            <Typography variant="h5">
              {kpiData.totalInvoices}
            </Typography>
            <Typography variant="body2">
              Mes anterior: {comparativeKpi.totalInvoices.previous}
            </Typography>
            <Typography variant="body2" sx={{ color: comparativeKpi.totalInvoices.percentage >= 0 ? 'green' : 'red' }}>
              {comparativeKpi.totalInvoices.percentage >= 0 ? '↑' : '↓'} {Math.abs(comparativeKpi.totalInvoices.percentage)}%
            </Typography>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard title="Total Clientes">
            <Typography variant="h5">
              {kpiData.totalCustomers}
            </Typography>
            <Typography variant="body2">
              Mes anterior: {comparativeKpi.totalCustomers.previous}
            </Typography>
            <Typography variant="body2" sx={{ color: comparativeKpi.totalCustomers.percentage >= 0 ? 'green' : 'red' }}>
              {comparativeKpi.totalCustomers.percentage >= 0 ? '↑' : '↓'} {Math.abs(comparativeKpi.totalCustomers.percentage)}%
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
                    <ListItemAvatar>
                      <Avatar>
                        {invoice.customer
                          ? invoice.customer.name.charAt(0).toUpperCase()
                          : 'S'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={invoice.customer ? invoice.customer.name : 'Sin Cliente'}
                      secondary={
                        <>
                          {formatMoney(invoice.total_final || 0)} <br />
                          {new Date(invoice.invoice_date).toLocaleDateString()} <br />
                          <Typography variant="body2" 
                            sx={{ 
                              color: invoice.status === 'Pagada' 
                                ? 'green' 
                                : invoice.status === 'Pendiente' 
                                  ? 'orange'
                                  : invoice.status === 'Anulada'
                                    ? 'red'
                                    : 'text.secondary'
                            }}
                          >
                            {invoice.status}
                          </Typography>
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
9