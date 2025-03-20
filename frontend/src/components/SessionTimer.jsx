import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SessionTimer = () => {
  const getStoredExpiration = () => parseInt(sessionStorage.getItem('expires_in')) || Date.now();
  
  const [tokenExpirationTime, setTokenExpirationTime] = useState(getStoredExpiration);
  const [timeLeft, setTimeLeft] = useState(tokenExpirationTime - Date.now());
  const [hasPrompted, setHasPrompted] = useState(false);

  // Función para renovar token
  const renewToken = async () => {
    try {
      const res = await fetch('/api/renew-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
        }
      });

      if (!res.ok) throw new Error('Error al renovar token');

      const { access_token, expires_in } = await res.json();

      sessionStorage.setItem('access_token', access_token);
      const newExpiration = Date.now() + expires_in;
      sessionStorage.setItem('expires_in', newExpiration);

      // Actualizar estados inmediatamente
      setTokenExpirationTime(newExpiration);
      setTimeLeft(newExpiration - Date.now());
      setHasPrompted(false);

      toast.success('Sesión renovada exitosamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al renovar sesión.');
    }
  };

  // Verifica la sesión constantemente
  const checkSession = () => {
    const currentExpiration = getStoredExpiration();
    setTokenExpirationTime(currentExpiration);
    const newTimeLeft = currentExpiration - Date.now();
    setTimeLeft(newTimeLeft);

    if (newTimeLeft <= 10 * 60 * 1000 && !hasPrompted) {
      const userResponse = window.confirm("Tu sesión expirará en menos de 10 minutos. ¿Deseas mantenerla activa?");
      if (userResponse) {
        renewToken();
      } else {
        toast.warn("La sesión se cerrará pronto.");
      }
      setHasPrompted(true);
    }

    if (newTimeLeft <= 4 * 60 * 1000 && newTimeLeft > 1 * 60 * 1000) {
      toast.info('Tu sesión expirará en menos de 4 minutos. Guarda tu trabajo o renueva la sesión.');
    }

    if (newTimeLeft <= 0) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      clearInterval(intervalId);
      sessionStorage.clear();
      window.location.href = "http://localhost:5173/";
    }
  };

  useEffect(() => {
    const intervalId = setInterval(checkSession, 1000);
    return () => clearInterval(intervalId);
  }, [hasPrompted]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div style={{ fontWeight: 'bold', color: 'white' }}>
      Sesión: {formatTime(timeLeft)}
    </div>
  );
};

export default SessionTimer;
