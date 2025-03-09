import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EditableTable() {
  const [rows, setRows] = useState([
    { id: 1, nombre: "", tipo: "", documento: "", telefono: "", email: "" },
  ]);

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        nombre: "",
        tipo: "",
        documento: "",
        telefono: "",
        email: "",
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
          <h1>Proveedores</h1>
          <tr>
            <th>#</th>
            <th>Nombre/Razon Social</th>
            <th>Tipo de documento</th>
            <th>Numero de documento</th>
            <th>Telefono</th>
            <th>Email</th>
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
                  placeholder="Nombre/Razon Social"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.tipo}
                  onChange={(e) => handleChange(row.id, "tipo", e.target.value)}
                  placeholder="Tipo de documento"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.documento}
                  onChange={(e) =>
                    handleChange(row.id, "documento", e.target.value)
                  }
                  placeholder="Numero de documento"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={row.telefono}
                  onChange={(e) =>
                    handleChange(row.id, "telefono", e.target.value)
                  }
                  placeholder="Telefono"
                />
              </td>
              <td>
                <input
                  type="email"
                  className="form-control"
                  value={row.email}
                  onChange={(e) =>
                    handleChange(row.id, "email", e.target.value)
                  }
                  placeholder="Email"
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
}
