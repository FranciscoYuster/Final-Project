import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [newMovement, setNewMovement] = useState({
    product_id: '',
    type: '',
    quantity: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Se asume que el token se almacena en localStorage tras autenticarse
  const token = localStorage.getItem('token');

  const fetchMovements = async () => {
    try {
      const response = await axios.get('/api/movements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovements(response.data);
    } catch (err) {
      setError('Error fetching movements');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovement({ ...newMovement, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/movements', newMovement, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Movement created successfully!');
      fetchMovements();
      setNewMovement({ product_id: '', type: '', quantity: '' });
    } catch (err) {
      setError('Error creating movement');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/movements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Movement deleted successfully!');
      fetchMovements();
    } catch (err) {
      setError('Error deleting movement');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Movimientos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <ul>
        {movements.map((movement) => (
          <li key={movement.id}>
            <strong>ID:</strong> {movement.id} | <strong>Producto:</strong> {movement.product_id} |{' '}
            <strong>Tipo:</strong> {movement.type} | <strong>Cantidad:</strong> {movement.quantity} |{' '}
            <strong>Fecha:</strong> {movement.date}
            <button onClick={() => handleDelete(movement.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <h3>Crear nuevo movimiento</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Producto ID:</label>
          <input
            type="text"
            name="product_id"
            value={newMovement.product_id}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Tipo (sale/purchase):</label>
          <input
            type="text"
            name="type"
            value={newMovement.type}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Cantidad:</label>
          <input
            type="number"
            name="quantity"
            value={newMovement.quantity}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Crear Movimiento</button>
      </form>
    </div>
  );
};

export default Movements;
