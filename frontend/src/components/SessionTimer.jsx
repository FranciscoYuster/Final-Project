import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SessionTimer = ({ tokenExpirationTime }) => {
  const [timeLeft, setTimeLeft] = useState(tokenExpirationTime - Date.now());
  const [hasPrompted, setHasPrompted] = useState(false);

  // Función para renovar el token usando el token almacenado con "access_token"
  const renewToken = async () => {
    try {
      const tokenStored = sessionStorage.getItem("access_token"); // Se usa "access_token"
      const response = await fetch('/api/renew-token', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenStored}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("access_token", data.access_token);
        toast.info("Token renovado exitosamente.");
        // Opcional: podrías actualizar tokenExpirationTime si se te envía la nueva expiración
      } else {
        const errorData = await response.json();
        toast.error("Error al renovar el token: " + errorData.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al renovar el token.");
    }
  };

  // Función que actualiza el temporizador y revisa la sesión
  const checkSession = () => {
    const newTimeLeft = tokenExpirationTime - Date.now();
    setTimeLeft(newTimeLeft);

    // Si quedan menos de 10 minutos y aún no se ha preguntado, se pregunta al usuario
    if (newTimeLeft <= 10 * 60 * 1000 && !hasPrompted) {
      const userResponse = window.confirm("Tu sesión expirará en menos de 10 minutos. ¿Deseas mantenerla activa?");
      if (userResponse) {
        renewToken();
      } else {
        toast.warn("La sesión se cerrará pronto.");
      }
      setHasPrompted(true);
    }

    // Si quedan entre 4 y 1 minutos, se muestra una alerta informativa
    if (newTimeLeft <= 4 * 60 * 1000 && newTimeLeft > 1 * 60 * 1000) {
      toast.info('Tu sesión expirará en menos de 3 minutos. Por favor, guarda tu trabajo o refresca la sesión.');
    }

    // Si el tiempo se agota, se notifica al usuario y se limpia el intervalo
    if (newTimeLeft <= 0) {
      toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      clearInterval(intervalId);
      window.location.href = "http://localhost:5173/";
    }
  };

  // Configurar el intervalo para actualizar el temporizador cada segundo
  useEffect(() => {
    const intervalId = setInterval(checkSession, 1000);
    return () => clearInterval(intervalId);
  }, [tokenExpirationTime, hasPrompted]);

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
