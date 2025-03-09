import React, { useState, useEffect } from 'react';

const Clientes = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Función para obtener la lista de clientes desde el backend
  const fetchCustomers = () => {
    const token = sessionStorage.getItem('access_token');
    fetch('/api/customers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setCustomers(data);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Función para filtrar clientes en base al término de búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para eliminar un cliente
  const handleDelete = (id) => {
    const token = sessionStorage.getItem('access_token');
    fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setCustomers(customers.filter(customer => customer.id !== id));
      })
      .catch(error => {
        console.error('Error deleting customer:', error);
      });
  };

  // Funciones para controlar el modal de creación de clientes
  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
    });
  };

  const handleInputChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
  };

  // Función para enviar el formulario y crear un nuevo cliente
  const handleSubmitCustomer = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('access_token');
    fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newCustomer),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setCustomers([...customers, data]);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error creating customer:', error);
      });
  };

  return (
    <div className="container mt-4">
      <h1>Clientes</h1>
      
      {/* Barra de búsqueda y botón para crear cliente */}
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
      
      {/* Tabla de clientes */}
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
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDelete(customer.id)}
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

      {/* Ejemplo de paginación simple */}
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
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
