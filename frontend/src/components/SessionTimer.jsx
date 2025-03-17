// src/components/SessionTimer.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SessionTimer = ({ tokenExpirationTime }) => {
  // tokenExpirationTime: valor en milisegundos (timestamp) que indica cuándo expira el token.
  const [timeLeft, setTimeLeft] = useState(tokenExpirationTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = tokenExpirationTime - Date.now();
      setTimeLeft(newTimeLeft);

      // Si quedan 10 minutos o menos y aún no se ha notificado, se muestra una alerta.
      if (newTimeLeft <= 10 * 60 * 1000 && newTimeLeft > 9 * 60 * 1000) {
        toast.info('Tu sesión expirará en menos de 10 minutos. Por favor, guarda tu trabajo o refresca la sesión.');
      }

      // Si el tiempo se agota, limpiar el intervalo.
      if (newTimeLeft <= 0) {
        clearInterval(interval);
        // Aquí podrías redirigir al usuario al login o cerrar la sesión automáticamente.
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(interval);
  }, [tokenExpirationTime]);

  // Función para formatear el tiempo (hh:mm:ss)
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
