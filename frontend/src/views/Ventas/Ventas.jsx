import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, FormControl, InputGroup, Pagination, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="container mt-4">
      <ToastContainer />
      <h1 className="text-center mb-4">Gestión de Ventas</h1>

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <FormControl
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <Button onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Nueva Venta
          </Button>
        </Col>
      </Row>

      <Table striped bordered responsive>
        <thead>
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
                <Button variant="danger" size="sm" onClick={() => handleDeleteSale(sale.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination className="justify-content-center">
        {[...Array(totalPages)].map((_, i) => (
          <Pagination.Item
            key={i + 1}
            active={currentPage === i + 1}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitCreateSale}>
            <Form.Select required value={newSale.customer_id} onChange={(e) => setNewSale({ ...newSale, customer_id: e.target.value })}>
              <option value="">Selecciona Cliente</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>

            <Form.Select required className="mt-2" value={newSale.product_id} onChange={(e) => setNewSale({ ...newSale, product_id: e.target.value })}>
              <option value="">Selecciona Producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - ${p.precio}
                </option>
              ))}
            </Form.Select>

            <Form.Control
              type="number"
              placeholder="Cantidad"
              className="mt-2"
              value={newSale.quantity}
              required
              onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
            />

            <Button type="submit" className="mt-3">Registrar Venta</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Ventas;
