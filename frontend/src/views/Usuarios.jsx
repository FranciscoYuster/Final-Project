import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../config';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'empleado' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    console.log("Token desde sessionStorage:", token);
  }, []);

  useEffect(() => {
    axios.get(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` }
    })
      .then(response => {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error("La respuesta no es un arreglo:", response.data);
          setUsers([]);
        }
      })
      .catch(err => {
        console.error(err);
        setError('Error al cargar los usuarios.');
        setUsers([]);
      });
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (users.length >= 3) {
      setError('Ya se ha alcanzado el límite máximo de 3 usuarios.');
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/api/admin/register`, formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('access_token')}` }
      });
      if (response.data && response.data.user) {
        setUsers([...users, response.data.user]);
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'empleado'
        });
        setSuccess('Usuario creado correctamente.');
      } else {
        setError('Error al crear el usuario.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al crear el usuario.');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Crear Usuario</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {users.length < 3 ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Contraseña"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">Nombre</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Nombre"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Apellido</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Apellido"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label">Rol</label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Crear Usuario</button>
        </form>
      ) : (
        <div className="alert alert-info">Se ha alcanzado el máximo de 3 usuarios.</div>
      )}

      <h2 className="mb-3">Usuarios creados</h2>
      <ul className="list-group">
        {users.map(user => (
          <li key={user.id} className="list-group-item">
            {user.email} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Usuarios;
