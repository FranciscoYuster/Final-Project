import React, { useState, useEffect } from 'react';
import { Button, FormControl, InputGroup, Table, Form, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus } from 'react-icons/fa';
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

  const [selectedCustomers, setSelectedCustomers] = useState([]);

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

  // Función para manejar la selección de un cliente
  const handleSelectCustomer = (id) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(customerId => customerId !== id) : [...prev, id]
    );
  };

  // Función para manejar la selección de todos los clientes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(customers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Función para eliminar los clientes seleccionados
  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedCustomers.map(async (id) => {
          const response = await fetch(`/api/customers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          await response.json();
        })
      );
      setCustomers(customers.filter(customer => !selectedCustomers.includes(customer.id)));
      setSelectedCustomers([]);
      toast.success('Clientes eliminados correctamente.');
    } catch (err) {
      console.error('Error deleting customers:', err);
      setError('No se pudieron eliminar los clientes.');
      toast.error('No se pudieron eliminar los clientes.');
    }
  };

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
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Clientes</h1>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup className="w-50">
            <FormControl
              type="text"
              className="rounded-pill"
              placeholder="Buscar clientes"
              aria-label='Buscar clientes'
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          <Button variant='primary' className="rounded-pill" onClick={handleOpenModal}>
            <FaPlus className="me-1" /> Crear Nuevo Cliente
          </Button>
        </div>



        {isLoading ? (
          <div>Cargando clientes...</div>
        ) : (
          <Table bordered hover className="mt-4" style={{
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: "#E8F8FF",
            textAlign: "center",
          }}>
            <thead>
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedCustomers.length === customers.length && customers.length > 0}
                  />
                </th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                    />
                  </td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <Button
                      variant="warning"
                      className="me-2 rounded-pill"
                      onClick={() => handleOpenEditModal(customer)}
                      style={{ backgroundColor: "#FFD700", borderColor: "#FFD700" }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      className="rounded-pill"
                      onClick={() => confirmDelete(customer.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
              <Button
          variant="danger"
          className="mb-3 rounded-pill justify-content-start"
          onClick={handleDeleteSelected}
          disabled={selectedCustomers.length === 0}
        >
          Eliminar Seleccionados
        </Button>
      </div>

      {/* Modal Eliminar confirmación */}
      <Modal show={showDeleteModal} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar este cliente?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal Crear Cliente */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitCustomer}>
            <Form.Group controlId="customerName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
              className="rounded-pill"
                type="text"
                placeholder="Ingrese el nombre"
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="customerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
              className="rounded-pill"
                type="email"
                placeholder="Ingrese el email"
                name="email"
                value={newCustomer.email}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="customerPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
              className="rounded-pill"
                type="text"
                placeholder="Ingrese el teléfono"
                name="phone"
                value={newCustomer.phone}
                onChange={handleInputChange}
              />
            </Form.Group>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <Button variant="primary" type="submit" className="w-100 mt-3 rounded-pill">
              Crear Cliente
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Clientes;
