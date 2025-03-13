import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, InputGroup, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaTrash } from "react-icons/fa";

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Estado para nuevo movimiento
  const [newMovement, setNewMovement] = useState({
    product_id: "",
    type: "",
    quantity: ""
  });
  
  // Modal para crear movimiento
  const [showModal, setShowModal] = useState(false);
  
  // Buscador, paginación y selección múltiple
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedMovements, setSelectedMovements] = useState([]);

  const token = sessionStorage.getItem("access_token");

  // Función para cargar movimientos
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

  // Función para cargar productos
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

  // Filtrado y paginación (se filtra por producto y tipo)
  const filteredMovements = movements.filter((mov) => {
    const prod = mov.product_id ? mov.product_id.toString() : "";
    const type = mov.type ? mov.type.toLowerCase() : "";
    const query = searchQuery.toLowerCase();
    return prod.includes(query) || type.includes(query);
  });
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const currentItems = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovement((prev) => ({ ...prev, [name]: value }));
  };

  // Crear un nuevo movimiento
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

  // Eliminar movimiento individual
  const handleDeleteMovement = async (id) => {
    try {
      const response = await fetch(`/api/movements/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      setMovements((prev) => prev.filter((mov) => mov.id !== id));
      toast.success("Movimiento eliminado.");
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      toast.error("Error al eliminar movimiento.");
    }
  };

  // Selección múltiple
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

  const handleDeleteAllMovements = () => {
    const deleteRequests = selectedMovements.map((id) =>
      fetch(`/api/movements/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      }).then((response) => {
        if (!response.ok) throw new Error(`Error al eliminar movimiento con ID: ${id}`);
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

  // Funciones de exportación
  const handleExportCSV = () => {
    const headers = ["#", "Producto ID", "Tipo", "Cantidad", "Fecha", "Registrado Por", "Rol"];
    let csvContent = headers.join(",") + "\n";
    movements.forEach((mov, index) => {
      const row = [
        index + 1,
        mov.product_id,
        mov.type,
        mov.quantity,
        mov.date ? new Date(mov.date).toLocaleDateString() : "",
        mov.registered_by && mov.registered_by.name ? mov.registered_by.name : "N/D",
        mov.registered_by && mov.registered_by.role ? mov.registered_by.role : "N/D"
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
    const wsData = movements.map((mov, index) => [
      index + 1,
      mov.product_id,
      mov.type,
      mov.quantity,
      mov.date ? new Date(mov.date).toLocaleDateString() : "",
      mov.registered_by && mov.registered_by.name ? mov.registered_by.name : "N/D",
      mov.registered_by && mov.registered_by.role ? mov.registered_by.role : "N/D"
    ]);
    wsData.unshift(["#", "Producto ID", "Tipo", "Cantidad", "Fecha", "Registrado Por", "Rol"]);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, "movements.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["#", "Producto ID", "Tipo", "Cantidad", "Fecha", "Registrado Por", "Rol"];
    const tableRows = [];
    movements.forEach((mov, index) => {
      const rowData = [
        index + 1,
        mov.product_id,
        mov.type,
        mov.quantity,
        mov.date ? new Date(mov.date).toLocaleDateString() : "",
        mov.registered_by && mov.registered_by.name ? mov.registered_by.name : "N/D",
        mov.registered_by && mov.registered_by.role ? mov.registered_by.role : "N/D"
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
    <div className="container mt-4" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <h1 className="text-center">Historial de Movimientos</h1>

      {/* Botón para abrir el modal de registro */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="primary" onClick={() => setShowModal(true)} className="rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
          Agregar Movimiento
        </Button>
        <Button
          variant="danger"
          disabled={selectedMovements.length === 0}
          onClick={handleDeleteAllMovements}
          className="rounded-pill"
          style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
        >
          Eliminar Seleccionadas
        </Button>
      </div>

      {/* Botones de exportación */}
      <div className="mb-4 d-flex gap-2">
        <Button variant="secondary" size="sm" className="rounded-pill" onClick={handleExportCSV}>
          Exportar CSV
        </Button>
        <Button variant="secondary" size="sm" className="rounded-pill" onClick={handleExportExcel}>
          Exportar Excel
        </Button>
        <Button variant="secondary" size="sm" className="rounded-pill" onClick={handleExportPDF}>
          Exportar PDF
        </Button>
      </div>

      {/* Filtro global */}
      <div className="mb-3">
        <InputGroup className="w-50">
          <Form.Control
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
      </div>

      {/* Tabla de movimientos */}
      <div className="table-responsive">
        <Table
          bordered
          hover
          className="mt-4"
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
              <th>#</th>
              <th>Producto ID</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Fecha</th>
              <th>Registrado Por</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="9">No hay movimientos.</td>
              </tr>
            ) : (
              currentItems.map((mov, index) => (
                <tr key={mov.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedMovements.includes(mov.id)}
                      onChange={() => handleSelectMovement(mov.id)}
                      className="rounded-circle"
                    />
                  </td>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{mov.product_id}</td>
                  <td>{mov.type}</td>
                  <td>{mov.quantity}</td>
                  <td>{mov.date ? new Date(mov.date).toLocaleDateString() : ""}</td>
                  <td>{mov.registered_by && mov.registered_by.name ? mov.registered_by.name : "N/D"}</td>
                  <td>{mov.registered_by && mov.registered_by.role ? mov.registered_by.role : "N/D"}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteMovement(mov.id)}
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

      {/* Modal para agregar movimiento */}
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Nuevo Movimiento</Modal.Title>
          </Modal.Header>
          <form onSubmit={handleAddMovement}>
            <Modal.Body>
              <div className="mb-2">
                <label className="form-label">Producto:</label>
                {loadingProducts ? (
                  <p>Cargando productos...</p>
                ) : (
                  <select
                    name="product_id"
                    value={newMovement.product_id}
                    onChange={handleInputChange}
                    className="form-control"
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
              <div className="mb-2">
                <label className="form-label">Tipo (sale/purchase):</label>
                <input
                  type="text"
                  name="type"
                  value={newMovement.type}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="sale o purchase"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Cantidad:</label>
                <input
                  type="number"
                  name="quantity"
                  value={newMovement.quantity}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Movements;
