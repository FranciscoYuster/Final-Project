export const baseUrl = import.meta.env.VITE_BASE_URL;
export const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Ubicaciones = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUbicacion, setNewUbicacion] = useState({ nombre: '', descripcion: '' });
  const [editingUbicacion, setEditingUbicacion] = useState(null);

  const token = sessionStorage.getItem('access_token');

  // Función para obtener todas las ubicaciones del inventario del usuario
  const fetchUbicaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener ubicaciones');
      const data = await response.json();
      setUbicaciones(data);
    } catch (error) {
      console.error('Error fetching ubicaciones:', error);
      toast.error('Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  // Agregar nueva ubicación
  const handleAddUbicacion = async (e) => {
    e.preventDefault();
    if (!newUbicacion.nombre) {
      toast.error('El nombre es requerido');
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUbicacion)
      });
      if (!response.ok) throw new Error('Error al crear la ubicación');
      const data = await response.json();
      setUbicaciones(prev => [...prev, data]);
      setNewUbicacion({ nombre: '', descripcion: '' });
      toast.success('Ubicación creada exitosamente');
    } catch (error) {
      console.error('Error creating ubicacion:', error);
      toast.error('Error al crear la ubicación');
    }
  };

  // Editar ubicación existente
  const handleEditUbicacion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones/${editingUbicacion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingUbicacion)
      });
      if (!response.ok) throw new Error('Error al actualizar la ubicación');
      const data = await response.json();
      setUbicaciones(prev =>
        prev.map(u => (u.id === data.id ? data : u))
      );
      setEditingUbicacion(null);
      toast.success('Ubicación actualizada exitosamente');
    } catch (error) {
      console.error('Error updating ubicacion:', error);
      toast.error('Error al actualizar la ubicación');
    }
  };

  // Eliminar ubicación
  const handleDeleteUbicacion = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar la ubicación');
      setUbicaciones(prev => prev.filter(u => u.id !== id));
      toast.success('Ubicación eliminada correctamente');
    } catch (error) {
      console.error('Error deleting ubicacion:', error);
      toast.error('Error al eliminar la ubicación');
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1>Gestión de Ubicaciones</h1>
      
      {/* Formulario para agregar nueva ubicación */}
      <form onSubmit={handleAddUbicacion} className="mb-4">
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input 
            type="text" 
            className="form-control" 
            value={newUbicacion.nombre}
            onChange={(e) =>
              setNewUbicacion({ ...newUbicacion, nombre: e.target.value })
            }
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea 
            className="form-control" 
            value={newUbicacion.descripcion}
            onChange={(e) =>
              setNewUbicacion({ ...newUbicacion, descripcion: e.target.value })
            }
          />
        </div>
        <button type="submit" className="btn btn-primary">Agregar Ubicación</button>
      </form>
      
      {/* Lista de ubicaciones */}
      {loading ? (
        <p>Cargando ubicaciones...</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ubicaciones.map((ubicacion) => (
              <tr key={ubicacion.id}>
                <td>{ubicacion.id}</td>
                <td>
                  {editingUbicacion && editingUbicacion.id === ubicacion.id ? (
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingUbicacion.nombre}
                      onChange={(e) =>
                        setEditingUbicacion({ ...editingUbicacion, nombre: e.target.value })
                      }
                      required
                    />
                  ) : (
                    ubicacion.nombre
                  )}
                </td>
                <td>
                  {editingUbicacion && editingUbicacion.id === ubicacion.id ? (
                    <textarea 
                      className="form-control" 
                      value={editingUbicacion.descripcion}
                      onChange={(e) =>
                        setEditingUbicacion({ ...editingUbicacion, descripcion: e.target.value })
                      }
                    />
                  ) : (
                    ubicacion.descripcion
                  )}
                </td>
                <td>
                  {editingUbicacion && editingUbicacion.id === ubicacion.id ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={handleEditUbicacion}>
                        Guardar
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingUbicacion(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => setEditingUbicacion(ubicacion)}>
                        Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUbicacion(ubicacion.id)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Ubicaciones;
