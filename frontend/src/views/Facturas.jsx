import React, { useState, useEffect } from 'react';

const Facturas = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]); // Estado para clientes
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Inicializa newInvoice incluyendo un campo 'customer' para guardar el id del cliente seleccionado
  const [newInvoice, setNewInvoice] = useState({
    customer: '', // nuevo campo para almacenar el id del cliente
    customer_name: '',
    customer_email: '',
    total: '',
    status: 'Pending',
  });

  // Función para obtener las facturas desde el backend
  const fetchInvoices = () => {
    const token = sessionStorage.getItem('access_token');
    fetch('/api/invoices', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setInvoices(data);
      })
      .catch(error => {
        console.error('Error fetching invoices:', error);
      });
  };

  // Función para obtener la lista de clientes
  const fetchCustomers = () => {
    const token = sessionStorage.getItem('access_token');
    fetch('/api/customers', { // Asegúrate de que este endpoint exista y devuelva la lista de clientes
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

  // Se llama al montar el componente para facturas y clientes
  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar las facturas por el término de búsqueda (por nombre o email)
  const filteredInvoices = invoices.filter(invoice =>
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    const token = sessionStorage.getItem('access_token');
    fetch(`/api/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(() => {
        setInvoices(invoices.filter(invoice => invoice.id !== id));
      })
      .catch(error => {
        console.error('Error deleting invoice:', error);
      });
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewInvoice({ 
      customer: '',
      customer_name: '', 
      customer_email: '', 
      total: '', 
      status: 'Pending' 
    });
  };

  // Actualiza el newInvoice cuando se selecciona un cliente desde el dropdown
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
    setNewInvoice({
      ...newInvoice,
      customer: customerId,
      customer_name: selectedCustomer ? selectedCustomer.name : '',
      customer_email: selectedCustomer ? selectedCustomer.email : ''
    });
  };

  const handleInputChange = (e) => {
    setNewInvoice({
      ...newInvoice,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitInvoice = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('access_token');

    const invoiceData = {
      customer_name: newInvoice.customer_name,
      customer_email: newInvoice.customer_email,
      total: parseFloat(newInvoice.total),
      status: newInvoice.status,
    };

    fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(invoiceData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setInvoices([...invoices, data]);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error creating invoice:', error);
      });
  };
  
  return (
    <div className="container mt-4">
      <h1>Facturas</h1>
      
      {/* Barra de búsqueda y botón para crear factura */}
      <div className="d-flex justify-content-between align-items-center my-3">
        <div className="w-50">
          <input
            type="text"
            className="form-control"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          Create Invoice
        </button>
      </div>
      
      {/* Tabla de facturas */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Email</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map(invoice => (
            <tr key={invoice.id}>
              <td>
                <div className="d-flex align-items-center">
                  <img 
                    src={invoice.profilePicture || 'https://via.placeholder.com/40'}
                    alt={`${invoice.customer_name}'s profile`}
                    className="rounded-circle me-2"
                    width="40" 
                    height="40"
                  />
                  {invoice.customer_name}
                </div>
              </td>
              <td>{invoice.customer_email}</td>
              <td>${invoice.total.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}</td>
              <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
              <td>{invoice.status}</td>
              <td>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDelete(invoice.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredInvoices.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center">No invoices found</td>
            </tr>
          )}
        </tbody>
      </table>

      <nav>
        <ul className="pagination justify-content-center">
          <li className="page-item active">
            <button className="page-link">1</button>
          </li>
        </ul>
      </nav>

      {/* Modal para crear una nueva factura */}
      {showModal && (
        <div className="modal show fade" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmitInvoice}>
                <div className="modal-header">
                  <h5 className="modal-title">Create Invoice</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCloseModal}
                  />
                </div>
                <div className="modal-body">
                  {/* Campo de selección de cliente */}
                  <div className="mb-3">
                    <label className="form-label">Customer</label>
                    <select
                      className="form-select"
                      name="customer"
                      value={newInvoice.customer}
                      onChange={handleCustomerSelect}
                      required
                    >
                      <option value="">Select a customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Campo de Amount */}
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      name="total"
                      value={newInvoice.total}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                    />
                  </div>
                  {/* Campo para seleccionar status */}
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={newInvoice.status}
                      onChange={handleInputChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Save Invoice
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

export default Facturas;
