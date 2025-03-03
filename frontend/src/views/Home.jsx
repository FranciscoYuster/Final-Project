import React from 'react';

const Home = () => {
  return (
    <div className="container my-5">
      {/* Sección de bienvenida */}
      <div className="jumbotron p-5 rounded">
        <h1 className="display-4">¡Bienvenido!</h1>
        <p className="lead">
          Esta es una aplicación de ejemplo usando React y Bootstrap para mostrar cómo se pueden presentar datos de manera elegante y responsiva.
        </p>
        <hr className="my-4" />
        <p>
          Desarrollado con pasión por Samantha, Alejandro y Francisco.
        </p>
        <a
          className="btn btn-primary btn-lg"
          href="https://github.com/FranciscoYuster/Final-Project"
          target="_blank"
          rel="noopener noreferrer"
          role="button"
        >
          Ver Repositorio
        </a>
      </div>

    </div>
  );
};

export default Home;