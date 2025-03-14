import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, FormControl, InputGroup, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Proveedores = () => {
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Usamos la propiedad "addres" para alinear con el modelo de la DB
  const [newProvider, setNewProvider] = useState({
    name: "",
    addres: "",
    phone: "",
    email: "",
  });
  const [editProvider, setEditProvider] = useState({
    id: null,
    name: "",
    addres: "",
    phone: "",
    email: "",
  });

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);

  const token = sessionStorage.getItem("access_token");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Función para obtener proveedores
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

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const currentItems = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Selección individual y masiva
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

  // Eliminar proveedores seleccionados
  const handleDeleteSelected = async () => {
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
    }
  };

  // Eliminación individual con confirmación
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

  // Modal de creación
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewProvider({ name: "", addres: "", phone: "", email: "" });
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

  // Modal de edición
  const handleOpenEditModal = (provider) => {
    setEditProvider({
      id: provider.id,
      name: provider.name,
      addres: provider.addres, // Asegúrate de usar "addres" para que coincida con el modelo
      phone: provider.phone,
      email: provider.email,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditProvider({ id: null, name: "", addres: "", phone: "", email: "" });
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

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Proveedores</h1>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup className="w-50">
            <FormControl
              type="text"
              className="rounded-pill"
              placeholder="Buscar proveedores"
              aria-label="Buscar proveedores"
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          <Button variant="primary" className="rounded-pill" onClick={handleOpenCreateModal}>
            <FaPlus className="me-1" /> Crear Nuevo Proveedor
          </Button>
        </div>

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
                  <td colSpan="6" className="text-center">
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
          onClick={handleDeleteSelected}
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

      {/* Modal para crear proveedor */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Proveedor</Modal.Title>
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
                placeholder="Ingrese el nombre"
                name="name"
                value={newProvider.name}
                onChange={handleInputChange}
                className="rounded-pill"
                required
              />
            </Form.Group>
            <Form.Group controlId="providerAddress" className="mt-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la dirección"
                name="addres"
                value={newProvider.addres}
                onChange={handleInputChange}
                className="rounded-pill"
              />
            </Form.Group>
            <Form.Group controlId="providerPhone" className="mt-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Ej: 912345678"
                name="phone"
                value={newProvider.phone}
                onChange={handleInputChange}
                className="rounded-pill"
                required
                maxLength="9"
                pattern="^9[0-9]{8}$"
                title="El teléfono debe ser un número móvil chileno de 9 dígitos. Ej: 912345678"
              />
            </Form.Group>
            <Form.Group controlId="providerEmail" className="mt-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingrese el email"
                name="email"
                value={newProvider.email}
                onChange={handleInputChange}
                className="rounded-pill"
              />
            </Form.Group>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <Button variant="primary" type="submit" className="w-100 mt-3 rounded-pill">
              Crear Proveedor
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
                placeholder="Ingrese el nombre"
                name="name"
                value={editProvider.name}
                onChange={handleEditInputChange}
                className="rounded-pill"
                required
              />
            </Form.Group>
            <Form.Group controlId="editProviderAddress" className="mt-2">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese la dirección"
                name="addres"
                value={editProvider.addres}
                onChange={handleEditInputChange}
                className="rounded-pill"
              />
            </Form.Group>
            <Form.Group controlId="editProviderPhone" className="mt-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                placeholder="Ej: 912345678"
                name="phone"
                value={editProvider.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 9);
                  handleEditInputChange({ target: { name: "phone", value: cleaned } });
                }}
                className="rounded-pill"
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
                placeholder="Ingrese el email"
                name="email"
                value={editProvider.email}
                onChange={handleEditInputChange}
                className="rounded-pill"
              />
            </Form.Group>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            <Button variant="primary" type="submit" className="w-100 mt-3 rounded-pill">
              Actualizar Proveedor
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Proveedores;
