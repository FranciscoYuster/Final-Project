import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./Login.css";

const Register = () => {
    const navigate = useNavigate();
    const { user, register, login } = useAuth();

    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false); // Estado para mostrar requisitos

    // Reglas de validación
    const passwordRules = [
        { rule: /.{8,}/, message: "Al menos 8 caracteres" },
        { rule: /[A-Z]/, message: "Al menos una letra mayúscula" },
        { rule: /[0-9]/, message: "Al menos un número" },
        { rule: /[!@#$%^&*]/, message: "Al menos un carácter especial (!@#$%^&*)" }
    ];

    const checkPassword = (pwd) => {
        return passwordRules.map(req => ({
            ...req,
            valid: req.rule.test(pwd)
        }));
    };

    const passwordValidation = checkPassword(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (email !== confirmEmail) {
            setError('Los correos electrónicos no coinciden');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (passwordValidation.some(req => !req.valid)) {
            setError('La contraseña no cumple con los requisitos');
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
            setError('Algo salió mal');
        }
    };

    if (user) return <Navigate to="/profile" replace />;

    return (
        <div className="login-container">
            <div className="login-box">
                <div className='mx-auto'>
                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Error!</strong> {error}.
                            <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
                        </div>
                    )}
                    {message && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <strong>Éxito!</strong> {message}.
                            <button type="button" className="btn-close" onClick={() => setMessage(null)} aria-label="Close"></button>
                        </div>
                    )}

                    <h2 className="text-center">Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3 input-container">
                                <FaUser className="input-icon" />
                                <input type="text" id="firstName" className="form-control" placeholder='First Name'
                                    onChange={e => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="col-md-6 mb-3 input-container">
                                <FaUser className="input-icon" />
                                <input type="text" id="lastName" className="form-control" placeholder='Last Name'
                                    onChange={e => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group mb-3 input-container">
                            <FaEnvelope className="input-icon" />
                            <input type="email" id="email" className="form-control" placeholder='Email'
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-3 input-container">
                            <FaEnvelope className="input-icon" />
                            <input type="email" id="confirmEmail" className="form-control" placeholder='Confirm Email'
                                onChange={e => setConfirmEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group mb-3 input-container">
                            <FaLock className="input-icon" />
                            <input type="password" id="password" className="form-control" placeholder='Password'
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setShowPasswordRequirements(true)}
                                onBlur={() => !password && setShowPasswordRequirements(false)} // Ocultar si está vacío
                            />
                        </div>

                        {/* Requisitos de la contraseña (solo se muestra si showPasswordRequirements es true) */}
                        {showPasswordRequirements && (
                            <ul className="password-requirements">
                                {passwordValidation.map((req, index) => (
                                    <li key={index} className={req.valid ? "text-success" : "text-danger"}>
                                        {req.valid ? <FaCheckCircle className="me-1" /> : <FaTimesCircle className="me-1" />}
                                        {req.message}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="form-group mb-3 input-container">
                            <FaLock className="input-icon" />
                            <input type="password" id="confirmPassword" className="form-control" placeholder='Confirm Password'
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary w-100">
                            Register
                        </button>
                    </form>
                    <p className="text-center mt-3">
                        ¿Ya tienes una cuenta? <a href="#" className="text-decoration-none" onClick={() => navigate('/login')}>Inicia sesión</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
