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
    if (name === "impuesto") {
      // Convertir el valor ingresado (por ejemplo, 19) a decimal y redondear a 2 decimales
      const numericValue = parseFloat(value) / 100;
      setConfig((prev) => ({ ...prev, [name]: parseFloat(numericValue.toFixed(2)) }));
    } else {
      setConfig((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Enviar la configuración: actualizar (PUT) o crear (POST)
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
      <div className="card shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Configuraciones Globales</h3>
        </div>
        <div className="card-body" style={{ backgroundColor: "#f8f9fa" }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="impuesto" className="form-label">Impuesto (%)</label>
              <div className="input-group">
                <input
                  type="number"
                  step="1"  // Incrementa de 1 en 1
                  className="form-control rounded-pill"
                  id="impuesto"
                  name="impuesto"
                  // Se muestra el valor multiplicado por 100, de modo que 0.19 se visualice como 19
                  value={config.impuesto ? (config.impuesto * 100).toString() : ''}
                  onChange={handleChange}
                  required
                />
                <span className="input-group-text">%</span>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="moneda" className="form-label">Moneda</label>
              <input
                type="text"
                className="form-control rounded-pill"
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
                className="form-control rounded-pill"
                id="formato_facturacion"
                name="formato_facturacion"
                value={config.formato_facturacion}
                onChange={handleChange}
                required
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-success rounded-pill">
                Guardar Configuraciones
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Configurations;
