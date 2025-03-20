import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Table, 
  InputGroup, 
  FormControl, 
  Tabs, 
  Tab 
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const baseUrl = import.meta.env.VITE_BASE_URL;

const InventoryControl = () => {
  const token = sessionStorage.getItem('access_token');

  // Estado para gestionar la ubicación seleccionada.
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);

  // Estados para Ubicaciones.
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(false);
  const [searchUbicacion, setSearchUbicacion] = useState("");
  const [ubicacionPage, setUbicacionPage] = useState(1);
  const ubicacionesPerPage = 5;

  // Estados para productos y su carga.
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Función para obtener Ubicaciones.
  const fetchUbicaciones = async () => {
    setLoadingUbicaciones(true);
    try {
      const response = await fetch(`${baseUrl}/api/ubicaciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setUbicaciones(data);
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
      toast.error('Error al cargar ubicaciones.');
    } finally {
      setLoadingUbicaciones(false);
    }
  };

  // Función para obtener Productos.
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`${baseUrl}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Al inicio se cargan las ubicaciones.
  useEffect(() => {
    fetchUbicaciones();
  }, []);

  // Cuando se selecciona una ubicación, se cargan los productos.
  useEffect(() => {
    if (selectedUbicacion) {
      fetchProducts();
    }
  }, [selectedUbicacion]);

  // Filtrar ubicaciones por búsqueda y paginación.
  const filteredUbicaciones = ubicaciones.filter(u =>
    u.nombre.toLowerCase().includes(searchUbicacion.toLowerCase())
  );
  const totalUbicPages = Math.ceil(filteredUbicaciones.length / ubicacionesPerPage);
  const currentUbicaciones = filteredUbicaciones.slice(
    (ubicacionPage - 1) * ubicacionesPerPage,
    ubicacionPage * ubicacionesPerPage
  );

  // Filtrar productos por la ubicación seleccionada (se asume que cada producto tiene "ubicacion_id").
  const filteredProducts = products.filter(prod =>
    prod.ubicacion_id === selectedUbicacion?.id
  );

  // Agregar una función para agrupar el stock por categoría.
  const stockByCategory = filteredProducts.reduce((acc, prod) => {
    const category = prod.categoria || 'Sin categoría';
    acc[category] = (acc[category] || 0) + prod.stock;
    return acc;
  }, {});

  // Renderizado de las Ubicaciones en tarjetas.
  const renderUbicacionesCards = () => {
    if (loadingUbicaciones) return <p>Cargando ubicaciones...</p>;
    if (!ubicaciones.length) return <p>No se encontraron ubicaciones.</p>;
    return (
      <Row>
        {currentUbicaciones.map(ubicacion => (
          <Col key={ubicacion.id} md={4} className="mb-3">
            <Card onClick={() => setSelectedUbicacion(ubicacion)} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title>{ubicacion.nombre}</Card.Title>
                <Card.Text>{ubicacion.descripcion}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Renderizado de la vista de Gestión de Inventario para la Ubicación seleccionada.
  // Se muestran dos pestañas: "Stock" y "Categorías".
  const renderInventoryManagement = () => {
    return (
      <>
        <Button variant="outline-secondary" className="mb-3" onClick={() => setSelectedUbicacion(null)}>
          ← Volver a Ubicaciones
        </Button>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Tabs defaultActiveKey="stock" id="inventory-tabs" className="mb-3">
            <Tab eventKey="stock" title="Stock">
              {loadingProducts ? (
                <p>Cargando productos...</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
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
                    {filteredProducts.map(prod => (
                      <tr key={prod.id}>
                        <td>{prod.id}</td>
                        <td>{prod.codigo}</td>
                        <td>{prod.nombre}</td>
                        <td>{prod.stock}</td>
                        <td>{prod.precio}</td>
                        <td>{prod.categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
            <Tab eventKey="categorias" title="Categorías">
              {Object.keys(stockByCategory).length === 0 ? (
                <p>No hay productos para agrupar.</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Stock Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stockByCategory).map(([categoria, total]) => (
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
          {totalUbicPages > 1 && (
            <div className="d-flex justify-content-center">
              {[...Array(totalUbicPages)].map((_, index) => (
                <Button 
                  key={index + 1} 
                  variant={ubicacionPage === index + 1 ? "primary" : "outline-primary"} 
                  className="me-1" 
                  onClick={() => setUbicacionPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}
        </>
      ) : (
        renderInventoryManagement()
      )}
    </Container>
  );
};

export default InventoryControl;
