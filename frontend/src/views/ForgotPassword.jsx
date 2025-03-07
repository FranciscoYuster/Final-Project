import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { forgotPassword } = useAuth(); // ✅ Llamamos la función desde el contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const response = await forgotPassword(email);

    if (response.success) {
      setMessage(response.message);
    } else {
      setError(response.error);
    }
  };

  return (
    <div className="w-100 mx-auto my-5">
      <div className="login-container">
        <div className="login-box">
          <h2 className="text-center">Forgot Password</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Email:</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary w-100" type="submit">
              Send Reset Link
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

export default ForgotPassword;
