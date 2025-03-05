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

  return (
    <div className="container mt-4">
      <table className="table table-bordered">
        <thead className="table-dark">
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
                <button className="btn btn-darger" onClick={() => deleteRow(row.id)}>
                  <FaTrash/>
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