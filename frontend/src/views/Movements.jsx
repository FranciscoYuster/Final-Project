import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newMovement, setNewMovement] = useState({
    product_id: '',
    type: '', // "sale" o "purchase"
    quantity: '',
  });

  const token = sessionStorage.getItem('access_token');

  // Cargar movimientos del inventario
  const fetchMovements = async () => {
    setLoadingMovements(true);
    try {
      const response = await fetch('/api/movements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setMovements(data);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Error al cargar movimientos.');
    } finally {
      setLoadingMovements(false);
    }
  };

  // Cargar lista de productos
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
    fetchMovements();
    fetchProducts();
  }, []);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovement((prev) => ({ ...prev, [name]: value }));
  };

  // Crear un movimiento manual
  const handleAddMovement = async (e) => {
    e.preventDefault();
    if (!newMovement.product_id || !newMovement.type || !newMovement.quantity) {
      toast.error('Todos los campos son requeridos.');
      return;
    }
    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: newMovement.product_id,
          type: newMovement.type,
          quantity: parseInt(newMovement.quantity)
        })
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const createdMovement = await response.json();
      setMovements((prev) => [...prev, createdMovement]);
      toast.success('Movimiento creado correctamente.');
      setNewMovement({ product_id: '', type: '', quantity: '' });
    } catch (error) {
      console.error('Error creating movement:', error);
      toast.error('Error al crear movimiento.');
    }
  };

  // Eliminar movimiento
  const handleDeleteMovement = async (id) => {
    try {
      const response = await fetch(`/api/movements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      setMovements((prev) => prev.filter((mov) => mov.id !== id));
      toast.success('Movimiento eliminado.');
    } catch (error) {
      console.error('Error deleting movement:', error);
      toast.error('Error al eliminar movimiento.');
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1>Historial de Movimientos</h1>

      {/* Formulario para crear movimiento */}
      <form onSubmit={handleAddMovement} className="mb-4">
        <div className="mb-2">
          <label>Producto:</label>
          {loadingProducts ? (
            <p>Cargando productos...</p>
          ) : (
            <select
              name="product_id"
              value={newMovement.product_id}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nombre} ({product.codigo})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="mb-2">
          <label>Tipo (sale/purchase):</label>
          <input
            type="text"
            name="type"
            value={newMovement.type}
            onChange={handleInputChange}
            className="form-control"
            placeholder="sale o purchase"
            required
          />
        </div>
        <div className="mb-2">
          <label>Cantidad:</label>
          <input
            type="number"
            name="quantity"
            value={newMovement.quantity}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Agregar Movimiento
        </button>
      </form>

      {/* Lista de movimientos */}
      {loadingMovements ? (
        <p>Cargando movimientos...</p>
      ) : movements.length === 0 ? (
        <p>No hay movimientos.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto ID</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Fecha</th>
              <th>Registrado Por</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((mov, index) => (
              <tr key={mov.id}>
                <td>{index + 1}</td>
                <td>{mov.product_id}</td>
                <td>{mov.type}</td>
                <td>{mov.quantity}</td>
                <td>{mov.date ? new Date(mov.date).toLocaleDateString() : ''}</td>
                <td>{mov.registered_by && mov.registered_by.name ? mov.registered_by.name : 'N/D'}</td>
                <td>{mov.registered_by && mov.registered_by.role ? mov.registered_by.role : 'N/D'}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteMovement(mov.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Movements;
