import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, 
  FaFileCsv, FaFileExcel, FaFilePdf
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const InventoryManagement = () => {
  // Estados para productos y carga
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Estados para filtros avanzados (usamos los nombres de propiedades que devuelve el backend)
  const [globalFilter, setGlobalFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [productMovements, setProductMovements] = useState([]);

  const token = sessionStorage.getItem('access_token');

  // Función para obtener productos del backend
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrado avanzado (usamos row.nombre y row.descripcion)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesGlobal =
        (product.nombre?.toLowerCase() || "").includes(globalFilter.toLowerCase()) ||
        (product.descripcion?.toLowerCase() || "").includes(globalFilter.toLowerCase());
      const price = parseFloat(product.precio);
      const matchesMin = minPrice ? price >= parseFloat(minPrice) : true;
      const matchesMax = maxPrice ? price <= parseFloat(maxPrice) : true;
      return matchesGlobal && matchesMin && matchesMax;
    });
  }, [products, globalFilter, minPrice, maxPrice]);

  // Función para agregar nuevo producto
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Se generan valores por defecto para "codigo" y "categoria" si no se ingresan.
      const productData = {
        codigo: Math.floor(Math.random() * 1000000).toString(), // Genera un código aleatorio
        nombre: newProduct.name,
        descripcion: newProduct.description,
        precio: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        categoria: "General", // Valor por defecto; ajústalo según tus necesidades
        inventory_id: 1, // Asegúrate de que exista este inventario en la base de datos
        user_id: sessionStorage.getItem('user_id') || "1",
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
      setNewProduct({ name: '', description: '', price: '', stock: '' });
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al crear el producto.');
    }
  };

  // Función para editar producto
  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        nombre: editProduct.nombre || editProduct.name,
        descripcion: editProduct.descripcion || editProduct.description,
        precio: parseFloat(editProduct.precio || editProduct.price),
        stock: parseInt(editProduct.stock),
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

  // Función para eliminar producto
  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      await response.json();
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado.');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto.');
    }
  };

  // Función para obtener historial de movimientos de un producto
  const fetchMovements = async (productId) => {
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

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditProduct(null);
  };

  // KPIs
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;

  // Configuración del gráfico de barras para stock
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

  // Columnas para la tabla de productos (adaptadas a las propiedades en español)
  const columns = [
    {
      name: '#',
      cell: (row, index) => index + 1,
      width: '40px',
    },
    {
      name: 'Nombre',
      selector: row => row.nombre,
      sortable: true,
    },
    {
      name: 'Descripción',
      selector: row => row.descripcion,
      sortable: false,
      wrap: true,
    },
    {
      name: 'Precio',
      selector: row => row.precio,
      sortable: true,
      format: row => {
        const price = parseFloat(row.precio);
        return isNaN(price) ? '$0.00' : `$${price.toFixed(2)}`;
      },
    },
    {
      name: 'Stock',
      selector: row => row.stock,
      sortable: true,
      cell: row =>
        row.stock < 10 ? (
          <span className="badge bg-danger">{row.stock}</span>
        ) : (
          row.stock
        ),
    },
    {
      name: 'Acciones',
      cell: row => (
        <>
          <button 
            className="btn btn-warning btn-sm me-1"
            onClick={() => {
              setEditProduct(row);
              setShowEditModal(true);
            }}
          >
            <FaEdit />
          </button>
          <button 
            className="btn btn-info btn-sm me-1"
            onClick={() => fetchMovements(row.id)}
          >
            <FaEye />
          </button>
          <button 
            className="btn btn-danger btn-sm"
            onClick={() => handleDeleteProduct(row.id)}
          >
            <FaTrash />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Funciones de exportación
  const exportCSV = () => {
    const headers = ["ID", "Nombre", "Descripción", "Precio", "Stock"];
    const rows = filteredProducts.map(p => [p.id, p.nombre, p.descripcion, p.precio, p.stock]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
    rows.forEach(rowArray => {
      csvContent += rowArray.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportXLSX = () => {
    const headers = ["ID", "Nombre", "Descripción", "Precio", "Stock"];
    const dataArr = filteredProducts.map(p => [p.id, p.nombre, p.descripcion, p.precio, p.stock]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataArr]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "inventario.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Nombre", "Descripción", "Precio", "Stock"];
    const tableRows = filteredProducts.map(p => [p.id, p.nombre, p.descripcion, p.precio, p.stock]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
    doc.save("inventario.pdf");
  };

  const containerStyle = { maxWidth: '800px', margin: '0 auto', fontSize: '0.9rem' };

  // Estilos para react-data-table-component
  const customStyles = {
    rows: { style: { fontSize: '0.8rem', padding: '4px' } },
    headCells: { style: { fontSize: '0.8rem', padding: '4px' } },
    cells: { style: { fontSize: '0.8rem', padding: '4px' } },
  };

  // Opciones de paginación
  const paginationComponentOptions = {
    rowsPerPageText: 'Filas por página:',
    rangeSeparatorText: 'de',
    selectAllRowsItem: false,
  };

  return (
    <div style={containerStyle} className="mt-4">
      <ToastContainer />
      <h1 className="mb-3">Gestión de Inventario</h1>
      
      {/* KPIs */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <div className="card bg-primary text-white">
            <div className="card-body p-2">
              <h6 className="card-title">Total de Productos</h6>
              <p className="card-text">{totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="card bg-success text-white">
            <div className="card-body p-2">
              <h6 className="card-title">Stock Total</h6>
              <p className="card-text">{totalStock}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-2">
          <div className="card bg-danger text-white">
            <div className="card-body p-2">
              <h6 className="card-title">Stock Bajo</h6>
              <p className="card-text">{lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico de barras */}
      <div className="mb-3" style={{ height: '300px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      {/* Filtros avanzados */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-sm mb-2"
          placeholder="Búsqueda global (nombre o descripción)..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          style={{ fontSize: '0.8rem' }}
        />
        <div className="d-flex gap-2">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Precio mínimo"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            style={{ fontSize: '0.8rem' }}
          />
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Precio máximo"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      </div>
      
      {/* Botones de exportación */}
      <div className="mb-2 d-flex gap-2">
        <button className="btn btn-success btn-sm" onClick={exportCSV}>
          <FaFileCsv className="me-1" /> CSV
        </button>
        <button className="btn btn-info btn-sm" onClick={exportXLSX}>
          <FaFileExcel className="me-1" /> XLSX
        </button>
        <button className="btn btn-danger btn-sm" onClick={exportPDF}>
          <FaFilePdf className="me-1" /> PDF
        </button>
      </div>
      
      {/* Botón para agregar producto */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
          <FaPlus className="me-1" /> Agregar Producto
        </button>
      </div>
      
      {/* Tabla de productos */}
      {loadingProducts ? (
        <div>Cargando productos...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProducts}
          customStyles={customStyles}
          pagination
          paginationPerPage={5}
          paginationComponentOptions={paginationComponentOptions}
          defaultSortField="nombre"
          highlightOnHover
          dense
        />
      )}
      
      {/* Modal para agregar producto */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <form onSubmit={handleAddProduct}>
                <div className="modal-header py-2">
                  <h5 className="modal-title">Agregar Producto</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body py-2">
                  <div className="mb-2">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={newProduct.name} 
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descripción</label>
                    <textarea 
                      className="form-control form-control-sm" 
                      value={newProduct.description} 
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Precio</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={newProduct.price} 
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      step="0.01"
                      required 
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Stock</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={newProduct.stock} 
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para editar producto */}
      {showEditModal && editProduct && (
        <div className="modal fade show" style={{ display: 'block' }} aria-modal="true" role="dialog">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <form onSubmit={handleEditProduct}>
                <div className="modal-header py-2">
                  <h5 className="modal-title">Editar Producto</h5>
                  <button type="button" className="btn-close" onClick={handleCloseEditModal}></button>
                </div>
                <div className="modal-body py-2">
                  <div className="mb-2">
                    <label className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={editProduct.nombre || editProduct.name} 
                      onChange={(e) => setEditProduct({ ...editProduct, nombre: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descripción</label>
                    <textarea 
                      className="form-control form-control-sm" 
                      value={editProduct.descripcion || editProduct.description} 
                      onChange={(e) => setEditProduct({ ...editProduct, descripcion: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Precio</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={editProduct.precio || editProduct.price} 
                      onChange={(e) => setEditProduct({ ...editProduct, precio: e.target.value })}
                      step="0.01"
                      required 
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Stock</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={editProduct.stock} 
                      onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer py-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleCloseEditModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para historial de movimientos */}
      {showMovementsModal && (
        <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h5 className="modal-title">Historial de Movimientos</h5>
                <button type="button" className="btn-close" onClick={() => setShowMovementsModal(false)}></button>
              </div>
              <div className="modal-body py-2">
                <table className="table table-bordered table-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productMovements.map((mov, index) => (
                      <tr key={mov.id}>
                        <td>{index + 1}</td>
                        <td>{mov.type}</td>
                        <td>{mov.quantity}</td>
                        <td>{new Date(mov.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {productMovements.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center">No se encontraron movimientos</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer py-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMovementsModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
