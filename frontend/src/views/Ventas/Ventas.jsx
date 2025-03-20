import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, FormControl, InputGroup, Pagination, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Ventas = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSale, setNewSale] = useState({
    customer_id: "",
    product_id: "",
    quantity: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = sessionStorage.getItem("access_token");

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch("/api/sales", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setSales(data);
    } catch {
      toast.error("Error al cargar ventas");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data);
    } catch {
      toast.error("Error al cargar clientes");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch {
      toast.error("Error al cargar productos");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentItems = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmitCreateSale = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newSale),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const data = await res.json();
      setSales([...sales, data]);
      toast.success("Venta creada exitosamente");
      setShowCreateModal(false);
      setNewSale({ customer_id: "", product_id: "", quantity: "" });
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDeleteSale = async (id) => {
    try {
      await fetch(`/api/sales/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setSales(sales.filter(s => s.id !== id));
      toast.success("Venta eliminada");
    } catch {
      toast.error("Error al eliminar la venta");
    }
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Gestión de Ventas</h1>
        <Row className="mb-3">
          <div className="col-md-6">
            <InputGroup className="w-50">
              <FormControl
                placeholder="Buscar ventas..."
                value={searchTerm}
                onChange={handleSearch}
                className="rounded-pill"
              />
            </InputGroup>
          </div>
          <div className="col-md-6 text-end">
            <Button
              variant="primary"
              className="rounded-pill"
              style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="me-1" /> Nueva Venta
            </Button>
          </div>
        </Row>

        <Table striped bordered hover className="mt-4" style={{
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#E8F8FF",
          textAlign: "center",
        }}>
          <thead style={{ backgroundColor: "#0775e3" }}>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{sale.customer.name}</td>
                <td>{sale.product.nombre}</td>
                <td>{sale.quantity}</td>
                <td>{sale.total}</td>
                <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    className="rounded-pill"
                    style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
                    onClick={() => handleDeleteSale(sale.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">No se encontraron resultados</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Pagination className="mb-3 justify-content-center">
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>

      {/* Modal para crear venta */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitCreateSale}>
            <Form.Group controlId="formCustomer">
              <Form.Label>Cliente</Form.Label>
              <Form.Select
                required
                value={newSale.customer_id}
                onChange={(e) => setNewSale({ ...newSale, customer_id: e.target.value })}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              >
                <option value="">Selecciona Cliente</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formProduct" className="mt-2">
              <Form.Label>Producto</Form.Label>
              <Form.Select
                required
                value={newSale.product_id}
                onChange={(e) => setNewSale({ ...newSale, product_id: e.target.value })}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              >
                <option value="">Selecciona Producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - ${p.precio}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formQuantity" className="mt-2">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                placeholder="Cantidad"
                value={newSale.quantity}
                onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                required
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3 rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
              Registrar Venta
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Ventas;
