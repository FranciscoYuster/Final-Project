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
import { FaPlus } from "react-icons/fa";

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

  // Estados para búsqueda y paginación
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
         <div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="rounded-pill me-2"
            style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
          >
            <FaPlus className="me-1" /> Crear movimiento
          </Button>
          </div>

        {/* Botones de exportación */}
          <div>
            <Button variant="success" className="rounded-pill me-2" onClick={handleExportCSV}>
              Exportar CSV
            </Button>
            <Button variant="success"  className="rounded-pill me-2" onClick={handleExportExcel}>
              Exportar Excel
            </Button>
            <Button variant="success" className="rounded-pill me-2" onClick={handleExportPDF}>
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
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="4">No hay movimientos.</td>
                </tr>
              ) : (
                currentItems.map((mov) => (
                  <tr key={mov.id}>
                    <td>{getProductName(mov.product_id)}</td>
                    <td>{mov.type}</td>
                    <td>{mov.quantity}</td>
                    <td>{mov.date ? new Date(mov.date).toLocaleDateString() : ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
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
    </div>
  );
};

export default Movements;
