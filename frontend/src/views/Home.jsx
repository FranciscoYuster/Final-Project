import React, { useState } from 'react';

const Home = () => {

  
    return (
      <div className="container my-5 text-center">
        <div className="jumbotron p-5 rounded">
          <h1 className="text-white">¡Bienvenido a LogiGo!</h1>
          <p className='text-white'>
          Este proyecto se ha desarrollado para brindar a la empresa una solución moderna y eficiente en el manejo de su inventario. Aquí podrás gestionar tareas y ver el estado de diferentes procesos que impulsan la operatividad del sistema.
        </p>
        <img src="/Images/Principal.png" className="img-fluid border" alt="..."/>
        </div>
      </div>
    );
  };
export default Home;