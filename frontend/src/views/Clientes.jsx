import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, FormControl, InputGroup, Pagination, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import * as XLSX from "xlsx";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Clientes = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el formulario de creación y edición
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    rut: "",
    direccion: "",
  });

  const [editCustomer, setEditCustomer] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    rut: "",
    direccion: "",
  });

  const token = sessionStorage.getItem("access_token");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar clientes
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/customers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("No se pudieron cargar los clientes.");
      toast.error("No se pudieron cargar los clientes.");
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

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentItems = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Manejo de selección individual y masiva
  const handleSelectCustomer = (id) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(customerId => customerId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(customers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Funciones para eliminación
  const confirmDelete = (id) => {
    setCustomerToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    const customer = customers.find(cust => cust.id === customerToDelete);
    if (customer && customer.invoices && customer.invoices.length > 0) {
      toast.error("Cliente tiene facturas creadas a través de Toastify");
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      return;
    }
    try {
      const response = await fetch(`/api/customers/${customerToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 409) {
          const errorData = await response.json();
          toast.info(errorData.error || "No se pudo eliminar el cliente.");
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return;
      }
      await response.json();
      setCustomers(customers.filter(customer => customer.id !== customerToDelete));
      toast.success("Cliente eliminado correctamente.");
    } catch (err) {
      console.error("Error deleting customer:", err);
      setError("No se pudo eliminar el cliente.");
      toast.error("No se pudo eliminar el cliente.");
    } finally {
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const openDeleteSelectedModal = () => {
    setShowDeleteSelectedModal(true);
  };

  const handleConfirmDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedCustomers.map(async (id) => {
          const response = await fetch(`/api/customers/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
          await response.json();
        })
      );
      setCustomers(customers.filter(customer => !selectedCustomers.includes(customer.id)));
      setSelectedCustomers([]);
      toast.success("Clientes eliminados correctamente.");
    } catch (err) {
      console.error("Error deleting customers:", err);
      setError("No se pudieron eliminar los clientes.");
      toast.error("No se pudieron eliminar los clientes.");
    } finally {
      setShowDeleteSelectedModal(false);
    }
  };

  const handleCancelDeleteSelected = () => {
    setShowDeleteSelectedModal(false);
  };

  // Modal de creación
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewCustomer({ name: "", email: "", phone: "", rut: "", direccion: "" });
    setError(null);
  };

  const handleInputChange = (e) => {
    setNewCustomer({
      ...newCustomer,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  // Función para evitar que se ingresen letras en el input de teléfono
  const handlePhoneKeyPress = (e) => {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const isDuplicateCustomer = () => {
    return customers.some(customer =>
      customer.name.toLowerCase() === newCustomer.name.toLowerCase() ||
      customer.email.toLowerCase() === newCustomer.email.toLowerCase()
    );
  };

  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    if (isDuplicateCustomer()) {
      setError("El nombre o email ya están en uso.");
      toast.error("El nombre o email ya están en uso.");
      return;
    }
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newCustomer),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setCustomers([...customers, data]);
      handleCloseCreateModal();
      toast.success("Cliente creado exitosamente.");
    } catch (err) {
      console.error("Error creating customer:", err);
      setError("No se pudo crear el cliente.");
      toast.error("No se pudo crear el cliente.");
    }
  };

  // Modal de edición
  const handleOpenEditModal = (customer) => {
    setEditCustomer({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      rut: customer.rut,
      direccion: customer.direccion
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditCustomer({ id: "", name: "", email: "", phone: "", rut: "", direccion: "" });
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editCustomer.name,
          email: editCustomer.email,
          phone: editCustomer.phone,
          rut: editCustomer.rut,
          direccion: editCustomer.direccion
        }),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setCustomers(customers.map(customer => (customer.id === data.id ? data : customer)));
      handleCloseEditModal();
      toast.success("Cliente actualizado exitosamente.");
    } catch (err) {
      console.error("Error updating customer:", err);
      setError("No se pudo actualizar el cliente.");
      toast.error("No se pudo actualizar el cliente.");
    }
  };

  // Funciones de exportación: CSV y Excel
  const exportToCSV = () => {
    if (!customers.length) return;
    const headers = Object.keys(customers[0]);
    const csvRows = [
      headers.join(","),
      ...customers.map(cust =>
        headers.map(header => `"${cust[header]}"`).join(",")
      )
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clientes.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToExcel = () => {
    if (!customers.length) return;
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "clientes.xlsx");
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3" style={{ color: "white" }}>Clientes</h1>
        <InputGroup className="mb-3">
          <Col className="d-flex justify-content-between align-items-center mb-3">
            <div>
              {/* Botón corregido para abrir el modal de creación */}
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="rounded-pill me-2"
                style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
              >
                <FaPlus className="me-1" />
                Crear Cliente
              </Button>
            </div>
            <div>
              <Button variant="success" className="rounded-pill" onClick={exportToCSV}>
                Exportar CSV
              </Button>
              <Button variant="success" className="rounded-pill ms-2" onClick={exportToExcel}>
                Exportar Excel
              </Button>
            </div>
          </Col>
        </InputGroup>

        {isLoading ? (
          <div>Cargando clientes...</div>
        ) : (
          <div className="table-responsive">
            <Table bordered hover className="mt-4" style={{
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#E8F8FF",
              textAlign: "center",
            }}>
              <thead style={{ backgroundColor: "#0775e3" }}>
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
                  <th>RUT</th>
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
                    <td>{customer.rut}</td>
                    <td>
                      <div className="d-flex flex-column flex-sm-row text-center justify-content-center">
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
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}

        <Button
          variant="danger"
          className="mb-3 rounded-pill"
          onClick={openDeleteSelectedModal}
          disabled={selectedCustomers.length === 0}
        >
          Eliminar Seleccionados
        </Button>

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
      </div>

      {/* Modal para confirmar eliminación individual */}
      <Modal show={showDeleteModal} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar este cliente?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar eliminación de clientes seleccionados */}
      <Modal show={showDeleteSelectedModal} onHide={handleCancelDeleteSelected}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Clientes Seleccionados</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar los clientes seleccionados?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDeleteSelected}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDeleteSelected}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear cliente */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmitCustomer}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmitCustomer(e); }}
          >
            <Form.Group controlId="customerRut" className="mt-2">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                className="rounded-pill"
                type="text"
                placeholder="RUT del cliente"
                name="rut"
                value={newCustomer.rut}
                onChange={handleInputChange}
                required
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="customerName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                className="rounded-pill"
                type="text"
                placeholder="Nombre del cliente"
                name="name"
                value={newCustomer.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="customerEmail" className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                className="rounded-pill"
                type="email"
                placeholder="Email del cliente"
                name="email"
                value={newCustomer.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="customerPhone" className="mt-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                className="rounded-pill"
                type="tel"
                placeholder="Número de teléfono del cliente"
                name="phone"
                value={newCustomer.phone}
                onChange={handleInputChange}
                onKeyPress={handlePhoneKeyPress}
                required
                maxLength="9"
                pattern="^9[0-9]{8}$"
                title="El teléfono debe ser un número móvil chileno de 9 dígitos. Ej: 912345678"
              />
            </Form.Group>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <Button variant="primary" type="submit" className="mt-3 rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
              Crear
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para editar cliente */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmitEditCustomer}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmitEditCustomer(e); }}
          >
            <Form.Group controlId="editCustomerRut" className="mt-2">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                className="rounded-pill"
                type="text"
                placeholder="RUT del cliente"
                name="rut"
                value={editCustomer.rut}
                onChange={handleEditInputChange}
                required
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="editCustomerName">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                className="rounded-pill"
                type="text"
                placeholder="Nombre del cliente"
                name="name"
                value={editCustomer.name}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="editCustomerEmail" className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                className="rounded-pill"
                type="email"
                placeholder="Email del cliente"
                name="email"
                value={editCustomer.email}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="editCustomerPhone" className="mt-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                className="rounded-pill"
                type="tel"
                placeholder="Teléfono del cliente"
                name="phone"
                value={editCustomer.phone}
                onChange={handleEditInputChange}
                onKeyPress={handlePhoneKeyPress}
                required
                maxLength="9"
                pattern="^9[0-9]{8}$"
                title="El teléfono debe ser un número móvil chileno de 9 dígitos. Ej: 912345678"
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3 rounded-pill">
              Guardar cambios
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Clientes;
