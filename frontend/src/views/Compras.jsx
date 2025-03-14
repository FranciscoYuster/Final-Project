import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, InputGroup, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPlus } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Compras = () => {

  const [purchases, setPurchase] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  cosnt[editPurchase, setEditPurchase] = useState(null)
  cosnt[deletePurchase, setDeletePurchase] = useState(null)
  cosnt[deletePurchase, setDeletePurchase] = useState(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  const [locations, setLocations] = useState([]);
  const itemsPerPage = 10;

  // Estado para una nueva compra

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

  useEffect(() => {
    fetchPurchases();
  }, [])

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
        return response.json()
      })
      .then(data => setPurchase(data))
      .catch((error) => {
        console.error("Error al obtener compras", err);
        toast.error("Error al cargar compras!")
      })
  }

  // Filtrado y paginacion

  const filteredPurchases = purchases.filter(purchase =>
    purchase.orden_compra.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const currentItems = filteredPurchases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const handleSelectPurchases = (id) => {
    if (selectedPurchases.includes(id)) {
      setSelectedPurchases(selectedPurchases.filter(purchases => purchases !== id))
    } else {
      setSelectedPurchases([...selectedPurchases, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedPurchases.length === currentItems.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(currentItems.map((producto) => producto.id));
    }
  };

  // Abrir modal

  const handleShowModal = (purchases = null) => {
    setEditPurchase(purchases);
    if (purchases) {
      setNewPurchase({
        numero_comprobante: purchases.invoice && purchases.invoice.numero_comprobante ? purchases.invoice.numero_comprobante : "",
        orden_compra: purchases.orden_compra,
        metodo: purchases.metodo,
        provider_id: purchases.provider_id,
        product_id: purchases.product_id,
        inventory_id: purchases.inventory_id,
        quantity: purchases.quantity,
        total: purchases.total,
        status: purchases.status,
        type: purchases.type
      })
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
      })
    }
    setShowModal(true);
  }

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
    })
  };


  const handleCreatePurchases = (nuevaCompra) => {
    const quantity = Number(nuevaCompra.quantity);
  }















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
                        checked={selectedPurchases.length === currentItems.length}
                        onChange={() => {
                          if (selectedPurchases.length === currentItems.length) {
                            setSelectedPurchases([]);
                          } else {
                            setSelectedPurchases(currentItems.map((compras) => compras.id));
                          }
                        }}
                        className="rounded-circle"
                      />
                    </th>
                    <th>Orden De Compra</th>
                    <th>Metodo</th>
                    <th>Proveedor</th>
                    <th>Producto</th>
                    <th>Inventario</th>
                    <th>quantity</th>
                    <th>total</th>
                    <th>Fecha De Compras</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((compras) => (
                    <tr key={compras.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedPurchases.includes(compras.id)}
                          onChange={() => handleSelectPurchases(compras.id)}
                          className="rounded-circle"
                        />
                      </td>
                      <td>{compras.orden_compra}</td>
                      <td>{compras.metodo}</td>
                      <td>{compras.provider_id}</td>
                      <td>{compras.product_id}</td>
                      <td>{compras.inventory_id}</td>
                      <td>{compras.quantity}</td>
                      <td>
                        <Button
                          variant="warning"
                          onClick={() => handleShowModal(compras)}
                          className="me-2 rounded-pill"
                          style={{ backgroundColor: "#FFD700", borderColor: "#FFD700" }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeletePurchases(compras.id)}
                          className="rounded-pill"
                          style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
    
            <Button
              variant="danger"
              disabled={selectedPurchases.length === 0}
              onClick={handleDeleteAllPurchases}
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
    
            {/* Modal para Confirmar Eliminación */}
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
                <Button variant="danger" onClick={() => handleDeletePurchases(purchasesToDelete)}>
                  Eliminar
                </Button>
              </Modal.Footer>
            </Modal>
    
            {/* Modal para Confirmar Eliminación de Todos */}
            <Modal show={showDeleteAllConfirmation} onHide={() => setShowDeleteAllConfirmation(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Confirmar Eliminación</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                ¿Estás seguro de que deseas eliminar todos las compras seleccionadas?
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
    
            {/* Modal para Crear/Editar Compras */}
            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>{editingPurchases ? "Editar Compra" : "Nueva Compra"}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const orden_compra= e.target.orden_compra.value;
                    const  metodo = e.target.metodo.value;
                    const provider_id = e.target.provider_id.value;
                    const product_id = e.target.product_id.value;
                    const inventory_id = e.target.inventory_id.value;
                    const quantity = e.target.quantity.value;
                    
                    if (isNaN(metodo) || isNaN(quantity)) {
                      console.error("Error: metodo o quiantity no son números válidos");
                      toast.error("Metodo o quantity no son números válidos.");
                      return;
                    }
                    
                    if (editingPurchases) {
                      handleUpdatePurchases(editingPurchases.id, { orden_compra, metodo, provider_id, product_id, inventory_id, quantity });
                    } else {
                      handleCreatePurchases({ orden_compra, metodo, provider_id, product_id, inventory_id, quantity });
                    }
                    handleCloseModal();
                  }}
                >

                  <Form.Group controlId="formOrdenCompra">
                    <Form.Label>Orden_De_Compra</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Código de compra"
                      defaultValue={editingPurchases ? editingPurchases.orden_compra : ""}
                      name="orden_compra"
                      required
                      className="rounded-pill"
                      style={{ borderColor: "#074de3" }}
                    />
                  </Form.Group>
                  <Form.Group controlId="formMetodo">
                    <Form.Label>Metodo</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Metodo"
                      defaultValue={editingPurchases ? editingPurchases.metodo : ""}
                      name="metodo"
                      required
                      className="rounded-pill"
                      style={{ borderColor: "#074de3" }}
                    />
                  </Form.Group>
                  <Form.Group controlId="formProvider">
                    <Form.Label>Proveedor</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Proveedor"
                      defaultValue={editingPurchases ? editingPurchases.provider_id : ""}
                      name="provider_id"
                      required
                      className="rounded-pill"
                      style={{ borderColor: "#074de3" }}
                    />
                  </Form.Group>
                  <Form.Group controlId="formproduct">
                    <Form.Label>Producto</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Precio del producto"
                      defaultValue={editingPurchases ? editingPurchases.product_id : ""}
                      name="product_id"
                      required
                      className="rounded-pill"
                      style={{ borderColor: "#074de3" }}
                      step="0.01"
                    />
                  </Form.Group>
                  <Form.Group controlId="formInventory">
                    <Form.Label>Inventario</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Inventario"
                      defaultValue={editingPurchases ? editingPurchases.inventory_id : ""}
                      name="inventory_id"
                      required
                      className="rounded-pill"
                      style={{ borderColor: "#074de3" }}
                    />
                  </Form.Group>
                  <Form.Group controlId="formQuantity" className="mb-2">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number" 
                      placeholder="Cantidad"
                      name="quantity"
                      defaultValue={editingPurchases ? editingPurchases.quantity : ""}
                      className="rounded-pill"
                      style={{ borderColor: "#074de3" }}
                      required
                    >
                    </Form.Control>
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="mt-3 rounded-pill"
                    style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
                  >
                    {editingPurchases ? "Actualizar" : "Crear"}
                  </Button>
                </Form>
              </Modal.Body>
            </Modal>
        </div>
        </div>
  )
}

export default Compras