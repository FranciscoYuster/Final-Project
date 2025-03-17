// src/views/Configurations.jsx
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Configurations = () => {
  const { user, updatedProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
  });
  // Estado para el preview de la foto
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Inicializa el formulario con los datos del usuario
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
      }));
      // Si existe foto en el perfil, se usa; de lo contrario, se muestra el placeholder.
      if (user.profile && user.profile.avatar) {
        setPreviewImage(user.profile.avatar);
      } else {
        setPreviewImage("https://placehold.org/40x40");
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePhoto') {
      const file = files[0];
      setFormData({ ...formData, profilePhoto: file });
      // Crear un preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      if (file) {
        reader.readAsDataURL(file);
      } else {
        // Si no hay archivo, se muestra el placeholder
        setPreviewImage("https://placehold.org/40x40");
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      let payload, headers = {};
      // Si se sube una foto, usar FormData
      if (formData.profilePhoto) {
        payload = new FormData();
        payload.append('email', formData.email);
        if (formData.password) payload.append('password', formData.password);
        payload.append('profilePhoto', formData.profilePhoto);
      } else {
        payload = JSON.stringify({
          email: formData.email,
          password: formData.password,
        });
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${process.env.VITE_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers,
        body: payload,
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      setLoading(false);
      toast.success('Perfil actualizado exitosamente');
      // Actualiza el estado global si se requiere
      updatedProfile(data);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error('Error al actualizar el perfil');
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2 className="mb-4">Configuración de Perfil</h2>
      {user ? (
        <div className="card shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0">Actualizar Perfil</h3>
          </div>
          <div className="card-body" style={{ backgroundColor: "#f8f9fa" }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 text-center">
                <img
                  src={previewImage || "https://placehold.org/40x40"}
                  alt="Preview de perfil"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "2px solid #074de3",
                  }}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label"><strong>Correo Electrónico</strong></label>
                <input 
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label"><strong>Nueva Contraseña</strong></label>
                <input 
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="Dejar en blanco para no cambiar"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label"><strong>Confirmar Contraseña</strong></label>
                <input 
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Dejar en blanco para no cambiar"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="profilePhoto" className="form-label"><strong>Foto de Perfil</strong></label>
                <input 
                  type="file"
                  id="profilePhoto"
                  name="profilePhoto"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p>Cargando perfil...</p>
      )}
    </div>
  );
};

export default Configurations;
