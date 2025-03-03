import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";


const Register = () => {

    const navigate = useNavigate()

    const { user, register, login } = useAuth()

    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (email !== confirmEmail) {
            setError('Emails do not match')
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return;
        }

        const data = await register({ email, password, firstName, lastName });
        if (data.error) {
            setError(data.error);
        } else if (data.success) {
            setMessage('Registro exitoso. Iniciando sesión...');

            const loginData = await login({ email, password });
            if (loginData.error) {
                setError(loginData.error);
            } else {
                navigate('/profile', { replace: true });
            }
        } else {
            setError('Something went wrong')
        }
    };

    if (user) return <Navigate to="/profile" replace />

    return (
        <div className="login-container">
    <div className="login-box">
        <div className='mx-auto'>
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error!</strong> {error}.
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                        aria-label="Close">
                    </button>
                </div>
            )}
            {message && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Éxito!</strong> {message}.
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage(null)}
                        aria-label="Close">
                    </button>
                </div>
            )}

            <h2 className="text-center">Register</h2>
            <form onSubmit={handleSubmit}>
            <div className="row">
            <div className="col-md-6 mb-3">
            <div className="input-group">
            <span className="input-group-text"><FaUser /></span>
                    <input type="text" id="firstName" className="form-control" placeholder='First Name'
                        onChange={e => setFirstName(e.target.value)} 
                    />
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <input type="text" id="lastName" className="form-control" placeholder='Last Name'
                        onChange={e => setLastName(e.target.value)}
                    />
                </div>
                </div>
                <div className="form-group mb-3">
                    <input type="email" id="email" className="form-control" placeholder='Email'
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <input type="email" id="confirmEmail" className="form-control" placeholder='Confirm Email'
                        onChange={e => setConfirmEmail(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <input type="password" id="password" className="form-control" placeholder='Password'
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <input type="password" id="confirmPassword" className="form-control" placeholder='Confirm Password'
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className='mb-3'>
              <input type="checkbox" id="rememberMe" /> <label htmlFor="rememberMe">Remember Me</label>
            </div>
                <button className="btn btn-primary w-100">
                    Register
                </button>
            </form>
            <p className="text-center mt-3">
          Have an account? <a href="#" className="text-decoration-none" onClick={() => navigate('/login')}>Login</a>
        </p>
        </div>
        </div>
        </div>
    )
}

export default Register;