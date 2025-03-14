import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  // Reglas de validación de contraseñas
  const passwordRules = [
    { rule: /.{8,}/, message: 'Al menos 8 caracteres' },
    { rule: /[A-Z]/, message: 'Al menos una letra mayúscula' },
    { rule: /[0-9]/, message: 'Al menos un número' },
    { rule: /[!@#$%^&*]/, message: 'Al menos un carácter especial (!@#$%^&*)' },
  ];

  const checkPassword = (pwd) => {
    return passwordRules.map((req) => ({
      ...req,
      valid: req.rule.test(pwd),
    }));
  };

  const passwordValidation = checkPassword(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (passwordValidation.some((req) => !req.valid)) {
      setError('La contraseña no cumple con los requisitos');
      return;
    }

    const response = await resetPassword(token, newPassword);

    if (response.success) {
      setSuccessMessage('Contraseña restablecida exitosamente!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(response.error);
    }
  };

  return (
    <div className="w-100 mx-auto my-5">
      <div className="login-container">
        <div className="login-box">
          <h2 className="text-center">Restablecer Contraseña</h2>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Nueva Contraseña:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Ingresa la nueva contraseña"
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => !newPassword && setShowPasswordRequirements(false)}
                required
              />
            </div>

            {/* Requisitos de la contraseña (solo se muestra si showPasswordRequirements es true) */}
            {showPasswordRequirements && (
              <ul className="password-requirements">
                {passwordValidation.map((req, index) => (
                  <li key={index} className={req.valid ? 'text-success' : 'text-danger'}>
                    {req.valid ? <FaCheckCircle className="me-1" /> : <FaTimesCircle className="me-1" />}
                    {req.message}
                  </li>
                ))}
              </ul>
            )}

            <div className="form-group mb-3">
              <label>Confirmar Contraseña:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirma la nueva contraseña"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary w-100" type="submit">
              Restablecer Contraseña
            </button>
          </form>
          <p className="text-center mt-3">
            <a href="#" onClick={() => navigate('/login')}>
              Volver al inicio de sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
