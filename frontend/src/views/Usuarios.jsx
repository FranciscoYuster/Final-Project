import { useState } from "react";
import { FaTrash, FaSave } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "", contraseña: "", permisos: "empleado" },
  ]);

  const addUsuario = () => {
    setUsuarios([...usuarios, { id: usuarios.length + 1, nombre: "", contraseña: "", permisos: "empleado" }]);
  };

  const deleteUsuario = (id) => {
    setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
  };

  const handleChange = (id, field, value) => {
    setUsuarios(
      usuarios.map((usuario) =>
        usuario.id === id ? { ...usuario, [field]: value } : usuario
      )
    );
  };

  return (
    <div className="container mt-4">
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Contraseña</th>
            <th>Permisos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario, index) => (
            <tr key={usuario.id}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={usuario.nombre}
                  onChange={(e) => handleChange(usuario.id, "nombre", e.target.value)}
                  placeholder="Nombre"
                />
              </td>
              <td>
                <input
                  type="password"
                  className="form-control"
                  value={usuario.contraseña}
                  onChange={(e) => handleChange(usuario.id, "contraseña", e.target.value)}
                  placeholder="Contraseña"
                />
              </td>
              <td>
                <select
                  className="form-control"
                  value={usuario.permisos}
                  onChange={(e) => handleChange(usuario.id, "permisos", e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="empleado">Empleado</option>
                </select>
              </td>
              <td>
                <button className="btn btn-success me-2">
                  <FaSave />
                </button>
                <button className="btn btn-danger" onClick={() => deleteUsuario(usuario.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-primary" onClick={addUsuario}>Agregar Usuario</button>
    </div>
  );
}
