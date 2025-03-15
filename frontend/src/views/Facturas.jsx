import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, InputGroup, FormControl, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaClock } from "react-icons/fa";

const Facturas = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [config, setConfig] = useState({
    id: "",
    impuesto: 0,
    moneda: "",
    formato_facturacion: ""
  });
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  // Para crear factura usamos "total" en el formulario que se convertirá a monto_base
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    customer_name: "",
    customer_email: "",
    total: "",
    status: "Pending",
    numero_comprobante: ""
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const token = sessionStorage.getItem("access_token");

  const fetchConfig = () => {
    setLoadingConfig(true);
    fetch("/api/configuraciones", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response =>
        response.ok
          ? response.json()
          : Promise.resolve({ id: "", impuesto: 0, moneda: "", formato_facturacion: "" })
      )
      .then(data => setConfig(data))
      .catch(err => {
        console.error("Error al cargar configuración:", err);
        toast.error("Error al cargar la configuración.");
      })
      .finally(() => setLoadingConfig(false));
  };

  const fetchInvoices = () => {
    setLoadingInvoices(true);
    fetch("/api/invoices", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => setInvoices(data))
      .catch(err => {
        console.error("Error al cargar facturas:", err);
        toast.error("Error al cargar facturas.");
      })
      .finally(() => setLoadingInvoices(false));
  };

  const fetchCustomers = () => {
    setLoadingCustomers(true);
    fetch("/api/customers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => setCustomers(data))
      .catch(err => {
        console.error("Error al cargar clientes:", err);
        toast.error("Error al cargar clientes.");
      })
      .finally(() => setLoadingCustomers(false));
  };

  useEffect(() => {
    fetchConfig();
    fetchInvoices();
    fetchCustomers();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const cliente = invoice.customer ? invoice.customer.name.toLowerCase() : (invoice.customer_name || "").toLowerCase();
    const email = invoice.customer ? invoice.customer.email.toLowerCase() : (invoice.customer_email || "").toLowerCase();
    const monto = invoice.monto_base ? invoice.monto_base.toString() : "";
    const status = invoice.status ? invoice.status.toLowerCase() : "";
    const query = searchQuery.toLowerCase();
    return cliente.includes(query) || email.includes(query) || monto.includes(query) || status.includes(query);
  });
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentItems = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
    setNewInvoice({
      ...newInvoice,
      customer: customerId,
      customer_name: selectedCustomer ? selectedCustomer.name : "",
      customer_email: selectedCustomer ? selectedCustomer.email : ""
    });
  };

  const handleSelectInvoice = (id) => {
    if (selectedInvoices.includes(id)) {
      setSelectedInvoices(selectedInvoices.filter(invoiceId => invoiceId !== id));
    } else {
      setSelectedInvoices([...selectedInvoices, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === currentItems.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(currentItems.map(invoice => invoice.id));
    }
  };

  const handleDeleteAllInvoices = () => {
    const deleteRequests = selectedInvoices.map(id =>
      fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      }).then(response => {
        if (!response.ok) throw new Error(`Error al eliminar factura con ID: ${id}`);
      })
    );
    Promise.all(deleteRequests)
      .then(() => {
        setInvoices(invoices.filter(invoice => !selectedInvoices.includes(invoice.id)));
        setSelectedInvoices([]);
        toast.success("Facturas eliminadas exitosamente.");
      })
      .catch(error => {
        console.error("Error eliminando facturas:", error);
        toast.error("Error al eliminar facturas.");
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewInvoice({
      customer: "",
      customer_name: "",
      customer_email: "",
      total: "",
      status: "Pending",
      numero_comprobante: ""
    });
  };

  const handleSubmitInvoice = (e) => {
    e.preventDefault();
    const baseTotal = parseFloat(newInvoice.total);
    if (isNaN(baseTotal)) {
      toast.error("El monto debe ser un número válido.");
      return;
    }
    const tax = config.impuesto || 0;
    const impuesto_aplicado = baseTotal * tax;
    const finalTotal = baseTotal + impuesto_aplicado;
    const invoiceData = {
      monto_base: baseTotal,
      impuesto_aplicado: impuesto_aplicado,
      total_final: finalTotal,
      status: newInvoice.status,
      numero_comprobante: newInvoice.numero_comprobante
    };
    if (newInvoice.customer) {
      invoiceData.customer_id = newInvoice.customer;
    } else {
      invoiceData.customer_name = newInvoice.customer_name;
      invoiceData.customer_email = newInvoice.customer_email;
    }
    fetch("/api/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(invoiceData)
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setInvoices([...invoices, data]);
        toast.success("Factura creada exitosamente.");
        handleCloseModal();
      })
      .catch(err => {
        console.error("Error al crear factura:", err);
        toast.error("Error al crear la factura.");
      });
  };

  const handleOpenEditModal = (invoice) => {
    // Se carga monto_base y status para la edición
    setEditInvoice({
      id: invoice.id,
      monto_base: invoice.monto_base,
      status: invoice.status
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditInvoice(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditInvoice({ ...editInvoice, [name]: value });
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const baseTotal = parseFloat(editInvoice.monto_base);
    if (isNaN(baseTotal)) {
      toast.error("El monto debe ser un número válido.");
      return;
    }
    const tax = config.impuesto || 0;
    const impuesto_aplicado = baseTotal * tax;
    const finalTotal = baseTotal + impuesto_aplicado;
    fetch(`/api/invoices/${editInvoice.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        monto_base: baseTotal,
        impuesto_aplicado: impuesto_aplicado,
        total_final: finalTotal,
        status: editInvoice.status
      })
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(updated => {
        setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
        toast.success("Factura actualizada correctamente.");
        handleCloseEditModal();
      })
      .catch(err => {
        console.error("Error al actualizar factura:", err);
        toast.error("Error al actualizar la factura.");
      });
  };

  const handleDelete = (id) => {
    fetch(`/api/invoices/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(() => {
        setInvoices(invoices.filter(invoice => invoice.id !== id));
        toast.success("Factura eliminada correctamente.");
      })
      .catch(err => {
        console.error("Error al eliminar factura:", err);
        toast.error("Error al eliminar la factura.");
      });
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Lista de Facturas</h1>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup className="w-50">
            <FormControl
              placeholder="Buscar factura..."
              aria-label="Buscar factura"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-pill"
            />
          </InputGroup>

          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="rounded-pill"
            style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
          >
            Crear Factura
          </Button>
        </div>

        <div className="table-responsive">
          <Table
            bordered
            hover
            className="mt-4"
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#E8F8FF",
              textAlign: "center",
            }}
          >
            <thead style={{ backgroundColor: "#0775e3" }}>
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={selectedInvoices.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded-circle"
                  />
                </th>
                <th>Cliente</th>
                <th>Email</th>
                <th>Monto Base</th>
                <th>Impuesto Aplicado</th>
                <th>Total Final</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleSelectInvoice(invoice.id)}
                      className="rounded-circle"
                    />
                  </td>
                  <td>{invoice.customer ? invoice.customer.name : invoice.customer_name}</td>
                  <td>{invoice.customer ? invoice.customer.email : invoice.customer_email}</td>
                  <td>
                    ${invoice.monto_base.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    ${invoice.impuesto_aplicado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    ${invoice.total_final.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : ""}</td>
                  <td>
                    {invoice.status === "Paid" ? (
                      <span style={{ color: "green" }}>
                        <FaCheck className="me-1" /> {invoice.status}
                      </span>
                    ) : (
                      <span style={{ color: "orange" }}>
                        <FaClock className="me-1" /> {invoice.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleOpenEditModal(invoice)}
                      className="me-2 rounded-pill"
                      style={{ backgroundColor: "#FFD700", borderColor: "#FFD700" }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(invoice.id)}
                      className="rounded-pill"
                      style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="mb-3">
          <Button
            variant="danger"
            disabled={selectedInvoices.length === 0}
            onClick={handleDeleteAllInvoices}
            className="rounded-pill"
            style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
          >
            Eliminar Seleccionadas
          </Button>
        </div>
        <Pagination className="mb-3 justify-content-center">
          {[...Array(totalPages)].map((_, index) => (
            <Pagination.Item
              key={index + 1}
              active={currentPage === index + 1}
              onClick={() => handlePageChange(index + 1)}
              style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>

        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Factura</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editInvoice && (
              <Form onSubmit={handleSubmitEdit}>
                <Form.Group controlId="formMontoBase">
                  <Form.Label>Monto Base</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Monto Base"
                    name="monto_base"
                    value={editInvoice.monto_base}
                    onChange={handleEditInputChange}
                    step="0.01"
                    required
                    className="rounded-pill"
                    style={{ borderColor: "#074de3" }}
                  />
                </Form.Group>
                <Form.Group controlId="formEstado" className="mt-2">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="status"
                    value={editInvoice.status || ""}
                    onChange={handleEditInputChange}
                    required
                    className="rounded-pill"
                    style={{ borderColor: "#074de3" }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </Form.Select>
                </Form.Group>
                <div className="mt-3 d-flex justify-content-end">
                  <Button variant="secondary" onClick={handleCloseEditModal} className="me-2 rounded-pill">
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" className="rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
                    Guardar cambios
                  </Button>
                </div>
              </Form>
            )}
          </Modal.Body>
        </Modal>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Crear Factura</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmitInvoice}>
              <Form.Group controlId="formCliente">
                <Form.Label>Cliente</Form.Label>
                <Form.Select
                  name="customer"
                  value={newInvoice.customer}
                  onChange={handleCustomerSelect}
                  required
                  className="rounded-pill"
                  style={{ borderColor: "#074de3" }}
                >
                  <option value="">Selecciona un cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="formMontoBase" className="mt-2">
                <Form.Label>Monto Base</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Monto Base"
                  name="total"
                  value={newInvoice.total}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, total: e.target.value })
                  }
                  step="0.01"
                  required
                  className="rounded-pill"
                  style={{ borderColor: "#074de3" }}
                />
                <small className="text-muted">
                  El impuesto se aplicará automáticamente (configuración global: {(config.impuesto * 100).toFixed(0)}%)
                </small>
              </Form.Group>
              <Form.Group controlId="formNumeroComprobante" className="mt-2">
                <Form.Label>Número de Comprobante</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Número de comprobante"
                  name="numero_comprobante"
                  value={newInvoice.numero_comprobante}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, numero_comprobante: e.target.value })
                  }
                  required
                  className="rounded-pill"
                  style={{ borderColor: "#074de3" }}
                />
              </Form.Group>
              <Form.Group controlId="formEstado" className="mt-2">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="status"
                  value={newInvoice.status}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, status: e.target.value })
                  }
                  required
                  className="rounded-pill"
                  style={{ borderColor: "#074de3" }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Form.Group>
              <div className="mt-3 d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCloseModal} className="me-2 rounded-pill">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" className="rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
                  Guardar Factura
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Facturas;
