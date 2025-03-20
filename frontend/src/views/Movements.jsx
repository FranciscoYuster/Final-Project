import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  Form,
  InputGroup,
  FormControl,
  Pagination
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaTrash, FaPlus } from "react-icons/fa";

const Movements = () => {
  // Estados para movimientos y productos
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estado para nuevo movimiento y modal de creación
  const [newMovement, setNewMovement] = useState({
    product_id: "",
    type: "",
    quantity: ""
  });
  const [showModal, setShowModal] = useState(false);

  // Estados para búsqueda, paginación y selección múltiple
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedMovements, setSelectedMovements] = useState([]);

  // Estados para confirmación de eliminación individual y masiva
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState(null);
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

  const token = sessionStorage.getItem("access_token");

  /* ======== Funciones de Carga ======== */

  // Cargar movimientos
  const fetchMovements = async () => {
    setLoadingMovements(true);
    try {
      const response = await fetch("/api/movements", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setMovements(data);
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
      toast.error("Error al cargar movimientos.");
    } finally {
      setLoadingMovements(false);
    }
  };

  // Cargar productos
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Error al cargar productos.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, []);

  /* ======== Función para obtener el nombre del producto ======== */

  const getProductName = (productId) => {
    const prod = products.find(
      (p) => p.id.toString() === productId.toString()
    );
    return prod ? prod.nombre : "N/D";
  };

  /* ======== Filtrado y Paginación ======== */

  // Se filtra por el tipo de movimiento
  const filteredMovements = movements.filter((mov) => {
    const type = mov.type ? mov.type.toLowerCase() : "";
    const query = searchQuery.toLowerCase();
    return type.includes(query);
  });

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const currentItems = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  /* ======== Manejo del Formulario ======== */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovement((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMovement = async (e) => {
    e.preventDefault();
    if (!newMovement.product_id || !newMovement.type || !newMovement.quantity) {
      toast.error("Todos los campos son requeridos.");
      return;
    }
    try {
      const response = await fetch("/api/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: newMovement.product_id,
          // El campo "type" debe ser "Compra" o "Venta"
          type: newMovement.type,
          quantity: parseInt(newMovement.quantity)
        })
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const createdMovement = await response.json();
      setMovements((prev) => [...prev, createdMovement]);
      toast.success("Movimiento creado correctamente.");
      setNewMovement({ product_id: "", type: "", quantity: "" });
      setShowModal(false);
    } catch (error) {
      console.error("Error al crear movimiento:", error);
      toast.error("Error al crear movimiento.");
    }
  };

  /* ======== Eliminación Individual ======== */

  const handleDeleteMovement = async (id) => {
    try {
      const response = await fetch(`/api/movements/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      setMovements((prev) => prev.filter((mov) => mov.id !== id));
      toast.success("Movimiento eliminado.");
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      toast.error("Error al eliminar movimiento.");
    }
  };

  const confirmDeleteMovement = (id) => {
    setMovementToDelete(id);
    setShowDeleteModal(true);
  };

  /* ======== Eliminación Masiva ======== */

  const handleDeleteAllMovements = async () => {
    const deleteRequests = selectedMovements.map((id) =>
      fetch(`/api/movements/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      }).then((response) => {
        if (!response.ok)
          throw new Error(`Error al eliminar movimiento con ID: ${id}`);
      })
    );
    Promise.all(deleteRequests)
      .then(() => {
        setMovements(movements.filter((mov) => !selectedMovements.includes(mov.id)));
        setSelectedMovements([]);
        toast.success("Movimientos eliminados correctamente.");
      })
      .catch((error) => {
        console.error("Error eliminando movimientos:", error);
        toast.error("Error al eliminar movimientos.");
      });
  };

  /* ======== Selección de Movimientos ======== */

  const handleSelectMovement = (id) => {
    if (selectedMovements.includes(id)) {
      setSelectedMovements(selectedMovements.filter((mid) => mid !== id));
    } else {
      setSelectedMovements([...selectedMovements, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMovements.length === currentItems.length) {
      setSelectedMovements([]);
    } else {
      setSelectedMovements(currentItems.map((mov) => mov.id));
    }
  };

  /* ======== Exportación ======== */

  const handleExportCSV = () => {
    const headers = ["Producto", "Tipo", "Cantidad", "Fecha"];
    let csvContent = headers.join(",") + "\n";
    movements.forEach((mov) => {
      const row = [
        getProductName(mov.product_id),
        mov.type,
        mov.quantity,
        mov.date ? new Date(mov.date).toLocaleDateString() : ""
      ];
      csvContent += row.join(",") + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "movements.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const wsData = movements.map((mov) => [
      getProductName(mov.product_id),
      mov.type,
      mov.quantity,
      mov.date ? new Date(mov.date).toLocaleDateString() : ""
    ]);
    wsData.unshift(["Producto", "Tipo", "Cantidad", "Fecha"]);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, "movements.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Producto", "Tipo", "Cantidad", "Fecha"];
    const tableRows = [];
    movements.forEach((mov) => {
      const rowData = [
        getProductName(mov.product_id),
        mov.type,
        mov.quantity,
        mov.date ? new Date(mov.date).toLocaleDateString() : ""
      ];
      tableRows.push(rowData);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("movements.pdf");
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Historial de Movimientos</h1>
        {/* Filtro global */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup className="w-50">
            <FormControl
              placeholder="Buscar movimiento..."
              aria-label="Buscar movimiento"
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
            <FaPlus className="me-1" /> Agregar Nuevo movimiento
          </Button>
        </div>

        {/* Botones de acciones y exportación */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" className="rounded-pill" onClick={handleExportCSV}>
              Exportar CSV
            </Button>
            <Button variant="success" size="sm" className="rounded-pill" onClick={handleExportExcel}>
              Exportar Excel
            </Button>
            <Button variant="success" size="sm" className="rounded-pill" onClick={handleExportPDF}>
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Tabla de movimientos */}
        <div className="table-responsive">
          <Table
            bordered
            hover
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#E8F8FF",
              textAlign: "center"
            }}
          >
            <thead style={{ backgroundColor: "#0775e3" }}>
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={selectedMovements.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded-circle"
                  />
                </th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6">No hay movimientos.</td>
                </tr>
              ) : (
                currentItems.map((mov) => (
                  <tr key={mov.id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedMovements.includes(mov.id)}
                        onChange={() => handleSelectMovement(mov.id)}
                        className="rounded-circle"
                      />
                    </td>
                    <td>{getProductName(mov.product_id)}</td>
                    <td>{mov.type}</td>
                    <td>{mov.quantity}</td>
                    <td>{mov.date ? new Date(mov.date).toLocaleDateString() : ""}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => confirmDeleteMovement(mov.id)}
                        className="rounded-pill"
                        style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Botón para eliminar movimientos seleccionados */}
        <div className="d-flex justify-content-start w-100">
          <Button
            variant="danger"
            disabled={selectedMovements.length === 0}
            onClick={() => setShowDeleteSelectedModal(true)}
            className="mb-3 rounded-pill"
            style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
          >
            Eliminar Seleccionadas
          </Button>
        </div>

        {/* Paginación */}
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

      {/* Modal para agregar movimiento */}
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Nuevo Movimiento</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleAddMovement}>
              <div className="mb-3">
                <label className="form-label">Producto:</label>
                {loadingProducts ? (
                  <p>Cargando productos...</p>
                ) : (
                  <select
                    name="product_id"
                    value={newMovement.product_id}
                    onChange={handleInputChange}
                    className="form-control rounded-pill"
                    style={{ borderColor: "#074de3" }}
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.nombre} ({product.codigo})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Tipo:</label>
                <select
                  name="type"
                  value={newMovement.type}
                  onChange={handleInputChange}
                  className="form-control rounded-pill"
                  style={{ borderColor: "#074de3" }}
                  required
                >
                  <option value="">Selecciona Compra o Venta</option>
                  <option value="Compra">Compra</option>
                  <option value="Venta">Venta</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Cantidad:</label>
                <input
                  type="number"
                  name="quantity"
                  value={newMovement.quantity}
                  onChange={handleInputChange}
                  className="form-control rounded-pill"
                  placeholder="Cantidad del movimiento"
                  style={{ borderColor: "#074de3" }}
                  required
                />
              </div>
              <Button type="submit" variant="primary" className="mt-3 rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
                Guardar
              </Button>
            </form>
          </Modal.Body>
        </Modal>
      )}

      {/* Modal de confirmación para eliminación individual */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Movimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de eliminar este movimiento?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteMovement(movementToDelete);
              setShowDeleteModal(false);
            }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminación de movimientos seleccionados */}
      <Modal show={showDeleteSelectedModal} onHide={() => setShowDeleteSelectedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Seleccionados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de eliminar los movimientos seleccionados?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteSelectedModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteAllMovements();
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

export default Movements;
