import React, { useState, useEffect } from 'react';
import { FaTrash, FaSave, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Proveedores = () => {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Estado para controlar si se está editando o agregando
  const [editingProviderId, setEditingProviderId] = useState(null);
  const [isNew, setIsNew] = useState(false);
  // Estado para controlar si se muestra el modal
  const [showModal, setShowModal] = useState(false);
  // Formulario para crear/editar proveedor
  const [providerForm, setProviderForm] = useState({
    name: '',
    contact: '',
    phone: '',
    email: ''
  });

  // Obtiene el token del sessionStorage
  const token = sessionStorage.getItem('access_token');

  // Función para cargar proveedores
  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/providers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setProviders(data);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('No se pudieron cargar los proveedores.');
      toast.error('No se pudieron cargar los proveedores.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    setProviderForm({
      ...providerForm,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  // Abrir el modal para agregar un nuevo proveedor
  const handleAddNew = () => {
    setEditingProviderId(null);
    setProviderForm({
      name: '',
      contact: '',
      phone: '',
      email: ''
    });
    setIsNew(true);
    setShowModal(true);
  };

  // Abrir el modal para editar un proveedor
  const handleEdit = (provider) => {
    setEditingProviderId(provider.id);
    setProviderForm({
      name: provider.name,
      contact: provider.contact,
      phone: provider.phone,
      email: provider.email
    });
    setIsNew(false);
    setShowModal(true);
  };

  // Guardar proveedor (creación o actualización)
  const handleSaveProvider = async () => {
    if (!providerForm.name) {
      toast.error('El nombre es requerido.');
      return;
    }
    try {
      let response;
      if (isNew) {
        response = await fetch('/api/providers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(providerForm)
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const newProvider = await response.json();
        setProviders([...providers, newProvider]);
        toast.success('Proveedor creado exitosamente.');
      } else {
        response = await fetch(`/api/providers/${editingProviderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(providerForm)
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const updatedProvider = await response.json();
        setProviders(
          providers.map((prov) =>
            prov.id === updatedProvider.id ? updatedProvider : prov
          )
        );
        toast.success('Proveedor actualizado exitosamente.');
      }
      // Reiniciar formulario y cerrar modal
      setProviderForm({ name: '', contact: '', phone: '', email: '' });
      setEditingProviderId(null);
      setIsNew(false);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving provider:', err);
      toast.error('No se pudo guardar el proveedor.');
    }
  };

  // Cancelar y cerrar el modal
  const handleCancelModal = () => {
    setShowModal(false);
    setEditingProviderId(null);
    setIsNew(false);
    setProviderForm({ name: '', contact: '', phone: '', email: '' });
  };

  // Eliminar proveedor con confirmación
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      return;
    }
    try {
      const response = await fetch(`/api/providers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      setProviders(providers.filter((prov) => prov.id !== id));
      toast.success('Proveedor eliminado correctamente.');
    } catch (err) {
      console.error('Error deleting provider:', err);
      toast.error('No se pudo eliminar el proveedor.');
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1>Proveedores</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {isLoading ? (
        <div>Cargando proveedores...</div>
      ) : (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Nombre / Razón Social</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider, index) => (
              <tr key={provider.id}>
                <td>{index + 1}</td>
                <td>{provider.name}</td>
                <td>{provider.contact}</td>
                <td>{provider.phone}</td>
                <td>{provider.email}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(provider)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(provider.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button className="btn btn-primary" onClick={handleAddNew}>
        <FaPlus /> Agregar nuevo proveedor
      </button>

      {/* Modal para agregar/editar proveedor */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: 'block' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isNew ? 'Agregar Proveedor' : 'Editar Proveedor'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCancelModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Nombre / Razón Social</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={providerForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Contacto</label>
                  <input
                    type="text"
                    className="form-control"
                    name="contact"
                    value={providerForm.contact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={providerForm.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={providerForm.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveProvider}
                >
                  {isNew ? 'Guardar' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
