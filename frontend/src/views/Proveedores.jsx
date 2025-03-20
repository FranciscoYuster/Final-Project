import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, FormControl, InputGroup, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import * as XLSX from "xlsx";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Proveedores = () => {
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newProvider, setNewProvider] = useState({
    name: "",
    addres: "",
    phone: "",
    email: "",
    rut: "",
  });

  const [editProvider, setEditProvider] = useState({
    id: null,
    name: "",
    addres: "",
    phone: "",
    email: "",
    rut: "",
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

  const token = sessionStorage.getItem("access_token");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const currentItems = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchProviders();
  }, []);

  const handlePhoneKeyPress = (e) => {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };
  

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/providers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setProviders(data);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("No se pudieron cargar los proveedores.");
      toast.error("No se pudieron cargar los proveedores.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectProvider = (id) => {
    setSelectedProviders(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProviders(providers.map(provider => provider.id));
    } else {
      setSelectedProviders([]);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const confirmDelete = (id) => {
    setProviderToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/providers/${providerToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      await response.json();
      setProviders(providers.filter(provider => provider.id !== providerToDelete));
      toast.success("Proveedor eliminado correctamente.");
    } catch (err) {
      console.error("Error deleting provider:", err);
      setError("No se pudo eliminar el proveedor.");
      toast.error("No se pudo eliminar el proveedor.");
    } finally {
      setShowDeleteModal(false);
      setProviderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProviderToDelete(null);
  };

  const handleConfirmDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedProviders.map(async (id) => {
          const response = await fetch(`/api/providers/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
          await response.json();
        })
      );
      setProviders(providers.filter(provider => !selectedProviders.includes(provider.id)));
      setSelectedProviders([]);
      toast.success("Proveedores eliminados correctamente.");
    } catch (err) {
      console.error("Error deleting providers:", err);
      setError("No se pudieron eliminar los proveedores.");
      toast.error("No se pudieron eliminar los proveedores.");
    } finally {
      setShowDeleteSelectedModal(false);
    }
  };

  const handleCancelDeleteSelected = () => {
    setShowDeleteSelectedModal(false);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewProvider({ name: "", addres: "", phone: "", email: "", rut: "" });
    setError(null);
  };

  const handleInputChange = (e) => {
    setNewProvider({
      ...newProvider,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const isDuplicateProvider = () => {
    return providers.some(provider =>
      provider.name.toLowerCase() === newProvider.name.toLowerCase() ||
      provider.email.toLowerCase() === newProvider.email.toLowerCase()
    );
  };

  const handleSubmitProvider = async (e) => {
    e.preventDefault();
    if (isDuplicateProvider()) {
      setError("El nombre o email ya están en uso.");
      toast.error("El nombre o email ya están en uso.");
      return;
    }
    try {
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newProvider),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setProviders([...providers, data]);
      handleCloseCreateModal();
      toast.success("Proveedor creado exitosamente.");
    } catch (err) {
      console.error("Error creating provider:", err);
      setError("No se pudo crear el proveedor.");
      toast.error("No se pudo crear el proveedor.");
    }
  };

  const handleOpenEditModal = (provider) => {
    setEditProvider({
      id: provider.id,
      name: provider.name,
      addres: provider.addres,
      phone: provider.phone,
      email: provider.email,
      rut: provider.rut,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditProvider({ id: null, name: "", addres: "", phone: "", email: "", rut: "" });
    setError(null);
  };

  const handleEditInputChange = (e) => {
    setEditProvider({
      ...editProvider,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmitEditProvider = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/providers/${editProvider.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editProvider.name,
          addres: editProvider.addres,
          phone: editProvider.phone,
          email: editProvider.email,
          rut: editProvider.rut,
        }),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setProviders(providers.map(provider => (provider.id === data.id ? data : provider)));
      handleCloseEditModal();
      toast.success("Proveedor actualizado exitosamente.");
    } catch (err) {
      console.error("Error updating provider:", err);
      setError("No se pudo actualizar el proveedor.");
      toast.error("No se pudo actualizar el proveedor.");
    }
  };

  // Funciones de exportación: CSV y Excel
  const exportToCSV = () => {
    if (!providers.length) return;
    const headers = Object.keys(providers[0]);
    const csvRows = [
      headers.join(","),
      ...providers.map(prod =>
        headers.map(header => `"${prod[header]}"`).join(",")
      )
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "proveedores.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToExcel = () => {
    if (!providers.length) return;
    const worksheet = XLSX.utils.json_to_sheet(providers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
    XLSX.writeFile(workbook, "proveedores.xlsx");
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Proveedores</h1>
        <InputGroup className="mb-3">
          <FormControl
            type="text"
            className="rounded-pill"
            placeholder="Buscar proveedores"
            aria-label="Buscar proveedores"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button variant="success" className="rounded-pill" onClick={exportToCSV}>
            Exportar CSV
          </Button>
          <Button variant="success" className="rounded-pill ms-2" onClick={exportToExcel}>
            Exportar Excel
          </Button>
        </InputGroup>

        {isLoading ? (
          <div>Cargando proveedores...</div>
        ) : (
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
                    checked={selectedProviders.length === providers.length && providers.length > 0}
                  />
                </th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>RUT</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map(provider => (
                <tr key={provider.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedProviders.includes(provider.id)}
                      onChange={() => handleSelectProvider(provider.id)}
                    />
                  </td>
                  <td>{provider.name}</td>
                  <td>{provider.addres}</td>
                  <td>{provider.phone}</td>
                  <td>{provider.email}</td>
                  <td>{provider.rut}</td>
                  <td>
                    <Button
                      variant="warning"
                      className="me-2 rounded-pill"
                      onClick={() => handleOpenEditModal(provider)}
                      style={{ backgroundColor: "#FFD700", borderColor: "#FFD700" }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      className="rounded-pill"
                      onClick={() => confirmDelete(provider.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredProviders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}

        <Button
          variant="danger"
          className="mb-3 rounded-pill"
          onClick={() => setShowDeleteSelectedModal(true)}
          disabled={selectedProviders.length === 0}
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
          <Modal.Title>Eliminar Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar este proveedor?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar eliminación de proveedores seleccionados */}
      <Modal show={showDeleteSelectedModal} onHide={handleCancelDeleteSelected}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Proveedores Seleccionados</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar los proveedores seleccionados?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDeleteSelected}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirmDeleteSelected}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear proveedor */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmitProvider}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmitProvider(e); }}
          >
            <Form.Group controlId="providerName">
              <Form.Label>Nombre / Razón Social</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre del proveedor"
                name="name"
                value={newProvider.name}
                onChange={handleInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
                required
              />
            </Form.Group>
            <Form.Group controlId="providerAddress" className="mt-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                placeholder="Dirección del proveedor"
                name="addres"
                value={newProvider.addres}
                onChange={handleInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="providerPhone" className="mt-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                className="rounded-pill"
                type="tel"
                placeholder="Teléfono del proveedor"
                name="phone"
                value={newProvider.phone}
                onChange={handleInputChange}
                onKeyPress={handlePhoneKeyPress}
                required
                maxLength="9"
                pattern="^9[0-9]{8}$"
                title="El teléfono debe ser un número móvil chileno de 9 dígitos. Ej: 912345678"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="providerEmail" className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email del proveedor"
                name="email"
                value={newProvider.email}
                onChange={handleInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="providerRut" className="mt-2">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                placeholder="RUT del proveedor"
                name="rut"
                value={newProvider.rut}
                onChange={handleInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
                required
              />
            </Form.Group>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <Button variant="primary" type="submit" className="mt-3 rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
              Crear
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para editar proveedor */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSubmitEditProvider}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmitEditProvider(e); }}
          >
            <Form.Group controlId="editProviderName">
              <Form.Label>Nombre / Razón Social</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre del proveedor"
                name="name"
                value={editProvider.name}
                onChange={handleEditInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
                required
              />
            </Form.Group>
            <Form.Group controlId="editProviderAddress" className="mt-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                placeholder="Dirección del proveedor"
                name="addres"
                value={editProvider.addres}
                onChange={handleEditInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="editProviderPhone" className="mt-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Teléfono del proveedor"
                name="phone"
                value={editProvider.phone}
                onChange={handleEditInputChange}
                onKeyPress={handlePhoneKeyPress}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
                required
                maxLength="9"
                pattern="^9[0-9]{8}$"
                title="El teléfono debe ser un número móvil chileno de 9 dígitos. Ej: 912345678"
              />
            </Form.Group>
            <Form.Group controlId="editProviderEmail" className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email del proveedor"
                name="email"
                value={editProvider.email}
                onChange={handleEditInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="editProviderRut" className="mt-2">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                placeholder="RUT del proveedor"
                name="rut"
                value={editProvider.rut}
                onChange={handleEditInputChange}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
                required
              />
            </Form.Group>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <Button variant="primary" type="submit" className="mt-3 rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
              Guardar cambios
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Proveedores;
