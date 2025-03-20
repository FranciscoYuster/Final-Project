import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Table,
  Form,
  InputGroup,
  Pagination,
  Col,
  Row,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

export const baseUrl = import.meta.env.VITE_BASE_URL;

const Ubicaciones = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUbicaciones, setSelectedUbicaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado para nueva ubicación
  const [newUbicacion, setNewUbicacion] = useState({
    nombre: "",
    descripcion: "",
  });

  // Estados para modal de confirmación de eliminación individual y masiva
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ubicacionToDelete, setUbicacionToDelete] = useState(null);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

  const token = sessionStorage.getItem("access_token");

  const filteredUbicaciones = ubicaciones.filter((ubicacion) =>
    ubicacion.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUbicaciones.length / itemsPerPage);
  const currentItems = filteredUbicaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchUbicaciones = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setUbicaciones(data);
    } catch (err) {
      console.error("Error al cargar ubicaciones:", err);
      toast.error("Error al cargar ubicaciones.");
    }
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectUbicacion = (id) => {
    if (selectedUbicaciones.includes(id)) {
      setSelectedUbicaciones(selectedUbicaciones.filter((uid) => uid !== id));
    } else {
      setSelectedUbicaciones([...selectedUbicaciones, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUbicaciones.length === currentItems.length) {
      setSelectedUbicaciones([]);
    } else {
      setSelectedUbicaciones(currentItems.map((ubicacion) => ubicacion.id));
    }
  };

  const handleShowModal = (ubicacion = null) => {
    setEditingUbicacion(ubicacion);
    if (!ubicacion) {
      setNewUbicacion({ nombre: "", descripcion: "" });
    } else {
      setNewUbicacion({
        nombre: ubicacion.nombre,
        descripcion: ubicacion.descripcion,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUbicacion(null);
  };

  const handleAddUbicacion = async (e) => {
    e.preventDefault();
    if (!newUbicacion.nombre) {
      toast.error("El nombre es requerido");
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUbicacion),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setUbicaciones([...ubicaciones, data]);
      toast.success("Ubicación creada exitosamente.");
      handleCloseModal();
    } catch (err) {
      console.error("Error al crear ubicación:", err);
      toast.error("Error al crear la ubicación.");
    }
  };

  const handleEditUbicacion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${baseUrl}/api/ubicaciones/${editingUbicacion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newUbicacion),
        }
      );
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setUbicaciones(ubicaciones.map((u) => (u.id === data.id ? data : u)));
      toast.success("Ubicación actualizada exitosamente.");
      handleCloseModal();
    } catch (err) {
      console.error("Error al actualizar ubicación:", err);
      toast.error("Error al actualizar la ubicación.");
    }
  };

  const handleDeleteUbicacion = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      setUbicaciones(ubicaciones.filter((u) => u.id !== id));
      toast.success("Ubicación eliminada correctamente.");
    } catch (err) {
      console.error("Error al eliminar ubicación:", err);
      toast.error("Error al eliminar la ubicación.");
    }
  };

  const handleDeleteAllUbicaciones = () => {
    const deleteRequests = selectedUbicaciones.map((id) =>
      fetch(`${baseUrl}/api/ubicaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        if (!response.ok)
          throw new Error(`Error al eliminar la ubicación con ID: ${id}`);
      })
    );
    Promise.all(deleteRequests)
      .then(() => {
        setUbicaciones(
          ubicaciones.filter((u) => !selectedUbicaciones.includes(u.id))
        );
        setSelectedUbicaciones([]);
        toast.success("Ubicaciones eliminadas exitosamente.");
      })
      .catch((err) => {
        console.error("Error eliminando ubicaciones:", err);
        toast.error("Error al eliminar ubicaciones.");
      });
  };

  const confirmDeleteUbicacion = (id) => {
    setUbicacionToDelete(id);
    setShowDeleteModal(true);
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (!ubicaciones.length) return;
    const headers = Object.keys(ubicaciones[0]);
    const csvRows = [
      headers.join(","),
      ...ubicaciones.map((u) =>
        headers.map((header) => `"${u[header]}"`).join(",")
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ubicaciones.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (!ubicaciones.length) return;
    const worksheet = XLSX.utils.json_to_sheet(ubicaciones);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ubicaciones");
    XLSX.writeFile(workbook, "ubicaciones.xlsx");
  };

  return (
    <div
      className="container mt-4 d-flex flex-column align-items-center"
      style={{ fontSize: "0.9rem" }}
    >
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Gestión de Ubicaciones</h1>
        <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              className="rounded-pill me-2"
              style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
            >
              <FaPlus className="me-1" />
              Crear Ubicacion
            </Button>
          </div>
          <div className="d-flex justify-content-end">
          <Button
            variant="success"
            className="rounded-pill me-2"
            onClick={exportToCSV}
          >
            Exportar CSV
          </Button>
          <Button
            variant="success"
            className="rounded-pill"
            onClick={exportToExcel}
          >
            Exportar Excel
          </Button>
          </div>
          </Col>
          </Row>
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
                    checked={
                      selectedUbicaciones.length === currentItems.length &&
                      currentItems.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded-circle"
                  />
                </th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5">No hay ubicaciones.</td>
                </tr>
              ) : (
                currentItems.map((ubicacion) => (
                  <tr key={ubicacion.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUbicaciones.includes(ubicacion.id)}
                        onChange={() => handleSelectUbicacion(ubicacion.id)}
                        className="rounded-circle"
                      />
                    </td>
                    <td>{ubicacion.id}</td>
                    <td>
                      {editingUbicacion &&
                      editingUbicacion.id === ubicacion.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editingUbicacion.nombre}
                          onChange={(e) =>
                            setEditingUbicacion({
                              ...editingUbicacion,
                              nombre: e.target.value,
                            })
                          }
                          required
                        />
                      ) : (
                        ubicacion.nombre
                      )}
                    </td>
                    <td>
                      {editingUbicacion &&
                      editingUbicacion.id === ubicacion.id ? (
                        <textarea
                          className="form-control"
                          value={editingUbicacion.descripcion}
                          onChange={(e) =>
                            setEditingUbicacion({
                              ...editingUbicacion,
                              descripcion: e.target.value,
                            })
                          }
                        />
                      ) : (
                        ubicacion.descripcion
                      )}
                    </td>
                    <td>
                      {editingUbicacion &&
                      editingUbicacion.id === ubicacion.id ? (
                        <>
                          <Button
                            variant="success"
                            className="me-2 rounded-pill"
                            onClick={handleEditUbicacion}
                          >
                            Guardar
                          </Button>
                          <Button
                            variant="secondary"
                            className="rounded-pill"
                            onClick={() => setEditingUbicacion(null)}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="d-flex flex-column flex-sm-row">
                            <Button
                              variant="warning"
                              className="me-2 rounded-pill"
                              onClick={() => handleShowModal(ubicacion)}
                              style={{
                                backgroundColor: "#FFD700",
                                borderColor: "#FFD700",
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="danger"
                              className="rounded-pill"
                              onClick={() =>
                                confirmDeleteUbicacion(ubicacion.id)
                              }
                              style={{
                                backgroundColor: "#e30e07",
                                borderColor: "#e30e07",
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <Button
          variant="danger"
          disabled={selectedUbicaciones.length === 0}
          onClick={() => setShowDeleteSelectedModal(true)}
          className="mb-3 rounded-pill"
          style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
        >
          Eliminar Seleccionadas
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
      {/* Modal para crear o editar ubicaciones */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUbicacion ? "Editar Ubicación" : "Crear Ubicación"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={
              editingUbicacion ? handleEditUbicacion : handleAddUbicacion
            }
          >
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                type="text"
                className="rounded-pill"
                placeholder="Nombre de la ubicación"
                value={newUbicacion.nombre}
                onChange={(e) =>
                  setNewUbicacion({ ...newUbicacion, nombre: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                style={{ borderColor: "#074de3" }}
                className="rounded-pill"
                placeholder="Descripción de la ubicación"
                value={newUbicacion.descripcion}
                onChange={(e) =>
                  setNewUbicacion({
                    ...newUbicacion,
                    descripcion: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Button
              type="submit"
              className="mt-3 rounded-pill"
              variant="primary"
              style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
            >
              {editingUbicacion ? "Guardar" : "Crear"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Modal de confirmación para eliminación individual */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Ubicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar esta ubicación?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteUbicacion(ubicacionToDelete);
              setShowDeleteModal(false);
              setUbicacionToDelete(null);
            }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal de confirmación para eliminación de ubicaciones seleccionadas */}
      <Modal
        show={showDeleteSelectedModal}
        onHide={() => setShowDeleteSelectedModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Seleccionados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de eliminar las ubicaciones seleccionadas?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteSelectedModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteAllUbicaciones();
              setShowDeleteSelectedModal(false);
            }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Ubicaciones;
