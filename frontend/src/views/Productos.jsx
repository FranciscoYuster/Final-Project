import React, { useEffect, useState } from "react";
import { Button, Modal, Table, Form, InputGroup, Pagination, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  const itemsPerPage = 10;

  const filteredProducts = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cargar productos al montar el componente
  useEffect(() => {
fetchProducts();
  }, []);

  const fetchProducts = () => {    
    const token = sessionStorage.getItem('access_token');
    fetch("/api/products",
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
    )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
  })
    .then((data) => {
      setProductos(data);
    })
    .catch((err) => console.error("Error al obtener productos:", err));
}

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((productId) => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentItems.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentItems.map((producto) => producto.id));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleShowModal = (product = null) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCreateProduct = (nuevoProducto) => {
    const stock = Number(nuevoProducto.stock);
  const precio = Number(nuevoProducto.precio);
    console.log({stock, precio});
    // Si alguna de las conversiones falla, 'stock' o 'precio' será NaN.
  if (isNaN(stock) || isNaN(precio)) {
    console.error("Error: stock o precio no son números válidos");
    return;  // Evita continuar si los valores no son válidos
  }
    const token = sessionStorage.getItem('access_token');
    console.log(token);
    fetch("/api/products", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        nombre: nuevoProducto.nombre, 
        stock: nuevoProducto.stock,  // Asegúrate de pasar números aquí
        precio: nuevoProducto.precio, // Asegúrate de pasar números aquí}),
        codigo: nuevoProducto.codigo,
        categoria: nuevoProducto.categoria,
        inventory_id: nuevoProducto.inventory_id
    })
  })
      .then(
        (response) => {
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          return response.json();
        }
      )
      .then((productoCreado) => {
        setProductos([...productos, productoCreado]); // Agregar el nuevo producto a la lista
        setShowAlert(true);      })
      .catch((err) => console.error("Error al agregar producto:", err));
      setShowAlert(true);
  };

  const handleUpdateProduct = async (id, updatedProductData) => {
    try {
      const token = sessionStorage.getItem('access_token');
      console.log(`Requesting update for product ID: ${id}`);
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProductData),
      });
  
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('Product updated successfully:', data);
      // Update the product in the state
      setProductos((prevProductos) =>
        prevProductos.map((producto) => (producto.id === id ? data : producto))
      );
      setShowAlert(true);
    } catch (error) {
      console.error('Error updating product:', error.message);
    }
  };
 
 
 

  // Función para mostrar confirmación de eliminación
  const handleShowDeleteConfirmation = (id) => {
    const token = sessionStorage.getItem('access_token');
    setProductToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteProduct = (id) => {
    const token = sessionStorage.getItem('access_token');

    // Asegúrate de que el id es un valor válido (número o cadena), no un objeto
    if (typeof id !== 'string' && typeof id !== 'number') {
        console.error("ID no válido:", id);
        return;
    }

    fetch(`/api/products/${id}`, {  // Usa el id en la URL
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}` 
      },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json(); // Esto es opcional, dependiendo de la respuesta del servidor
    })
    .then(() => {
        // Actualiza el estado de productos para reflejar la eliminación
        setProductos(productos.filter((producto) => producto.id !== id));
        setShowDeleteConfirmation(false);  // Cierra la confirmación de eliminación
        setShowAlert(true);  // Muestra alerta de éxito
    })
    .catch((err) => {
        console.error("Error al eliminar producto:", err);
    });
}



  const handleShowDeleteAllConfirmation = () => {
    setShowDeleteAllConfirmation(true);
  };

  const handleDeleteAllProducts = () => {
    const token = sessionStorage.getItem('access_token');
  // Crear un array de promesas de fetch para eliminar cada usuario
  const deleteRequests = selectedProducts.map(id =>
    fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al eliminar el producto con ID: ${id}`);
      }
    })
  );
  // Ejecutar todas las peticiones y actualizar el estado una vez completadas
  Promise.all(deleteRequests)
    .then(() => {
    setProductos(productos.filter((producto) => !selectedProducts.includes(producto.id)));
    setSelectedProducts([]);
    setShowDeleteAllConfirmation(false);
    setShowAlert(true);
  })
  .catch(error => {
    console.error('Error eliminando productos:', error);
  });
};

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h2 className="text-center">Lista de Productos</h2>

        {showAlert && (
          <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
            ¡Operación exitosa!
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup className="w-50">
            <Form.Control
              placeholder="Buscar productos"
              aria-label="Buscar productos"
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
            Crear Nuevo Producto
          </Button>
        </div>

        {/* Contenedor responsivo para la tabla */}
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
            <thead style={{ backgroundColor: "#0775e3" }}> {/* Fondo azul aquí */}
              <tr>
                <th>
                  <Form.Check
                    type="checkbox"
                    checked={selectedProducts.length === currentItems.length}
                    onChange={handleSelectAll}
                    className="rounded-circle"
                  />
                </th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
  {currentItems.map((producto) => (
    <tr key={producto.id}>
      <td>
        <Form.Check
          type="checkbox"
          checked={selectedProducts.includes(producto.id)}
          onChange={() => handleSelectProduct(producto.id)}
          className="rounded-circle"
        />
      </td>
      <td>{producto.codigo}</td>
      <td>{producto.nombre}</td>
      <td>{producto.stock}</td>
      <td>{producto.precio}</td>
      <td>{producto.categoria}</td>
      <td>
        <Button 
          variant="warning" 
          onClick={() => handleShowModal(producto)} 
          className="me-2 rounded-pill"
          style={{ backgroundColor: "#FFD700", borderColor: "#FFD700" }}
        >
          Editar
        </Button>
        <Button 
          variant="danger" 
          onClick={() => handleShowDeleteConfirmation(producto.id)} 
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
          disabled={selectedProducts.length === 0} 
          onClick={handleShowDeleteAllConfirmation} 
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

        {/* Modal de Confirmación para Eliminar Producto */}
        <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Estás seguro de que deseas eliminar este producto?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => handleDeleteProduct(productToDelete)}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Confirmación para Eliminar Todos los Seleccionados */}
        <Modal show={showDeleteAllConfirmation} onHide={() => setShowDeleteAllConfirmation(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            ¿Estás seguro de que deseas eliminar todos los productos seleccionados?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteAllConfirmation(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteAllProducts}>
              Eliminar Seleccionados
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para Crear/Editar Producto */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form
  onSubmit={(e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value;
    const stock = Number(e.target.stock.value);
    const codigo = e.target.codigo.value;
    const precio = Number(e.target.precio.value);
    const categoria = e.target.categoria.value;

    if (isNaN(stock) || isNaN(precio)) {
      console.error("Error: stock o precio no son números válidos");
      return;  // Evita continuar si los valores no son válidos
    }

    if (editingProduct) {
      handleUpdateProduct(editingProduct.id, { nombre, codigo, stock, precio, categoria });
    } else {
      handleCreateProduct({ nombre, codigo, stock, precio, categoria });
    }
    handleCloseModal();
  }}
>
  <Form.Group controlId="formCodigo">
    <Form.Label>Código</Form.Label>
    <Form.Control
      type="text"
      placeholder="Código del producto"
      defaultValue={editingProduct ? editingProduct.codigo : ""}
      name="codigo"
      required
      className="rounded-pill"
      style={{ borderColor: "#074de3" }}
    />
  </Form.Group>
  <Form.Group controlId="formNombre">
    <Form.Label>Nombre</Form.Label>
    <Form.Control
      type="text"
      placeholder="Nombre del producto"
      defaultValue={editingProduct ? editingProduct.nombre : ""}
      name="nombre"
      required
      className="rounded-pill"
      style={{ borderColor: "#074de3" }}
    />
  </Form.Group>
  <Form.Group controlId="formStock">
    <Form.Label>Stock</Form.Label>
    <Form.Control
      type="number"
      placeholder="Stock del producto"
      defaultValue={editingProduct ? editingProduct.stock : ""}
      name="stock"
      required
      className="rounded-pill"
      style={{ borderColor: "#074de3" }}
    />
  </Form.Group>
  <Form.Group controlId="formPrecio">
    <Form.Label>Precio</Form.Label>
    <Form.Control
      type="number"
      placeholder="Precio del producto"
      defaultValue={editingProduct ? editingProduct.precio : ""}
      name="precio"
      required
      className="rounded-pill"
      style={{ borderColor: "#074de3" }}
    />
  </Form.Group>
  <Form.Group controlId="formCategoria">
    <Form.Label>Categoría</Form.Label>
    <Form.Control
      type="text"
      placeholder="Categoría del producto"
      defaultValue={editingProduct ? editingProduct.categoria : ""}
      name="categoria"
      required
      className="rounded-pill"
      style={{ borderColor: "#074de3" }}
    />
  </Form.Group>
  <Button 
    variant="primary" 
    type="submit" 
    className="mt-3 rounded-pill"
    style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
  >
    {editingProduct ? "Actualizar" : "Crear"}
  </Button>
</Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Productos;
