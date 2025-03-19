// src/views/InventoryManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaPlus, FaEdit, FaEye } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Pagination, Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

import KPISection from './components/KPISections';
import Filters from './components/Filters';
import ExportButtons from './components/ExportButtons';
import ProductModal from './components/ProductModal';
import MovementsModal from './components/MovementsModal';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const LOW_STOCK_THRESHOLD = 10;

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '', ubicacion_id: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [productMovements, setProductMovements] = useState([]);
  
  const token = sessionStorage.getItem('access_token');
  
  // Función para cargar productos
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Función para cargar ubicaciones
  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch('/api/ubicaciones', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Error al cargar ubicaciones.');
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchLocations();
  }, []);

  // Filtrado de productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesGlobal = (product.nombre?.toLowerCase() || "").includes(globalFilter.toLowerCase()) ||
                            (product.descripcion?.toLowerCase() || "").includes(globalFilter.toLowerCase());
      const price = parseFloat(product.precio);
      const matchesMin = minPrice ? price >= parseFloat(minPrice) : true;
      const matchesMax = maxPrice ? price <= parseFloat(maxPrice) : true;
      return matchesGlobal && matchesMin && matchesMax;
    });
  }, [products, globalFilter, minPrice, maxPrice]);

  const isValidStock = stock => !isNaN(parseInt(stock)) && parseInt(stock) >= 0;
  const isValidPrice = price => !isNaN(parseFloat(price)) && parseFloat(price) >= 0;

  // Agregar producto
  const handleAddProduct = async e => {
    e.preventDefault();
    if (!isValidStock(newProduct.stock)) { 
      toast.error('El stock debe ser un número no negativo.'); 
      return; 
    }
    if (!isValidPrice(newProduct.price)) { 
      toast.error('El precio debe ser un número no negativo.'); 
      return; 
    }
    if (!newProduct.ubicacion_id) { 
      toast.error('Debe seleccionar una ubicación.'); 
      return; 
    }
    try {
      const productData = {
        codigo: Math.floor(Math.random() * 1000000).toString(),
        nombre: newProduct.name,
        descripcion: newProduct.description,
        precio: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        categoria: "General",
        inventory_id: 1,
        user_id: sessionStorage.getItem('user_id') || "1",
        ubicacion_id: newProduct.ubicacion_id
      };
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const createdProduct = await response.json();
      setProducts(prev => [...prev, createdProduct]);
      toast.success('Producto creado exitosamente.');
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', price: '', stock: '', ubicacion_id: '' });
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al crear el producto.');
    }
  };

  // Editar producto
  const handleEditProduct = async e => {
    e.preventDefault();
    if (!isValidStock(editProduct.stock)) { 
      toast.error('El stock debe ser un número no negativo.'); 
      return; 
    }
    if (!isValidPrice(editProduct.precio || editProduct.price)) { 
      toast.error('El precio debe ser un número no negativo.'); 
      return; 
    }
    if (!editProduct.ubicacion_id) { 
      toast.error('Debe seleccionar una ubicación.'); 
      return; 
    }
    try {
      const productData = {
        nombre: editProduct.nombre,
        descripcion: editProduct.descripcion,
        precio: parseFloat(editProduct.precio),
        stock: parseInt(editProduct.stock),
        ubicacion_id: editProduct.ubicacion_id
      };
      const response = await fetch(`/api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const updatedProduct = await response.json();
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast.success('Producto actualizado.');
      setShowEditModal(false);
      setEditProduct(null);
    } catch (error) {
      console.error('Error editing product:', error);
      toast.error('Error al actualizar el producto.');
    }
  };

  // Obtener movimientos de un producto
  const fetchMovements = async productId => {
    try {
      const response = await fetch(`/api/movements?product_id=${productId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setProductMovements(data);
      setShowMovementsModal(true);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Error al cargar el historial de movimientos.');
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
  };

  // Cálculo de KPIs
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < LOW_STOCK_THRESHOLD).length;

  // Configuración del gráfico de barras
  const chartData = {
    labels: products.map(p => p.nombre),
    datasets: [
      {
        label: 'Stock actual',
        data: products.map(p => p.stock),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 10 } } },
      title: { display: true, text: 'Distribución de Stock', font: { size: 14 } }
    },
    scales: {
      x: { ticks: { font: { size: 10 } } },
      y: { ticks: { font: { size: 10 } } }
    }
  };

  // Configuración para la tabla de productos
  const columns = [
    { name: '#', cell: (row, index) => index + 1, width: '40px' },
    { name: 'Nombre', selector: row => row.nombre, sortable: true },
    { name: 'Descripción', selector: row => row.descripcion, sortable: false, wrap: true },
    { name: 'Precio', selector: row => row.precio, sortable: true, format: row => `$${row.precio.toFixed(2)}` },
    { name: 'Stock', selector: row => row.stock, sortable: true, cell: row => row.stock < LOW_STOCK_THRESHOLD ? <span className="badge bg-danger">{row.stock}</span> : row.stock },
    { name: 'Ubicación', selector: row => row.ubicacion ? row.ubicacion.nombre : 'Sin asignar', sortable: true },
    {
      name: 'Acciones',
      cell: row => (
        <>
          <button className="btn btn-warning btn-sm me-1" onClick={() => { setEditProduct(row); setShowEditModal(true); }}>
            <FaEdit />
          </button>
          <button className="btn btn-info btn-sm me-1" onClick={() => fetchMovements(row.id)}>
            <FaEye />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Funciones de exportación (lógica pendiente)
  const exportCSV = () => { /* lógica de exportación */ };
  const exportXLSX = () => { /* lógica de exportación */ };
  const exportPDF = () => { /* lógica de exportación */ };

  // Lógica para paginación
  const itemsPerPageLocal = 5;
  const totalPagesLocal = Math.ceil(filteredProducts.length / itemsPerPageLocal);
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPageLocal,
    currentPage * itemsPerPageLocal
  );
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="py-4">
      <ToastContainer />
      <header className="mb-4 text-center">
        <h1 className="fw-bold text-primary">Dashboard de Inventario</h1>
        <p className="text-muted">Control y gestión integral de productos</p>
      </header>

      {/* Sección de KPIs usando el componente KPISection */}
      <KPISection 
        totalProducts={totalProducts} 
        totalStock={totalStock} 
        lowStockCount={lowStockCount} 
      />

      {/* Gráfico de Stock */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">Distribución de Stock</Card.Header>
            <Card.Body style={{ height: '300px' }}>
              <Bar data={chartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros y Exportación */}
      <Row className="align-items-center mb-3">
        <Col md={6}>
          <Filters
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
          />
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <ExportButtons 
            exportCSV={exportCSV} 
            exportXLSX={exportXLSX} 
            exportPDF={exportPDF} 
          />
        </Col>
      </Row>

      {/* Botón para agregar producto */}
      <div className="d-flex justify-content-end mb-3">
        <Button
          variant="primary"
          className="rounded-pill"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-1" /> Nuevo Producto
        </Button>
      </div>

      {/* Tabla de Productos */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="p-0">
          {loadingProducts ? (
            <div className="p-3">Cargando productos...</div>
          ) : (
            <DataTable 
              columns={columns}
              data={currentItems}
              customStyles={{
                rows: { style: { fontSize: '0.8rem', padding: '4px' } },
                headCells: { style: { fontSize: '0.8rem', padding: '4px' } },
                cells: { style: { fontSize: '0.8rem', padding: '4px' } },
              }}
              pagination
              paginationPerPage={itemsPerPageLocal}
              paginationComponentOptions={{ rowsPerPageText: 'Filas por página:' }}
              defaultSortField="nombre"
              highlightOnHover
              dense
            />
          )}
        </Card.Body>
      </Card>

      {/* Paginación */}
      <Pagination className="mb-3 justify-content-center">
        <Pagination.Prev 
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        />
        {[...Array(totalPagesLocal)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={currentPage === index + 1}
            onClick={() => handlePageChange(index + 1)}
            className="bg-primary border-primary text-white"
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next 
          onClick={() => currentPage < totalPagesLocal && handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPagesLocal}
        />
      </Pagination>

      {/* Modales */}
      {showAddModal && (
        <ProductModal
          show={showAddModal}
          product={newProduct}
          onChange={e => setNewProduct({ ...newProduct, [e.target.name]: e.target.value })}
          onSubmit={handleAddProduct}
          onClose={() => setShowAddModal(false)}
          title="Nuevo Producto"
          locations={locations}
        />
      )}

      {showEditModal && editProduct && (
        <ProductModal
          show={showEditModal}
          product={editProduct}
          onChange={e => setEditProduct({ ...editProduct, [e.target.name]: e.target.value })}
          onSubmit={handleEditProduct}
          onClose={handleCloseEditModal}
          title="Editar Producto"
          locations={locations}
        />
      )}

      {showMovementsModal && (
        <MovementsModal
          show={showMovementsModal}
          movements={productMovements}
          onClose={() => setShowMovementsModal(false)}
        />
      )}
      
      <ToastContainer />
    </Container>
  );
};

export default InventoryManagement;
