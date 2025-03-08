import { useState, useEffect } from "react"; // Importa los hooks useState y useEffect de React
import { FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa"; // Importa iconos de react-icons (basura, guardar, cruz y añadir)
import axios from "axios"; // Importa la librería axios para realizar solicitudes HTTP
import { baseUrl } from "../config"; // Importa la URL base de configuración para las solicitudes
import "bootstrap/dist/css/bootstrap.min.css"; // Importa el CSS de Bootstrap para estilos

const Usuarios = () => {
  const [users, setUsers] = useState([]);  // Estado para almacenar los usuarios
  const [error, setError] = useState("");   // Estado para almacenar mensajes de error
  const [success, setSuccess] = useState(""); // Estado para almacenar mensajes de éxito
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Estado para controlar la visibilidad del modal de confirmación
  const [userToDelete, setUserToDelete] = useState(null); // Estado para almacenar el id del usuario a eliminar

  useEffect(() => {
    // Este hook se ejecuta cuando el componente se monta
    axios
      .get(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }, // Envía el token de autenticación con la solicitud
      })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Si la respuesta es un arreglo no vacío
          const formattedUsers = response.data.map((user) => ({
            id: user.id,
            email: user.email,
            password: "",
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isNew: false,
          }));
          setUsers(formattedUsers); // Actualiza el estado con los usuarios recibidos
        } else {
          setUsers([]); // Si no hay usuarios, establece un arreglo vacío
        }
      })
      .catch(() => {
        setError("Error al cargar los usuarios."); // Si hay un error, muestra un mensaje de error
      });
  }, []); // El segundo parámetro vacío [] asegura que solo se ejecute una vez al montarse el componente

  const handleInputChange = (id, field, value) => {
    // Maneja los cambios en los campos de los usuarios
    setUsers(users.map((user) => (user.id === id ? { ...user, [field]: value } : user)));
  };

  const addRow = () => {
    // Agrega una nueva fila (usuario) si no se ha alcanzado el límite de 3 usuarios
    if (users.length >= 3) {
      setError("Ya se ha alcanzado el límite máximo de 3 usuarios."); // Si hay 3 o más usuarios, muestra un error
      return;
    }
    setUsers([
      ...users,
      { id: Date.now(), email: "", password: "", firstName: "", lastName: "", role: "empleado", isNew: true },
    ]); // Si no, agrega un nuevo usuario vacío con un id único (basado en la fecha actual)
  };

  const deleteUser = async (id) => {
    // Elimina un usuario de la base de datos
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.delete(`${baseUrl}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` }, // Envía el token de autenticación
      });
  
      if (response.status === 200 || response.status === 204) {
        // Si la respuesta es exitosa (200 o 204), actualiza el estado de los usuarios
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        setSuccess("Usuario eliminado correctamente."); // Muestra un mensaje de éxito
      } else {
        setError("Error al eliminar el usuario."); // Si no es exitoso, muestra un mensaje de error
      }
    } catch (error) {
      setError(error.response?.data?.error || "No se pudo eliminar el usuario."); // Si hay un error en la solicitud, muestra el error
    }
  };

  const confirmDeleteUser = (id) => {
    // Abre el modal de confirmación para eliminar un usuario
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  const cancelDelete = () => {
    // Cierra el modal de confirmación sin eliminar
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  const confirmDelete = () => {
    // Confirma la eliminación de un usuario
    deleteUser(userToDelete);
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  const saveUser = async (user) => {
    // Guarda un usuario en la base de datos (creación o actualización)
    setError("");
    setSuccess("");
  
    if (!user.email || !user.password || !user.firstName || !user.lastName) {
      setError("Todos los campos son obligatorios."); // Si falta algún campo, muestra un error
      return;
    }
  
    try {
      if (user.isNew) {
        // Si el usuario es nuevo, realiza una solicitud POST para crear un nuevo usuario
        await axios.post(`${baseUrl}/api/admin/register`, user, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
        });
      } else {
        // Si el usuario ya existe, realiza una solicitud PUT para actualizar el usuario
        await axios.put(`${baseUrl}/api/admin/users/${user.id}`, user, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
        });
      }
  
      const response = await axios.get(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("access_token")}` },
      });
      
      if (Array.isArray(response.data)) {
        // Si la respuesta es un arreglo, actualiza el estado de los usuarios
        const formattedUsers = response.data.map((user) => ({
          id: user.id,
          email: user.email,
          password: "",
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isNew: false,
        }));
        setUsers(formattedUsers);
      }
      
      setSuccess("Usuario guardado correctamente."); // Muestra un mensaje de éxito
    } catch {
      setError("Error al guardar el usuario."); // Si hay un error, muestra un mensaje de error
    }
  };

  const closeError = () => {
    setError(""); // Cierra el mensaje de error
  };

  const closeSuccess = () => {
    setSuccess(""); // Cierra el mensaje de éxito
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Usuarios</h1>

      {/* Muestra un mensaje de error si hay uno */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" aria-label="Close" onClick={closeError}></button>
        </div>
      )}

      {/* Muestra un mensaje de éxito si hay uno */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" aria-label="Close" onClick={closeSuccess}></button>
        </div>
      )}

      {/* Si no hay usuarios, muestra un mensaje */}
      {users.length === 0 ? (
        <div className="alert alert-info">No hay usuarios registrados.</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table table-dark ">
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
                  <input type="email" className="form-control" value={user.email} onChange={(e) => handleInputChange(user.id, "email", e.target.value)} />
                </td>
                <td>
                  <input type="password" className="form-control" value={user.password} onChange={(e) => handleInputChange(user.id, "password", e.target.value)} />
                </td>
                <td>
                  <input type="text" className="form-control" value={user.firstName} onChange={(e) => handleInputChange(user.id, "firstName", e.target.value)} />
                </td>
                <td>
                  <input type="text" className="form-control" value={user.lastName} onChange={(e) => handleInputChange(user.id, "lastName", e.target.value)} />
                </td>
                <td>
                  <select className="form-select" value={user.role} onChange={(e) => handleInputChange(user.id, "role", e.target.value)}>
                    <option value="admin">Admin</option>
                    <option value="empleado">Empleado</option>
                  </select>
                </td>
                <td>
                  {/* Botones para guardar y eliminar */}
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

      {/* Si hay menos de 3 usuarios, muestra el botón para agregar uno nuevo */}
      {users.length < 3 && <button className="btn btn-primary" onClick={addRow}><FaPlus /></button>}

      {/* Modal de confirmación para eliminar */}
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
                <button type="button" className="btn btn-secondary" onClick={cancelDelete}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
