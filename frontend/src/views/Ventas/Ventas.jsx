import React, { useState, useEffect } from 'react';
import './Ventas.css';

const Ventas = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [saleItems, setSaleItems] = useState([{ productId: '', quantity: 1 }]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Obtener token desde sessionStorage (igual que en Clientes.jsx)
  const token = sessionStorage.getItem('access_token');

  // Cargar productos
  useEffect(() => {
    fetch('/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error al obtener productos', err));
  }, []);

  // Cargar clientes
  useEffect(() => {
    fetch('/api/customers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error('Error al obtener clientes', err));
  }, [token]);

  // Calcular total de la venta
  useEffect(() => {
    const newTotal = saleItems.reduce((acc, item) => {
      const product = products.find((p) => p.id === parseInt(item.productId));
      return product ? acc + product.price * item.quantity : acc;
    }, 0);
    setTotal(newTotal);
  }, [saleItems, products]);

  // Manejo de cambios en los items de venta
  const handleSaleItemChange = (index, field, value) => {
    const newItems = [...saleItems];
    newItems[index][field] = value;
    setSaleItems(newItems);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { productId: '', quantity: 1 }]);
  };

  const removeSaleItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  // Enviar la venta: primero crea la factura y luego los items de venta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (!selectedCustomerId) {
        throw new Error('Debe seleccionar un cliente.');
      }
      // Crear factura asociada al cliente seleccionado
      const invoicePayload = {
        total: total,
        customer_id: selectedCustomerId,
        status: 'Pending'
      };

      const invoiceResponse = await fetch('/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoicePayload)
      });

      if (!invoiceResponse.ok) {
        throw new Error('Error al crear la factura');
      }
      const invoiceData = await invoiceResponse.json();

      // Registrar cada item de venta
      for (const item of saleItems) {
        const product = products.find((p) => p.id === parseInt(item.productId));
        if (!product) continue;

        const salePayload = {
          product_id: product.id,
          quantity: item.quantity,
          total: product.price * item.quantity,
          // Opcional: invoice_id: invoiceData.id si el backend requiere asociar la venta a la factura
        };

        const saleResponse = await fetch('/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(salePayload)
        });
        if (!saleResponse.ok) {
          throw new Error(`Error al crear la venta para ${product.name}`);
        }
      }
      setMessage('Venta y factura generadas exitosamente.');
      // Reiniciar formulario
      setSaleItems([{ productId: '', quantity: 1 }]);
      setSelectedCustomerId('');
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ventas-container">
      <h1>Generar Venta</h1>
      <form onSubmit={handleSubmit} className="ventas-form">
        <section className="ventas-section">
          <h2>Seleccionar Cliente</h2>
          <select 
            value={selectedCustomerId} 
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="ventas-select"
            required
          >
            <option value="">Seleccione un cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </section>

        <section className="ventas-section">
          <h2>Productos</h2>
          {saleItems.map((item, index) => (
            <div key={index} className="ventas-item">
              <select
                value={item.productId}
                onChange={(e) => handleSaleItemChange(index, 'productId', e.target.value)}
                className="ventas-select"
                required
              >
                <option value="">Seleccione un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (${product.price})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleSaleItemChange(index, 'quantity', parseInt(e.target.value))
                }
                className="ventas-input"
                required
              />
              {saleItems.length > 1 && (
                <button type="button" onClick={() => removeSaleItem(index)} className="ventas-delete-button">
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSaleItem} className="ventas-add-button">
            Agregar producto
          </button>
        </section>

        <h3 className="ventas-total">Total: ${total.toFixed(2)}</h3>
        <button type="submit" className="ventas-button" disabled={loading}>
          {loading ? 'Procesando...' : 'Generar Venta'}
        </button>
      </form>
      {message && <p className="ventas-message">{message}</p>}
    </div>
  );
};

export default Ventas;
