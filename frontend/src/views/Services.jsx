import React from 'react';

const Services = () => {
  return (
    <div className="container-fluid my-5 text-center text-white">
      <h1 className="text-white">¡Services!</h1>
      <p className="text-white"> 
        Sistema de Inventario diseñado para optimizar la gestión y el control de activos.
      </p>
      
      <div id="carouselExampleCaptions" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2" aria-label="Slide 3"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="3" aria-label="Slide 4"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="4" aria-label="Slide 5"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="5" aria-label="Slide 6"></button>
          <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="6" aria-label="Slide 7"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/Images/Screenshot 2025-03-19 at 20.50.25.png" className="d-block w-100 img-fluid" alt="..." />
            <div className="carousel-caption d-none d-md-block">
              <h5>Registro de productos fácil y rápido</h5>
              <p>Los usuarios pueden agregar productos de manera sencilla, especificando su nombre, cantidad, precio y detalles importantes. Todo se guarda en tiempo real y es accesible desde cualquier dispositivo.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images/Screenshot 2025-03-19 at 20.50.25.png" className="d-block w-100 img-fluid" alt="..." />
            <div className="carousel-caption d-none d-md-block">
              <h5>Control de stock en tiempo real</h5>
              <p>Los usuarios tienen acceso inmediato a la cantidad de productos disponibles, sin tener que hacer cálculos o revisar múltiples fuentes.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images/Screenshot 2025-03-19 at 20.50.25.png" className="d-block w-100 img-fluid" alt="..." />
            <div className="carousel-caption d-none d-md-block">
              <h5>Alertas de bajo stock</h5>
              <p>El sistema envía notificaciones cuando los niveles de inventario bajan por debajo del umbral definido, evitando quiebres de stock y pérdidas de ventas.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images/Screenshot 2025-03-19 at 20.50.25.png" className="d-block w-100 img-fluid" alt="..." />
            <div className="carousel-caption d-none d-md-block">
              <h5>Actualización de inventario en segundos</h5>
              <p>Puedes modificar las cantidades de productos o eliminar aquellos que ya no estén disponibles de manera rápida, sin complicaciones.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images/Screenshot 2025-03-19 at 20.50.25.png" className="d-block w-100 img-fluid" alt="..." />
            <div className="carousel-caption d-none d-md-block">
              <h5>Informes y reportes de inventario</h5>
              <p>Los usuarios pueden generar informes detallados del estado de su inventario, lo que facilita la toma de decisiones para el negocio.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images/Screenshot 2025-03-19 at 20.50.25.png" className="d-block w-100 img-fluid" alt="..." />
            <div className="carousel-caption d-none d-md-block">
              <h5>Interfaz amigable y sencilla</h5>
              <p>A diferencia de otros sistemas complejos, Logigo tiene una interfaz intuitiva que permite a los usuarios navegar sin problemas, sin necesidad de capacitación técnica.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Images/Screenshot 2025-03-19 at 20.50.25.png" className="d-block w-100 img-fluid" alt="..." />
            <div className="carousel-caption d-none d-md-block">
              <h5>Accesible desde cualquier dispositivo</h5>
              <p>La plataforma está optimizada para usarse desde computadoras, tabletas y smartphones, permitiendo la gestión de inventarios desde cualquier lugar.</p>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default Services;
