import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Configurations = () => {
  const [config, setConfig] = useState({
    id: '',
    impuesto: 0,
    moneda: '',
    formato_facturacion: ''
  });
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem('access_token');

  // Función para obtener la configuración actual
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // Si la configuración no existe, se asume 404 y se establecen valores por defecto.
      if (response.status === 404) {
        setConfig({
          id: '',
          impuesto: 0,
          moneda: '',
          formato_facturacion: ''
        });
      } else if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      } else {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  // Enviar la configuración: si existe config.id se actualiza (PUT), si no se crea (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (config.id) {
        response = await fetch(`/api/configuraciones/${config.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(config)
        });
      } else {
        response = await fetch(`/api/configuraciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(config)
        });
      }
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      toast.success('Configuraciones guardadas correctamente');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuraciones');
    }
  };

  if (loading) return <p>Cargando configuraciones...</p>;

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1>Configuraciones Globales</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="impuesto" className="form-label">Impuesto (%)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            id="impuesto"
            name="impuesto"
            value={config.impuesto}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="moneda" className="form-label">Moneda</label>
          <input
            type="text"
            className="form-control"
            id="moneda"
            name="moneda"
            value={config.moneda}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="formato_facturacion" className="form-label">Formato de Facturación</label>
          <input
            type="text"
            className="form-control"
            id="formato_facturacion"
            name="formato_facturacion"
            value={config.formato_facturacion}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar Configuraciones
        </button>
      </form>
    </div>
  );
};

export default Configurations;
