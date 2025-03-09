import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EditableTable() {
  const [rows, setRows] = useState([
    {
      id: 1,
      nombre: "",
      categoria: "",
      codigo: "",
      precio: "",
    },
  ]);
  const [pagaCon, setPagaCon] = useState(0);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        nombre: "",
        categoria: "",
        codigo: "",
        precio: "",
      },
    ]);
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const totalPagar = rows.reduce(
    (sum, row) => sum + row.categoria * row.precio,
    0
  );
  const cambio = pagaCon - totalPagar;

  return (
    <div className="container mt-4">
      <table className="table table-bordered">
        <thead className="table-dark">
          <h1>Productos</h1>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Categoria</th>
            <th>Codigo</th>
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
                  value={row.nombre}
                  onChange={(e) =>
                    handleChange(row.id, "nombre", e.target.value)
                  }
                  placeholder="Nombre"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.categoria}
                  onChange={(e) =>
                    handleChange(row.id, "categoria", e.target.value)
                  }
                  placeholder="categoria"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.codigo}
                  onChange={(e) =>
                    handleChange(row.id, "codigo", e.target.value)
                  }
                  placeholder="Codigo"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.precio}
                  onChange={(e) =>
                    handleChange(row.id, "precio", e.target.value)
                  }
                  placeholder="Precio"
                />
              </td>
              <td>
                <button className="btn btn-primary" onClick={addRow}>
                ✔️
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteRow(row.id)}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="table table-bordered">
        <br />
        <tbody>
          <tr>
            <td className="table-dark">Categorias</td>
            <td>{totalPagar.toFixed(2)}</td>
          </tr>
          <tr>
            <td className="table-dark">cantidad</td>
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
            <td className="table-dark">Precio</td>
            <td>${cambio >= 0 ? cambio.toFixed(2) : "Insuficiente"}</td>
          </tr>
        </tbody>
      </table>

      <div className="d-flex gap-2">
        <button className="btn btn-success">Registrar Compra</button>
        <button
          className="btn btn-warning"
          onClick={() =>
            setRows([{ id: 1, producto: "", categoria: 1, precio: 0 }])
          }
        >
          Limpiar
        </button>
        <button className="btn btn-danger" onClick={() => setRows([])}>
          Eliminar
        </button>
      </div>
    </div>
  );
}
