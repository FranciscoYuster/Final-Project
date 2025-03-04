import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Ventas() {
  const [rows, setRows] = useState([
    { id: 1, producto: "", cantidad: 1, precio: 0 },
  ]);
  const [pagaCon, setPagaCon] = useState(0);

  const addRow = () => {
    setRows([...rows, { id: rows.length + 1, producto: "", cantidad: 1, precio: 0 }]);
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRows(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const totalPagar = rows.reduce((sum, row) => sum + row.cantidad * row.precio, 0);
  const cambio = pagaCon - totalPagar;

  return (
    <div className="container mt-4">
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.producto}
                  onChange={(e) => handleChange(row.id, "producto", e.target.value)}
                  placeholder="Producto"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.cantidad}
                  onChange={(e) => handleChange(row.id, "cantidad", Number(e.target.value))}
                  placeholder="Cantidad"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.precio}
                  onChange={(e) => handleChange(row.id, "precio", Number(e.target.value))}
                  placeholder="Precio"
                />
              </td>
              <td>
                <button className="btn btn-danger" onClick={() => deleteRow(row.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-primary mb-3" onClick={addRow}>Agregar Producto</button>

      <table className="table table-bordered">
        <tbody>
          <tr>
            <td>Total a Pagar</td>
            <td>${totalPagar.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Paga Con</td>
            <td>
              <input
                type="number"
                className="form-control"
                value={pagaCon}
                onChange={(e) => setPagaCon(Number(e.target.value))}
                placeholder="Ingrese el monto"
              />
            </td>
          </tr>
          <tr>
            <td>Cambio</td>
            <td>${cambio >= 0 ? cambio.toFixed(2) : "Insuficiente"}</td>
          </tr>
        </tbody>
      </table>

      <div className="d-flex gap-2">
        <button className="btn btn-success">Registrar Compra</button>
        <button className="btn btn-warning" onClick={() => setRows([{ id: 1, producto: "", cantidad: 1, precio: 0 }])}>Limpiar</button>
        <button className="btn btn-danger" onClick={() => setRows([])}>Eliminar</button>
      </div>
    </div>
  );
}
