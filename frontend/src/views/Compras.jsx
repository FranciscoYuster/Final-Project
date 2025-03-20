import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, InputGroup, Pagination } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Compras = () => {
  const [purchases, setPurchases] = useState([]);
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [editPurchase, setEditPurchase] = useState(null);
  const [deletePurchase, setDeletePurchase] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  
  const [newPurchase, setNewPurchase] = useState({
    numero_comprobante: "",
    orden_compra: "",
    metodo: "",
    provider_id: "",
    product_id: "",
    inventory_id: "",
    quantity: "",
    total: "",
    status: "",
    type: ""
  });

  const token = sessionStorage.getItem("access_token");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPurchases();
    fetchProviders();
  }, []);

  const fetchPurchases = () => {
    fetch("/api/purchases", {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setPurchases(data))
      .catch((error) => {
        console.error("Error al obtener compras", error);
        toast.error("Error al cargar compras!");
      });
  };

  const fetchProviders = () => {
    fetch("/api/providers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => setProviders(data))
      .catch(error => {
        console.error("Error al cargar proveedores", error);
        toast.error("Error al cargar proveedores!");
      });
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.orden_compra.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const currentItems = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleSelectPurchases = (id) => {
    if (selectedPurchases.includes(id)) {
      setSelectedPurchases(selectedPurchases.filter(purchaseId => purchaseId !== id));
    } else {
      setSelectedPurchases([...selectedPurchases, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPurchases.length === currentItems.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(currentItems.map((compra) => compra.id));
    }
  };

  const handleShowModal = (purchase = null) => {
    setEditPurchase(purchase);
    if (purchase) {
      setNewPurchase({
        numero_comprobante: purchase.invoice && purchase.invoice.numero_comprobante ? purchase.invoice.numero_comprobante : "",
        orden_compra: purchase.orden_compra,
        metodo: purchase.metodo,
        provider_id: purchase.provider_id,
        product_id: purchase.product_id,
        inventory_id: purchase.inventory_id,
        quantity: purchase.quantity,
        total: purchase.total,
        status: purchase.status,
        type: purchase.type
      });
    } else {
      setNewPurchase({
        numero_comprobante: "",
        orden_compra: "",
        metodo: "",
        provider_id: "",
        product_id: "",
        inventory_id: "",
        quantity: "",
        total: "",
        status: "",
        type: ""
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditPurchase(null);
    setNewPurchase({
      numero_comprobante: "",
      orden_compra: "",
      metodo: "",
      provider_id: "",
      product_id: "",
      inventory_id: "",
      quantity: "",
      total: "",
      status: "",
      type: ""
    });
  };

  // Funciones stubs para crear, actualizar y eliminar compras (deben implementar la lógica de backend)
  const handleCreatePurchases = (purchaseData) => {
    console.log("Crear compra", purchaseData);
    // Implementa la lógica de creación
  };

  const handleUpdatePurchases = (id, purchaseData) => {
    console.log("Actualizar compra", id, purchaseData);
    // Implementa la lógica de actualización
  };

  const handleDeletePurchases = (id) => {
    console.log("Eliminar compra", id);
    // Implementa la lógica de eliminación
    setShowDeleteConfirmation(false);
  };

  const handleDeleteAllPurchases = () => {
    console.log("Eliminar compras seleccionadas", selectedPurchases);
    // Implementa la lógica para eliminar todas las compras seleccionadas
    setShowDeleteAllConfirmation(false);
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Lista de Compras</h1>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup className="w-50">
            <Form.Control
              placeholder="Buscar compras"
              aria-label="Buscar compras"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-pill"
            />
          </InputGroup>
          <Button
            variant="primary"
            onClick={() => handleShowModal()}
            className="rounded-pill"
            style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
          >
            <FaPlus className="me-1" /> Crear Nueva Compra
          </Button>
        </div>

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
                    checked={selectedPurchases.length === currentItems.length && currentItems.length > 0}
                    onChange={handleSelectAll}
                    className="rounded-circle"
                  />
                </th>
                <th>Orden De Compra</th>
                <th>Método</th>
                <th>Proveedor</th>
                <th>Producto</th>
                <th>Inventario</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((compra) => (
                <tr key={compra.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedPurchases.includes(compra.id)}
                      onChange={() => handleSelectPurchases(compra.id)}
                      className="rounded-circle"
                    />
                  </td>
                  <td>{compra.orden_compra}</td>
                  <td>{compra.metodo}</td>
                  <td>{compra.provider_id}</td>
                  <td>{compra.product_id}</td>
                  <td>{compra.inventory_id}</td>
                  <td>{compra.quantity}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleShowModal(compra)}
                      className="me-2 rounded-pill"
                      style={{ backgroundColor: "#FFD700", borderColor: "#FFD700" }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setDeletePurchase(compra.id);
                        setShowDeleteConfirmation(true);
                      }}
                      className="rounded-pill"
                      style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">No se encontraron resultados</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <Button
          variant="danger"
          disabled={selectedPurchases.length === 0}
          onClick={() => setShowDeleteAllConfirmation(true)}
          className="mb-3 rounded-pill"
          style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
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
      <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar esta compra?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => handleDeletePurchases(deletePurchase)}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para confirmar eliminación masiva */}
      <Modal show={showDeleteAllConfirmation} onHide={() => setShowDeleteAllConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar todas las compras seleccionadas?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAllConfirmation(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteAllPurchases}>
            Eliminar Seleccionados
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear/editar compra */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editPurchase ? "Editar Compra" : "Nueva Compra"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const orden_compra = e.target.orden_compra.value;
              const metodo = e.target.metodo.value;
              const provider_id = e.target.provider_id.value;
              const product_id = e.target.product_id.value;
              const inventory_id = e.target.inventory_id.value;
              const quantity = e.target.quantity.value;

              if (isNaN(quantity)) {
                console.error("Error: la cantidad no es un número válido");
                toast.error("La cantidad no es un número válido.");
                return;
              }

              if (editPurchase) {
                handleUpdatePurchases(editPurchase.id, { orden_compra, metodo, provider_id, product_id, inventory_id, quantity });
              } else {
                handleCreatePurchases({ orden_compra, metodo, provider_id, product_id, inventory_id, quantity });
              }
              handleCloseModal();
            }}
          >
            <Form.Group controlId="formOrdenCompra">
              <Form.Label>Orden De Compra</Form.Label>
              <Form.Control
                type="text"
                placeholder="Código de compra"
                defaultValue={editPurchase ? editPurchase.orden_compra : ""}
                name="orden_compra"
                required
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="formMetodo" className="mt-2">
              <Form.Label>Método</Form.Label>
              <Form.Control
                type="text"
                placeholder="Método"
                defaultValue={editPurchase ? editPurchase.metodo : ""}
                name="metodo"
                required
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="formProvider" className="mt-2">
              <Form.Label>Proveedor</Form.Label>
              <Form.Select
                name="provider_id"
                defaultValue={editPurchase ? editPurchase.provider_id : ""}
                required
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              >
                <option value="">Seleccione un proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="formProduct" className="mt-2">
              <Form.Label>Producto</Form.Label>
              <Form.Control
                type="number"
                placeholder="ID del producto"
                defaultValue={editPurchase ? editPurchase.product_id : ""}
                name="product_id"
                required
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="formInventory" className="mt-2">
              <Form.Label>Inventario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Inventario"
                defaultValue={editPurchase ? editPurchase.inventory_id : ""}
                name="inventory_id"
                required
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              />
            </Form.Group>
            <Form.Group controlId="formQuantity" className="mt-2 mb-2">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                placeholder="Cantidad"
                name="quantity"
                defaultValue={editPurchase ? editPurchase.quantity : ""}
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3 rounded-pill" style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}>
              {editPurchase ? "Actualizar" : "Crear"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Compras;
