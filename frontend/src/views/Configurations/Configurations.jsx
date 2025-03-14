import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Configurations = () => {
  const [config, setConfig] = useState({
    id: '',
    moneda: '',
    formato_facturacion: ''
  });
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem('access_token');

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
        setConfig({ moneda: '', formato_facturacion: '' });
      } else if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      } else {
        const data = await response.json();
        setConfig({
          id: data.id,
          moneda: data.moneda,
          formato_facturacion: data.formato_facturacion
        });
      }
    } catch (error) {
      toast.error('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = config.id ? 'PUT' : 'POST';
      const endpoint = config.id ? `/api/configuraciones/${config.id}` : '/api/configuraciones';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      toast.success('Configuraciones guardadas correctamente');
    } catch (error) {
      toast.error('Error al guardar configuraciones');
    }
  };

  if (loading) return <p>Cargando configuraciones...</p>;

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="card shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Configuraciones de Usuario</h3>
        </div>
        <div className="card-body" style={{ backgroundColor: "#f8f9fa" }}>
          <form onSubmit={handleSubmit}>
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
