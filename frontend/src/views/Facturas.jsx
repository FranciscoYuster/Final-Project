import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, InputGroup, FormControl, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaCheck, FaClock, FaBan, FaPlus } from "react-icons/fa";

const Facturas = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  // La configuración se obtiene desde la API; se espera que tenga impuesto 0.19 y moneda "CLP"
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  // Para crear factura se utiliza "total" para calcular el monto_base y se añade "tipo"
  const [newInvoice, setNewInvoice] = useState({
    customer: "",
    customer_name: "",
    customer_email: "",
    total: "",
    tipo: "Factura", // Opciones: "Factura" o "Boleta"
    status: "Pendiente",
    numero_comprobante: ""
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  // Estados para modales de ocultación y anulación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [invoiceToAnular, setInvoiceToAnular] = useState(null);
  const [anularMotive, setAnularMotive] = useState("NOTA DE CRÉDITO ELECTRÓNICA");
  const [anularOtherMotive, setAnularOtherMotive] = useState("");
  const [anularNumeroNota, setAnularNumeroNota] = useState("");
  // Estado para controlar las facturas ocultas (por ID)
  const [hiddenInvoices, setHiddenInvoices] = useState([]);
  // Bandera para alternar si se muestran o no las facturas ocultas
  const [showHidden, setShowHidden] = useState(false);

  const token = sessionStorage.getItem("access_token");

  // Cargar configuración del usuario
  const fetchConfig = () => {
    setLoadingConfig(true);
    fetch("/api/configuraciones", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
      .then(data => setConfig(data))
      .catch(err => {
        console.error("Error al cargar configuración:", err);
        toast.error("Error al cargar la configuración.");
      })
      .finally(() => setLoadingConfig(false));
  };

  // Cargar facturas
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
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
      .then(data => setInvoices(data))
      .catch(err => {
        console.error("Error al cargar facturas:", err);
        toast.error("Error al cargar facturas.");
      })
      .finally(() => setLoadingInvoices(false));
  };

  // Cargar clientes
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
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
      })
      .then(data => setCustomers(data))
      .catch(err => {
        console.error("Error al cargar clientes:", err);
        toast.error("Error al cargar clientes.");
      })
      .finally(() => setLoadingCustomers(false));
  };

  // Al cargar el componente, obtenemos el estado guardado (si existe)
  useEffect(() => {
    const storedHiddenInvoices = localStorage.getItem("hiddenInvoices");
    if (storedHiddenInvoices) {
      setHiddenInvoices(JSON.parse(storedHiddenInvoices));
    }
  }, []);

  // Cada vez que cambie el estado de hiddenInvoices, lo guardamos en localStorage
  useEffect(() => {
    localStorage.setItem("hiddenInvoices", JSON.stringify(hiddenInvoices));
  }, [hiddenInvoices]);

  useEffect(() => {
    fetchConfig();
    fetchInvoices();
    fetchCustomers();
  }, []);

  if (!config) return <p>Cargando configuración...</p>;

  // Filtrado de facturas, incluyendo el campo "tipo". Además, se omiten las facturas ocultas si showHidden es false.
  const filteredInvoices = invoices.filter(invoice => {
    const cliente = invoice.customer ? invoice.customer.name.toLowerCase() : (invoice.customer_name || "").toLowerCase();
    const email = invoice.customer ? invoice.customer.email.toLowerCase() : (invoice.customer_email || "").toLowerCase();
    const monto = invoice.monto_base ? invoice.monto_base.toString() : "";
    const status = invoice.status ? invoice.status.toLowerCase() : "";
    const tipo = invoice.tipo ? invoice.tipo.toLowerCase() : "";
    const query = searchQuery.toLowerCase();
    return (
      cliente.includes(query) ||
      email.includes(query) ||
      monto.includes(query) ||
      status.includes(query) ||
      tipo.includes(query)
    );
  }).filter(invoice => showHidden || !hiddenInvoices.includes(invoice.id));

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

  // Ocultar (marcar como oculta) una factura
  const handleOcultarInvoice = (id) => {
    if (!hiddenInvoices.includes(id)) {
      setHiddenInvoices([...hiddenInvoices, id]);
      toast.info("Factura ocultada.");
    }
  };

  // Mostrar (desocultar) una factura
  const handleMostrarInvoice = (id) => {
    setHiddenInvoices(hiddenInvoices.filter(hiddenId => hiddenId !== id));
    toast.info("Factura mostrada.");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewInvoice({
      customer: "",
      customer_name: "",
      customer_email: "",
      total: "",
      tipo: "Factura",
      status: "Pendiente",
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
    const tax = config.impuesto; // 0.19
    const impuesto_aplicado = baseTotal * tax;
    const finalTotal = baseTotal + impuesto_aplicado;
    const invoiceData = {
      monto_base: baseTotal,
      impuesto_aplicado: impuesto_aplicado,
      total_final: finalTotal,
      tipo: newInvoice.tipo, // Enviar el tipo ("Factura" o "Boleta")
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

  // Función para cambiar el estado de una factura
  const handleChangeStatus = (invoiceId, newStatus) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    // Si la factura ya está Pagada, no se permite cambiar el estado (excepto anulación)
    if (invoice.status === "Pagada") {
      toast.error("No se puede cambiar el estado de una factura pagada.");
      return;
    }

    fetch(`/api/invoices/${invoiceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        monto_base: invoice.monto_base,
        impuesto_aplicado: invoice.impuesto_aplicado,
        total_final: invoice.total_final,
        status: newStatus,
        tipo: invoice.tipo
      })
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(updated => {
        setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
        toast.success(`Factura marcada como ${newStatus}.`);
      })
      .catch(err => {
        console.error("Error al actualizar el estado:", err);
        toast.error("Error al actualizar el estado de la factura.");
      });
  };

  // Modal para confirmar ocultar factura (acción en lugar de eliminar)
  const confirmDeleteInvoice = (id) => {
    setInvoiceToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirmar y ejecutar la ocultación individual
  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      handleOcultarInvoice(invoiceToDelete);
      setInvoiceToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Modal para anular factura: incluye mensaje de advertencia y campo para el número de nota
  const handleOpenAnularModal = (invoice) => {
    setInvoiceToAnular(invoice);
    setAnularMotive("NOTA DE CRÉDITO ELECTRÓNICA"); // Valor por defecto
    setAnularOtherMotive("");
    setAnularNumeroNota("");
    setShowAnularModal(true);
  };

  // Confirmar anulación: se envía el motivo y el número de nota en la petición PUT
  const handleConfirmAnular = () => {
    if (!invoiceToAnular) return;
    const motive = anularMotive === "Otro" ? anularOtherMotive : anularMotive;
    fetch(`/api/invoices/${invoiceToAnular.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        monto_base: invoiceToAnular.monto_base,
        impuesto_aplicado: invoiceToAnular.monto_base * config.impuesto,
        total_final: invoiceToAnular.monto_base + (invoiceToAnular.monto_base * config.impuesto),
        status: "Anular",
        tipo: invoiceToAnular.tipo,
        motivo: motive,
        numero_nota: anularNumeroNota
      })
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(updated => {
        setInvoices(invoices.map(inv => inv.id === updated.id ? updated : inv));
        toast.success("Factura anulada correctamente.");
        setShowAnularModal(false);
        setInvoiceToAnular(null);
      })
      .catch(err => {
        console.error("Error al anular factura:", err);
        toast.error("Error al anular la factura.");
      });
  };

  // Función para formatear valores a moneda CLP
  const formatCurrency = (value) => {
    const amount = parseFloat(value);
    if (isNaN(amount)) return "";
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: config.moneda }).format(amount);
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Boletas y Facturas</h1>
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
            <FaPlus className="me-1" />Crear Factura
          </Button>
        </div>
        <div className="d-flex justify-content-end mb-2">
          {hiddenInvoices.length > 0 && (
            <Button
              className="rounded-pill"
              style={{ backgroundColor: "gray", borderColor: "gray", color: "white" }}
              onClick={() => setShowHidden(!showHidden)}
            >
              {showHidden ? "Ocultar Facturas Ocultas" : "Mostrar Facturas Ocultas"}
            </Button>
          )}
        </div>
        <div className="table-responsive">
          <Table bordered hover className="mt-4" style={{
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#E8F8FF",
              textAlign: "center"
            }}>
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
                <th>Monto Bruto</th>
                <th>Impuesto Aplicado</th>
                <th>Total Neto</th>
                <th>N° de Folio</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((invoice) => {
                const isHidden = hiddenInvoices.includes(invoice.id);
                return (
                  <tr key={invoice.id} style={isHidden ? { opacity: 0.5 } : {}}>
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
                    <td>{formatCurrency(invoice.monto_base)}</td>
                    <td>{formatCurrency(invoice.impuesto_aplicado)}</td>
                    <td>{formatCurrency(invoice.total_final)}</td>
                    <td>{invoice.numero_comprobante}</td>
                    <td>{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : ""}</td>
                    <td>
                      {invoice.status === "Pagada" ? (
                        <span style={{ color: "green" }}>
                          <FaCheck className="me-1" /> {invoice.status}
                        </span>
                      ) : invoice.status === "Anular" ? (
                        <span style={{ color: "red" }}>
                          <FaBan className="me-1" /> Anulada {invoice.numero_nota ? `(N°: ${invoice.numero_nota})` : ""}
                        </span>
                      ) : (
                        <span style={{ color: "orange" }}>
                          <FaClock className="me-1" /> {invoice.status}
                        </span>
                      )}
                    </td>
                    <td>{invoice.tipo || "Sin definir"}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2 mb-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleChangeStatus(invoice.id, "Pendiente")}
                          disabled={invoice.status === "Pendiente" || invoice.status === "Pagada"}
                        >
                          Pendiente
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleChangeStatus(invoice.id, "Pagada")}
                          disabled={invoice.status === "Pagada"}
                        >
                          Pagada
                        </Button>
                      </div>
                      {invoice.status === "Anular" ? (
                        isHidden ? (
                          <Button
                            variant="success"
                            onClick={() => handleMostrarInvoice(invoice.id)}
                            className="rounded-pill"
                            style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                          >
                            Mostrar
                          </Button>
                        ) : (
                          <Button
                            variant="info"
                            onClick={() => handleOcultarInvoice(invoice.id)}
                            className="rounded-pill text-white"
                            style={{ backgroundColor: "gray", borderColor: "gray" }}
                          >
                            Ocultar
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => handleOpenAnularModal(invoice)}
                          className="rounded-pill"
                          style={{ backgroundColor: "orange", borderColor: "orange" }}
                        >
                          Anular
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
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

        {/* Modal para confirmar ocultar factura */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Ocultar Factura</Modal.Title>
          </Modal.Header>
          <Modal.Body>¿Estás seguro de ocultar esta factura?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Ocultar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para confirmar ocultar facturas seleccionadas */}
        <Modal show={showDeleteSelectedModal} onHide={() => setShowDeleteSelectedModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Ocultar Facturas Seleccionadas</Modal.Title>
          </Modal.Header>
          <Modal.Body>¿Estás seguro de ocultar las facturas seleccionadas?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteSelectedModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => {
              setHiddenInvoices([...hiddenInvoices, ...selectedInvoices]);
              setSelectedInvoices([]);
              setShowDeleteSelectedModal(false);
              toast.info("Facturas ocultadas.");
            }}>
              Ocultar Seleccionadas
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para crear factura */}
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
                <Form.Label>Monto Bruto</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Monto Bruto"
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
                <small className="mt-1 text-muted d-block">
                  El impuesto se aplicará automáticamente (configuración global: {(config.impuesto * 100).toFixed(0)}%)
                </small>
              </Form.Group>
              <Form.Group controlId="formNumeroComprobante" className="mt-2">
                <Form.Label>N° de Folio</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Número de Folio"
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
              <Form.Group controlId="formTipo" className="mt-2">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  name="tipo"
                  value={newInvoice.tipo}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, tipo: e.target.value })
                  }
                  required
                  className="rounded-pill"
                  style={{ borderColor: "#074de3" }}
                >
                  <option value="Factura">Factura</option>
                  <option value="Boleta">Boleta</option>
                </Form.Select>
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
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Anular">Anulada</option>
                </Form.Select>
              </Form.Group>
              <div className="mt-3 d-flex">
                <Button variant="primary" type="submit" className="rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
                  Crear
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
