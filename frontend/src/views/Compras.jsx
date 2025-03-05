import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EditableTable() {
  const [rows, setRows] = useState([
    {
      id: 1,
      cantidad: "",
      articulo: "",
      tipo: "",
      número: "",
      proveedor: "",
      precio: "",
      total: "",
    },
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        cantidad: "",
        articulo: "",
        tipo: "",
        número: "",
        proveedor: "",
        precio: "",
        total: "",
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

  return (
    <div className="container mt-4">
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Cantidad</th>
            <th>Articulo</th>
            <th>Tipo de ingreso </th>
            <th>Número de comprobante</th>
            <th>Proveedor</th>
            <th>Precio</th>
            <th>total</th>
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
                  value={row.cantidad}
                  onChange={(e) =>
                    handleChange(row.id, "cantidad", e.target.value)
                  }
                  placeholder="Cantidad"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.articulo}
                  onChange={(e) =>
                    handleChange(row.id, "articulo", e.target.value)
                  }
                  placeholder="Articulo"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.tipo}
                  onChange={(e) => handleChange(row.id, "tipo", e.target.value)}
                  placeholder="Tipo de ingreso"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.número}
                  onChange={(e) =>
                    handleChange(row.id, "número", e.target.value)
                  }
                  placeholder="Número de comprobante"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.proveedor}
                  onChange={(e) =>
                    handleChange(row.id, "proveedor", e.target.value)
                  }
                  placeholder="Proveedor"
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
      <button className="btn btn-primary" onClick={addRow}>
        Add new row
      </button>
    </div>
  );
};