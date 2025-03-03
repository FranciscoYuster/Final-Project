// src/pages/Error404.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Error404 = () => {
  const handleGameClick = () => {
    // Aquí se puede integrar la lógica de un mini juego o animación interactiva.
    alert("¡Mini juego no implementado aún!");
  };

  return (
    <div className="container text-center mt-5">
      <h1 className="display-1">404</h1>
      <p className="lead">Lo sentimos, la página que buscas no se encontró.</p>
      <p>
        Quizás quieras volver al <Link to="/">inicio</Link> o probar con otra dirección.
      </p>
      <div className="mt-4">
        <p>¡Diviértete con nuestro mini juego!</p>
        <button className="btn btn-secondary" onClick={handleGameClick}>
          Jugar
        </button>
      </div>
    </div>
  );
};

export default Error404;
