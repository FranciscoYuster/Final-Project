import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams(); // Obtener token correctamente

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    const response = await resetPassword(token, newPassword);

    if (response.success) {
      setSuccessMessage('Password has been reset successfully!');
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
          <h2 className="text-center">Reset Password</h2>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>New Password:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group mb-3">
              <label>Confirm Password:</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit">
              Reset Password
            </button>
          </form>
          <p className="text-center mt-3">
            <a href="#" onClick={() => navigate('/login')}>
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
