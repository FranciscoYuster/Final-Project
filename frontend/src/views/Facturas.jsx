import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFileCsv, FaFileExcel, FaFilePdf, FaEdit, FaTrash, FaCheck, FaClock } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Facturas = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [config, setConfig] = useState({
    id: '',
    impuesto: 0,     
    moneda: '',
    formato_facturacion: ''
  });
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Estado para la nueva factura (monto base)
  const [newInvoice, setNewInvoice] = useState({
    customer: '',         
    customer_name: '',
    customer_email: '',
    total: '',            
    status: 'Pending',
  });
  
  const token = sessionStorage.getItem('access_token');

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const response = await fetch('/api/configuraciones', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        setConfig({ id: '', impuesto: 0, moneda: '', formato_facturacion: '' });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('No se pudieron cargar las facturas.');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('No se pudieron cargar los clientes.');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
    setNewInvoice({
      ...newInvoice,
      customer: customerId,
      customer_name: selectedCustomer ? selectedCustomer.name : '',
      customer_email: selectedCustomer ? selectedCustomer.email : '',
    });
  };

  const handleInputChange = (e) => {
    setNewInvoice({ ...newInvoice, [e.target.name]: e.target.value });
  };

  // Función para cerrar el modal de creación de factura
  const handleCloseModal = () => {
    setShowModal(false);
    setNewInvoice({
      customer: '',
      customer_name: '',
      customer_email: '',
      total: '',
      status: 'Pending',
    });
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    try {
      const baseTotal = parseFloat(newInvoice.total);
      if (isNaN(baseTotal)) {
        toast.error("El monto debe ser un número válido.");
        return;
      }
      const tax = config.impuesto || 0;
      const impuesto_aplicado = baseTotal * tax;
      const finalTotal = baseTotal - impuesto_aplicado;
      const invoiceData = {
        monto_base: baseTotal,
        impuesto_aplicado: impuesto_aplicado,
        total_final: finalTotal,
        status: newInvoice.status,
      };
      if (newInvoice.customer) {
        invoiceData.customer_id = newInvoice.customer;
      } else {
        invoiceData.customer_name = newInvoice.customer_name;
        invoiceData.customer_email = newInvoice.customer_email;
      }
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setInvoices(prev => [...prev, data]);
      toast.success('Factura creada exitosamente.');
      handleCloseModal();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Error al crear la factura.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      await response.json();
      setInvoices(prev => prev.filter(invoice => invoice.id !== id));
      toast.success('Factura eliminada correctamente.');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Error al eliminar la factura.');
    }
  };

  const handleOpenEditModal = (invoice) => {
    setEditInvoice({
      id: invoice.id,
      monto_base: invoice.monto_base,
      status: invoice.status,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditInvoice(null);
  };

  const handleEditInputChange = (e) => {
    setEditInvoice({ ...editInvoice, [e.target.name]: e.target.value });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const baseTotal = parseFloat(editInvoice.monto_base);
      if (isNaN(baseTotal)) {
        toast.error("El monto debe ser un número válido.");
        return;
      }
      const tax = config.impuesto || 0;
      const impuesto_aplicado = baseTotal * tax;
      const finalTotal = baseTotal - impuesto_aplicado;
      const response = await fetch(`/api/invoices/${editInvoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          monto_base: baseTotal,
          impuesto_aplicado: impuesto_aplicado,
          total_final: finalTotal,
          status: editInvoice.status,
        }),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const updated = await response.json();
      setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
      toast.success('Factura actualizada correctamente.');
      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Error al actualizar la factura.');
    }
  };

  const columns = [
    {
      name: 'Cliente',
      selector: row => row.customer ? row.customer.name : '',
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.customer ? row.customer.email : '',
      sortable: true,
    },
    {
      name: 'Monto Base',
      selector: row => row.monto_base,
      sortable: true,
      format: row => `$${row.monto_base.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      name: 'Impuesto (%)',
      cell: row => `${(config.impuesto * 100).toFixed(0)}%`,
      sortable: false,
    },
    {
      name: 'Total Final',
      cell: row => `$${row.total_final.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sortable: false,
    },
    {
      name: 'Fecha',
      selector: row => row.invoice_date,
      sortable: true,
      cell: row => row.invoice_date ? new Date(row.invoice_date).toLocaleDateString() : ''
    },
    {
      name: 'Estado',
      selector: row => row.status,
      sortable: true,
      cell: row => row.status === 'Paid' 
                ? <span style={{ color: 'green' }}><FaCheck className="me-1" /> {row.status}</span>
                : <span style={{ color: 'orange' }}><FaClock className="me-1" /> {row.status}</span>
    },
    {
      name: 'Acciones',
      cell: row => (
        <>
          <button className="btn btn-warning btn-sm me-1" onClick={() => handleOpenEditModal(row)}>
            <FaEdit />
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
            <FaTrash />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontSize: '0.8rem' }} className="mt-4">
      <ToastContainer />
      <h1 className="mb-3">Facturas</h1>
      
      {/* Botones de exportación */}
      <div className="mb-2 d-flex gap-2">
        <button className="btn btn-success btn-sm" onClick={() => {/* exportar CSV */}}>
          <FaFileCsv className="me-1" /> Exportar CSV
        </button>
        <button className="btn btn-info btn-sm" onClick={() => {/* exportar XLSX */}}>
          <FaFileExcel className="me-1" /> Exportar XLSX
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => {/* exportar PDF */}}>
          <FaFilePdf className="me-1" /> Exportar PDF
        </button>
      </div>
      
      {/* Filtro global */}
      <div className="mb-2">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Buscar factura..."
          onChange={(e) => {
            const value = e.target.value.toLowerCase() || '';
            const filtered = invoices.filter(invoice => {
              const cliente = invoice.customer ? invoice.customer.name.toLowerCase() : '';
              const email = invoice.customer ? invoice.customer.email.toLowerCase() : '';
              const monto = invoice.monto_base.toString();
              const status = invoice.status.toLowerCase();
              return (
                cliente.includes(value) ||
                email.includes(value) ||
                monto.includes(value) ||
                status.includes(value)
              );
            });
            setInvoices(filtered);
            if (!value) fetchInvoices();
          }}
          style={{ fontSize: '0.8rem' }}
        />
      </div>
      
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          Crear Factura
        </button>
      </div>
      
      {(loadingInvoices || loadingCustomers || loadingConfig) && <div>Cargando datos...</div>}
      
      <DataTable
        columns={columns}
        data={invoices}
        customStyles={{
          rows: { style: { fontSize: '0.8rem', padding: '4px' } },
          headCells: { style: { fontSize: '0.8rem', padding: '4px' } },
          cells: { style: { fontSize: '0.8rem', padding: '4px' } },
        }}
        pagination
        paginationPerPage={5}
        paginationComponentOptions={{ rowsPerPageText: 'Filas por página:' }}
        defaultSortField="invoice_date"
        highlightOnHover
        dense
      />
      
      {/* Modal para editar factura */}
      {showEditModal && editInvoice && (
        <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <form onSubmit={handleSubmitEdit}>
                <div className="modal-header py-2">
                  <h5 className="modal-title">Editar Factura</h5>
                  <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
                </div>
                <div className="modal-body py-2">
                  <div className="mb-2">
                    <label className="form-label">Monto Base</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="monto_base"
                      value={editInvoice.monto_base}
                      onChange={handleEditInputChange}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select form-select-sm"
                      name="status"
                      value={editInvoice.status}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseEditModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para crear factura */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <form onSubmit={handleSubmitInvoice}>
                <div className="modal-header py-2">
                  <h5 className="modal-title">Crear Factura</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body py-2">
                  <div className="mb-2">
                    <label className="form-label">Cliente</label>
                    <select
                      className="form-select form-select-sm"
                      name="customer"
                      value={newInvoice.customer}
                      onChange={handleCustomerSelect}
                      required
                    >
                      <option value="">Selecciona un cliente</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Monto Base</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="total"
                      value={newInvoice.total}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                    />
                    <small className="text-muted">
                      El impuesto se aplicará automáticamente (configuración global: {(config.impuesto * 100).toFixed(0)}%)
                    </small>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select form-select-sm"
                      name="status"
                      value={newInvoice.status}
                      onChange={handleInputChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Guardar Factura
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
