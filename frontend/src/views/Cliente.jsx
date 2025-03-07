import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Cliente = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer_name: '',
    customer_email: '',
    total: '',
  });

  // Función para obtener las facturas desde el backend
  const fetchInvoices = async () => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await axios.get('/api/invoices', {
        headers: { Authorization:  `Bearer ${token}` }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar las facturas por el término de búsqueda (por nombre o email)
  const filteredInvoices = invoices.filter(invoice =>
    invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/invoices/${id}`);
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewInvoice({ customer_name: '', customer_email: '', total: '' });
  };

  const handleInputChange = (e) => {
    setNewInvoice({
      ...newInvoice,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    const invoiceData = {
      customer_name: newInvoice.customer_name,
      customer_email: newInvoice.customer_email,
      total: parseFloat(newInvoice.total),
      status: 'Pending',
    };

      const token = sessionStorage.getItem('access_token');

    try {
      const response = await axios.post('/api/invoices', invoiceData, {
        headers: {
          Authorization: `Bearer ${token}`, // Asegúrate de enviar el token JWT
        },
      });
      setInvoices([...invoices, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };
  

  return (
    <div className="container mt-4">
      <h1>Invoices</h1>
      
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
              <td>${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
              <td>{invoice.status}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(invoice.id)}>
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

      {/* Ejemplo de paginación simple */}
      <nav>
        <ul className="pagination justify-content-center">
          <li className="page-item active">
            <button className="page-link">1</button>
          </li>
          {/* Puedes ampliar la paginación según tus necesidades */}
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
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="customer_name"
                      value={newInvoice.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Customer Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="customer_email"
                      value={newInvoice.customer_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* Fondo de overlay para el modal */}
        </div>
      )}
    </div>
  );
};

export default Cliente;
