import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Clientes = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [editCustomer, setEditCustomer] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
  });

  const token = sessionStorage.getItem('access_token');

  // Función para obtener clientes con indicador de carga
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('No se pudieron cargar los clientes.');
      toast.error('No se pudieron cargar los clientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar modal de confirmación para eliminar un cliente
  const confirmDelete = (id) => {
    setCustomerToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/customers/${customerToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      await response.json();
      setCustomers(customers.filter(customer => customer.id !== customerToDelete));
      toast.success('Cliente eliminado correctamente.');
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('No se pudo eliminar el cliente.');
      toast.error('No se pudo eliminar el cliente.');
    } finally {
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  // Modal de creación
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCustomer({ name: '', email: '', phone: '' });
    setError(null);
  };

  const handleInputChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  // Validación para evitar duplicados de nombre o email
  const isDuplicateCustomer = () => {
    return customers.some(customer =>
      customer.name.toLowerCase() === newCustomer.name.toLowerCase() ||
      customer.email.toLowerCase() === newCustomer.email.toLowerCase()
    );
  };

  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    if (isDuplicateCustomer()) {
      setError('El nombre o email ya están en uso.');
      toast.error('El nombre o email ya están en uso.');
      return;
    }
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newCustomer),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setCustomers([...customers, data]);
      handleCloseModal();
      toast.success('Cliente creado exitosamente.');
    } catch (err) {
      console.error('Error creating customer:', err);
      setError('No se pudo crear el cliente.');
      toast.error('No se pudo crear el cliente.');
    }
  };

  // Modal de edición
  const handleOpenEditModal = (customer) => {
    setEditCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditCustomer({ id: null, name: '', email: '', phone: '' });
    setError(null);
  };

  const handleEditInputChange = (e) => {
    setEditCustomer({
      ...editCustomer,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmitEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/customers/${editCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editCustomer.name,
          email: editCustomer.email,
          phone: editCustomer.phone,
        }),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      const updatedCustomers = customers.map(customer =>
        customer.id === data.id ? data : customer
      );
      setCustomers(updatedCustomers);
      handleCloseEditModal();
      toast.success('Cliente actualizado exitosamente.');
    } catch (err) {
      console.error('Error updating customer:', err);
      setError('No se pudo actualizar el cliente.');
      toast.error('No se pudo actualizar el cliente.');
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1>Clientes</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="d-flex justify-content-between align-items-center my-3">
        <div className="w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          Crear Cliente
        </button>
      </div>
      
      {isLoading ? (
        <div>Cargando clientes...</div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>
                  <button 
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleOpenEditModal(customer)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => confirmDelete(customer.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <nav>
        <ul className="pagination justify-content-center">
          <li className="page-item active">
            <button className="page-link">1</button>
          </li>
        </ul>
      </nav>

      {/* Modal para crear un nuevo cliente */}
      {showModal && (
        <div className="modal show fade" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmitCustomer}>
                <div className="modal-header">
                  <h5 className="modal-title">Crear Cliente</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCloseModal}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="name" 
                      value={newCustomer.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email" 
                      value={newCustomer.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="phone" 
                      value={newCustomer.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar un cliente */}
      {showEditModal && (
        <div className="modal show fade" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmitEditCustomer}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar Cliente</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCloseEditModal}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="name" 
                      value={editCustomer.name}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email" 
                      value={editCustomer.email}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="phone" 
                      value={editCustomer.phone}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseEditModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Actualizar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="modal show fade" style={{ display: 'block' }} aria-modal="true" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={handleCancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar este cliente?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCancelDelete}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
