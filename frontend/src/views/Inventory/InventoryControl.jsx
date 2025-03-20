import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Tabs,
  Tab
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

const baseUrl = import.meta.env.VITE_BASE_URL;

const InventoryControl = () => {
  const token = sessionStorage.getItem("access_token");

  // Estados para ubicaciones.
  const [ubicaciones, setUbicaciones] = useState([]);
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [searchUbicacion, setSearchUbicacion] = useState("");
  const [ubicacionPage, setUbicacionPage] = useState(1);
  const ubicacionesPerPage = 5;

  // Estados para productos.
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Función para cargar ubicaciones.
  const fetchUbicaciones = async () => {
    setLoadingUbicaciones(true);
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setUbicaciones(data);
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
      toast.error("Error al cargar ubicaciones.");
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  // Función para cargar productos.
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`${baseUrl}/api/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
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
    fetchUbicaciones();
  }, []);

  // Cuando se selecciona una bodega, se recargan los productos.
  useEffect(() => {
    if (selectedUbicacion) {
      fetchProducts();
    }
  }, [selectedUbicacion]);

  // Filtrado y paginación de ubicaciones.
  const filteredUbicaciones = ubicaciones.filter((u) =>
    u.nombre.toLowerCase().includes(searchUbicacion.toLowerCase())
  );
  const totalUbicPages = Math.ceil(filteredUbicaciones.length / ubicacionesPerPage);
  const currentUbicaciones = filteredUbicaciones.slice(
    (ubicacionPage - 1) * ubicacionesPerPage,
    ubicacionPage * ubicacionesPerPage
  );

  // Filtrar productos según la ubicación seleccionada.
  const filteredProducts = products.filter((prod) =>
    prod.ubicacion && prod.ubicacion.id === selectedUbicacion?.id
  );

  // Renderiza las tarjetas de ubicaciones.
  const renderUbicacionesCards = () => {
    if (loadingUbicaciones) return <p>Cargando ubicaciones...</p>;
    if (!ubicaciones.length) return <p>No se encontraron ubicaciones.</p>;
    return (
      <>
        <Row>
          {currentUbicaciones.map((ubicacion) => (
            <Col key={ubicacion.id} md={4} className="mb-3">
              <Card onClick={() => setSelectedUbicacion(ubicacion)} style={{ cursor: "pointer" }}>
                <Card.Body>
                  <Card.Title>{ubicacion.nombre}</Card.Title>
                  <Card.Text>{ubicacion.descripcion}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {totalUbicPages > 1 && (
          <div className="d-flex justify-content-center">
            {[...Array(totalUbicPages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={ubicacionPage === index + 1 ? "primary" : "outlineprimary"}
                className="me-1"
                onClick={() => setUbicacionPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        )}
      </>
    );
  };

  // Renderiza la vista de inventario (tabla de productos) para la bodega seleccionada.
  const renderInventoryManagement = () => {
    return (
      <>
        <Button variant="secondary" className="mb-3" onClick={() => setSelectedUbicacion(null)}>
          ← Volver a Ubicaciones
        </Button>
        <div style={{ maxWidth: "1200px", margin: "15 ", padding: "15px" }}>
          {/* Se agregan estilos custom para que las pestañas siempre tengan fondo */}
          <style>{`
  .nav-tabs .nav-link {
    background-color: white;
    color: black;
    margin-right: 10px; /* Aumenta el espacio entre pestañas */
    border: 1px solid #ccc;
    border-bottom: none;
  }
  .nav-tabs .nav-link:hover,
  .nav-tabs .nav-link:focus {
    background-color: white;
    color: black;
  }
  .nav-tabs .nav-link.active {
    background-color: white;
    color: black;
    border-color: #ccc;
    border-bottom-color: white;
  }
`}</style>

          <Tabs defaultActiveKey="stock" id="inventory-tabs" className="mb-3">
            <Tab eventKey="stock" title="Stock">
              {loadingProducts ? (
                <p>Cargando productos...</p>
              ) : (
                <Table striped bordered responsive>
                  <thead style={{ backgroundColor: "#0775e3", color: "white" }}>
                    <tr>
                      <th>ID</th>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Stock Actual</th>
                      <th>Precio</th>
                      <th>Categoría</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length ? (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id}>
                          <td>{prod.id}</td>
                          <td>{prod.codigo}</td>
                          <td>{prod.nombre}</td>
                          <td>{prod.stock}</td>
                          <td>{prod.precio}</td>
                          <td>{prod.categoria}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No se encontraron productos para esta bodega.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Tab>
            <Tab eventKey="categorias" title="Categorías">
              {Object.keys(
                filteredProducts.reduce((acc, prod) => {
                  const category = prod.categoria || "Sin categoría";
                  acc[category] = (acc[category] || 0) + prod.stock;
                  return acc;
                }, {})
              ).length === 0 ? (
                <p>No hay productos para agrupar.</p>
              ) : (
                <Table striped bordered responsive>
                  <thead style={{ backgroundColor: "#0775e3", color: "white" }}>
                    <tr>
                      <th>Categoría</th>
                      <th>Stock Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      filteredProducts.reduce((acc, prod) => {
                        const category = prod.categoria || "Sin categoría";
                        acc[category] = (acc[category] || 0) + prod.stock;
                        return acc;
                      }, {})
                    ).map(([categoria, total]) => (
                      <tr key={categoria}>
                        <td>{categoria}</td>
                        <td>{total}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </div>
      </>
    );
  };

  return (
    <Container fluid className="mt-4">
      <ToastContainer />
      {!selectedUbicacion ? (
        <>
          <h2>Seleccione una Bodega</h2>
          {renderUbicacionesCards()}
        </>
      ) : (
        renderInventoryManagement()
      )}
    </Container>
  );
};

export default InventoryControl;
