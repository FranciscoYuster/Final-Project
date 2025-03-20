import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Table,
  Form,
  InputGroup,
  Pagination,
  Row,
  Col
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categories, setCategories] = useState([]); // Categorías
  const [locations, setLocations] = useState([]);     // Ubicaciones
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const itemsPerPage = 10;

  // Estado para el nuevo producto (incluye ubicacion_id)
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    codigo: "",
    categoria: "",
    ubicacion_id: "",
  });

  const token = sessionStorage.getItem("access_token");

  const filteredProducts = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Carga de productos
  const fetchProducts = () => {
    fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then((data) => setProductos(data))
      .catch((err) => {
        console.error("Error al obtener productos:", err);
        toast.error("Error al cargar productos.");
      });
  };

  // Carga de categorías
  const fetchCategories = () => {
    fetch("/api/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((resp) => {
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
        return resp.json();
      })
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Error al obtener categorías:", err);
        toast.error("Error al cargar categorías.");
      });
  };

  // Carga de ubicaciones
  const fetchLocations = () => {
    fetch("/api/ubicaciones", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((resp) => {
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
        return resp.json();
      })
      .then((data) => setLocations(data))
      .catch((err) => {
        console.error("Error al obtener ubicaciones:", err);
        toast.error("Error al cargar ubicaciones.");
      });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLocations();
  }, []);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
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

  const handleShowModal = (product = null) => {
    setEditingProduct(product);
    if (!product) {
      setNewProduct({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        codigo: "",
        categoria: "",
        ubicacion_id: "",
      });
      setIsCreatingCategory(false);
      setNewCategoryName("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setIsCreatingCategory(false);
    setNewCategoryName("");
  };

  // Creación de producto (con campo ubicacion_id)
  const handleCreateProduct = (nuevoProducto) => {
    const stock = Number(nuevoProducto.stock);
    const precio = Number(nuevoProducto.precio);
    if (isNaN(stock) || isNaN(precio)) {
      console.error("Error: stock o precio no son números válidos");
      toast.error("Stock o precio no son números válidos.");
      return;
    }
    fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: nuevoProducto.nombre,
        stock: nuevoProducto.stock,
        precio: nuevoProducto.precio,
        codigo: nuevoProducto.codigo,
        categoria: nuevoProducto.categoria,
        // Envío de la ubicación asignada
        ubicacion_id: nuevoProducto.ubicacion_id,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then((productoCreado) => {
        setProductos([...productos, productoCreado]);
        toast.success("Producto creado exitosamente.");
        // Registrar movimiento de ingreso
        fetch("/api/movements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productoCreado.id,
            inventory_id: productoCreado.inventory_id,
            type: "ingreso",
            quantity: productoCreado.stock,
          }),
        })
          .then((resp) => {
            if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
            return resp.json();
          })
          .then(() => {
            toast.success("Movimiento de ingreso registrado.");
          })
          .catch((err) => {
            console.error("Error al registrar movimiento:", err);
            toast.error("Error al registrar el movimiento.");
          });
      })
      .catch((err) => {
        console.error("Error al agregar producto:", err);
        toast.error("Error al crear el producto.");
      });
  };

  const handleUpdateProduct = async (id, updatedProductData) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProductData),
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setProductos((prevProductos) =>
        prevProductos.map((producto) => (producto.id === id ? data : producto))
      );
      toast.success("Producto actualizado exitosamente.");
    } catch (error) {
      console.error("Error updating product:", error.message);
      toast.error("Error al actualizar el producto.");
    }
  };

  const handleDeleteProduct = (id) => {
    fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.status === 409) {
          toast.info("Este producto tiene historial y no se puede eliminar.");
          throw new Error("Product has historical records.");
        }
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(() => {
        setProductos(productos.filter((producto) => producto.id !== id));
        toast.success("Producto eliminado exitosamente.");
      })
      .catch((err) => {
        console.error("Error al eliminar producto:", err);
        if (err.message !== "Product has historical records.") {
          toast.error("Error al eliminar el producto.");
        }
      });
  };

  const handleDeleteAllProducts = () => {
    const deletableIds = [];
    const nonDeletableIds = [];
    selectedProducts.forEach((id) => {
      const prod = productos.find((p) => p.id === id);
      if (
        prod &&
        ((prod.movements && prod.movements.length > 0) ||
          (prod.sales && prod.sales.length > 0) ||
          (prod.purchases && prod.purchases.length > 0) ||
          (prod.invoices && prod.invoices.length > 0))
      ) {
        nonDeletableIds.push(id);
      } else {
        deletableIds.push(id);
      }
    });
    if (nonDeletableIds.length > 0) {
      toast.info("Algunos productos tienen historial y no se pueden eliminar.");
    }
    if (deletableIds.length === 0) return;
    const deleteRequests = deletableIds.map((id) =>
      fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }).then((response) => {
        if (response.status === 409) throw new Error("Product has historical records.");
        if (!response.ok) throw new Error(`Error al eliminar el producto con ID: ${id}`);
      })
    );
    Promise.all(deleteRequests)
      .then(() => {
        setProductos(productos.filter((producto) => !deletableIds.includes(producto.id)));
        setSelectedProducts([]);
        toast.success("Productos eliminados exitosamente.");
      })
      .catch((error) => {
        console.error("Error eliminando productos:", error);
        toast.error("Error al eliminar productos.");
      });
  };

  const confirmDeleteProduct = (id) => {
    setProductToDelete(id);
    setShowDeleteConfirmation(true);
  };

  // Función para crear una nueva categoría
  const handleCreateCategory = () => {
    if (!newCategoryName) {
      toast.error("Ingrese el nombre de la categoría");
      return;
    }
    fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre: newCategoryName }),
    })
      .then((resp) => {
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
        return resp.json();
      })
      .then((data) => {
        toast.success("Categoría creada");
        setCategories([...categories, data]);
        if (editingProduct) {
          setEditingProduct({ ...editingProduct, categoria: data.nombre });
        } else {
          setNewProduct({ ...newProduct, categoria: data.nombre });
        }
        setIsCreatingCategory(false);
        setNewCategoryName("");
      })
      .catch((err) => {
        console.error("Error al crear categoría:", err);
        toast.error("Error al crear categoría");
      });
  };

  // Funciones para exportar datos a CSV y Excel
  const exportToCSV = () => {
    if (!productos.length) return;
    const headers = Object.keys(productos[0]);
    const csvRows = [
      headers.join(","),
      ...productos.map((prod) =>
        headers.map((header) => `"${prod[header]}"`).join(",")
      ),
    ];
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "productos.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportToExcel = () => {
    if (!productos.length) return;
    const worksheet = XLSX.utils.json_to_sheet(productos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "productos.xlsx");
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ fontSize: "0.9rem" }}>
      <ToastContainer />
      <div className="w-100" style={{ maxWidth: "1200px" }}>
        <h1 className="mb-3 text-white">Lista de Productos</h1>
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
          <div>
            <Button
              variant="primary"
              onClick={() => handleShowModal()}
              className="rounded-pill me-2"
              style={{ backgroundColor: "#074de3", borderColor: "#074de3" }}
            >
              <FaPlus className="me-1" /> Crear Nuevo Producto
            </Button>
            </div>
            <div className="d-flex justify-content-end">
            <Button variant="success" className="rounded-pill me-2" onClick={exportToCSV}>
              Exportar CSV
            </Button>
            <Button variant="success" className="rounded-pill" onClick={exportToExcel}>
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
                <th>Ubicación</th>
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
                  <td>{producto.ubicacion ? producto.ubicacion.nombre : "Sin asignar"}</td>
                  <td>
                  <div className="d-flex flex-column flex-sm-row">
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
                      onClick={() => confirmDeleteProduct(producto.id)}
                      className="rounded-pill"
                      style={{ backgroundColor: "#e30e07", borderColor: "#e30e07" }}
                    >
                      Eliminar
                    </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Button
          variant="danger"
          disabled={selectedProducts.length === 0}
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
      {/* Modal para confirmación de eliminación individual */}
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
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteProduct(productToDelete);
              setShowDeleteConfirmation(false);
              setProductToDelete(null);
            }}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal para confirmación de eliminación de todos */}
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
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteAllProducts();
              setShowDeleteAllConfirmation(false);
            }}
          >
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
              // Obtener el valor de Ubicación
              const ubicacion_id = e.target.ubicacion_id.value;
              if (isNaN(stock) || isNaN(precio)) {
                console.error("Error: stock o precio no son números válidos");
                toast.error("Stock o precio no son números válidos.");
                return;
              }
              if (editingProduct) {
                handleUpdateProduct(editingProduct.id, { nombre, codigo, stock, precio, categoria, ubicacion_id });
              } else {
                handleCreateProduct({ nombre, codigo, stock, precio, categoria, inventory_id: ubicacion_id, ubicacion_id });
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
                step="0.01"
              />
            </Form.Group>
            {/* Campo Categoría */}
            <Form.Group controlId="formCategoria" className="mt-2">
              <Form.Label>Categoría</Form.Label>
              <Row className="align-items-center">
                <Col xs={9}>
                  <Form.Select
                    name="categoria"
                    value={editingProduct ? editingProduct.categoria : newProduct.categoria}
                    onChange={(e) => {
                      if (editingProduct) {
                        setEditingProduct({
                          ...editingProduct,
                          categoria: e.target.value,
                        });
                      } else {
                        setNewProduct({
                          ...newProduct,
                          categoria: e.target.value,
                        });
                      }
                    }}
                    required
                    className="rounded-pill"
                    style={{ borderColor: "#074de3" }}
                  >
                    <option value="">Selecciona categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={3}>
                  <Button
                    variant="outline-primary"
                    className="rounded-pill"
                    onClick={() => setIsCreatingCategory(true)}
                  >
                    <FaPlus />
                  </Button>
                </Col>
              </Row>
              {isCreatingCategory && (
                <Row className="mt-2">
                  <Col xs={9}>
                    <Form.Control
                      type="text"
                      placeholder="Nueva categoría"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="rounded-pill"
                      style={{ borderColor: "#074de3" }}
                      required
                    />
                  </Col>
                  <Col xs={3}>
                    <Button
                      variant="primary"
                      className="rounded-pill"
                      onClick={handleCreateCategory}
                    >
                      Confirmar
                    </Button>
                  </Col>
                </Row>
              )}
            </Form.Group>
            {/* Campo Ubicación */}
            <Form.Group controlId="formUbicacion" className="mt-2">
              <Form.Label>Ubicación</Form.Label>
              <Form.Select
                name="ubicacion_id"
                value={editingProduct ? (editingProduct.ubicacion ? editingProduct.ubicacion.id : "") : newProduct.ubicacion_id}
                onChange={(e) => {
                  if (editingProduct) {
                    setEditingProduct({
                      ...editingProduct,
                      // Se guarda como objeto, ajusta según cómo manejes el dato en el backend
                      ubicacion: { id: parseInt(e.target.value) },
                    });
                  } else {
                    setNewProduct({
                      ...newProduct,
                      ubicacion_id: e.target.value,
                    });
                  }
                }}
                required
                className="rounded-pill"
                style={{ borderColor: "#074de3" }}
              >
                <option value="">Seleccione una ubicación</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nombre}
                  </option>
                ))}
              </Form.Select>
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
  );
};

export default Productos;
