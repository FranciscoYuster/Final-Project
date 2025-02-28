import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'

const Register = () => {

    const navigate = useNavigate()

    const { user, register, login } = useAuth()

    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [email, setEmail] = useState('')
    const [confirmEmail, setConfirmEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

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

        const data = await register({ email, password });
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
        <div className='w-75 mx-auto my-5'>
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

            <h3>Register</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" id="email" className="form-control" placeholder='email@domain.com'
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="confirmEmail" className="form-label">Confirm Email</label>
                    <input type="email" id="confirmEmail" className="form-control" placeholder='email@domain.com'
                        onChange={e => setConfirmEmail(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" id="password" className="form-control" placeholder='********'
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input type="password" id="confirmPassword" className="form-control" placeholder='********'
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary btn-sm py-2 w-100">
                    Register
                </button>
            </form>
        </div>
    )
}

export default Register;