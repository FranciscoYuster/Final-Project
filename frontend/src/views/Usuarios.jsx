import React, { useState, useEffect } from "react";
import { FaTrash, FaSave, FaPlus } from "react-icons/fa";
import axios from "axios";
import { baseUrl } from "../config";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Carga inicial de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/api/admin/users`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          const formattedUsers = response.data.map((user) => ({
            id: user.id,
            email: user.email,
            password: user.password,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isNew: false,
          }));
          setUsers(formattedUsers);
        } else {
          setUsers([]);
        }
      } catch (error) {
        toast.error("Error al cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Manejo de cambios en los inputs
  const handleInputChange = (id, field, value) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, [field]: value } : user)));
  };

  // Agregar nuevo usuario (máximo 3)
  const addRow = () => {
    if (users.length >= 3) {
      toast.error("Ya se ha alcanzado el límite máximo de 3 usuarios.");
      return;
    }
    setUsers([
      ...users,
      { id: Date.now(), email: "", password: "", firstName: "", lastName: "", role: "empleado", isNew: true },
    ]);
  };

  // Eliminar usuario (confirmación)
  const deleteUser = async (id) => {
    try {
      const response = await axios.delete(`${baseUrl}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
      });
      if (response.status === 200 || response.status === 204) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        toast.success("Usuario eliminado correctamente.");
      } else {
        toast.error("Error al eliminar el usuario.");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo eliminar el usuario.");
    }
  };

  const confirmDeleteUser = (id) => {
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  const confirmDelete = () => {
    deleteUser(userToDelete);
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  // Guardar (crear o actualizar) usuario
  const saveUser = async (user) => {
    if (!user.email || !user.password || !user.firstName || !user.lastName) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }
    try {
      if (user.isNew) {
        await axios.post(`${baseUrl}/api/admin/register`, user, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
        });
      } else {
        await axios.put(`${baseUrl}/api/admin/users/${user.id}`, user, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
        });
      }
      // Refrescar la lista de usuarios
      const response = await axios.get(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
      });
      if (Array.isArray(response.data)) {
        const formattedUsers = response.data.map((user) => ({
          id: user.id,
          email: user.email,
          password: user.p,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isNew: false,
        }));
        setUsers(formattedUsers);
      }
      toast.success("Usuario guardado correctamente.");
    } catch {
      toast.error("Error al guardar el usuario.");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h1 className="mb-3 text-white">Usuarios</h1>

      {loading ? (
        <div>Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className="alert alert-info">No hay usuarios registrados.</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th className="text-center text-white">#</th>
              <th className="text-center text-white">Email</th>
              <th className="text-center text-white">Contraseña</th>
              <th className="text-center text-white">Nombre</th>
              <th className="text-center text-white">Apellido</th>
              <th className="text-center text-white">Rol</th>
              <th className="text-center text-white">Acción</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className={user.isNew ? "table-warning" : "table-success"}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="email"
                    className="form-control"
                    value={user.email}
                    onChange={(e) => handleInputChange(user.id, "email", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="password"
                    className="form-control"
                    value={user.password}
                    onChange={(e) => handleInputChange(user.id, "password", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={user.firstName}
                    onChange={(e) => handleInputChange(user.id, "firstName", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={user.lastName}
                    onChange={(e) => handleInputChange(user.id, "lastName", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="form-select"
                    value={user.role}
                    onChange={(e) => handleInputChange(user.id, "role", e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="empleado">Empleado</option>
                  </select>
                </td>
                <td>
                  <div className="d-flex">
                    <button className="btn btn-success me-2" onClick={() => saveUser(user)}>
                      <FaSave />
                    </button>
                    <button className="btn btn-danger" onClick={() => confirmDeleteUser(user.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {users.length < 3 && (
        <button className="btn btn-primary" onClick={addRow}>
          <FaPlus /> Agregar nuevo usuario
        </button>
      )}

      {showConfirmModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block" }} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={cancelDelete}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar este usuario?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
