import { useState } from "react";
import { FaSave, FaTrash, FaEraser, FaUpload } from "react-icons/fa"; // Íconos de FontAwesome
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProveedoresDashboard() {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    documento: "",
    telefono: "",
    email: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClear = () => {
    setForm({ nombre: "", tipo: "", documento: "", telefono: "", email: "" });
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Tabla de Proveedores */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">Lista de Proveedores</div>
            <div className="card-body">
              <table className="table table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Documento</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Proveedor 1</td>
                    <td>RUC</td>
                    <td>12345678</td>
                    <td>555-1234</td>
                    <td>proveedor@empresa.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Formulario de Proveedores */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header bg-success text-white">Agregar/Editar Proveedor</div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Nombre / Razón Social</label>
                  <input type="text" className="form-control" name="nombre" value={form.nombre} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de Documento</label>
                  <input type="text" className="form-control" name="tipo" value={form.tipo} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Número de Documento</label>
                  <input type="text" className="form-control" name="documento" value={form.documento} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <input type="text" className="form-control" name="telefono" value={form.telefono} onChange={handleChange} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
                </div>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-primary">
                    <FaSave /> Guardar
                  </button>
                  <button type="button" className="btn btn-warning" onClick={handleClear}>
                    <FaUpload /> Actualizar
                  </button>
                  <button type="button" className="btn btn-danger">
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
