import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "../SideNav/SideNav.css";
import "./Menu.css"; // Asegúrate de importar el archivo de estilos
import { useAuth } from "../../context/AuthContext";

const Menu = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Función para determinar si el enlace está activo
  const isActive = (path) => location.pathname === path;

  const linkVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom fixed-top">
      <div className="container">
        <Link className="navbar-brand text-white fw-bold " to="/">
          LogiGo
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuNavbar"
          aria-controls="menuNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="menuNavbar">
          <ul className="navbar-nav">
            <motion.li
              className={`nav-item ${isActive("/") ? "active-item" : ""}`}
              variants={linkVariants}
              whileHover="hover"
            >
              <Link className="nav-link text-white mx-2 fw-semibold" to="/">
                Home
              </Link>
            </motion.li>
            <motion.li
              className={`nav-item ${isActive("/services") ? "active-item" : ""}`}
              variants={linkVariants}
              whileHover="hover"
            >
              <Link className="nav-link text-white mx-2 fw-semibold" to="/services">
                Services
              </Link>
            </motion.li>
            {user ? (
              <>
                <motion.li
                  className={`nav-item ${isActive("/profile") ? "active-item" : ""}`}
                  variants={linkVariants}
                  whileHover="hover"
                >
                  <Link className="nav-link text-white mx-2 fw-semibold" to="/profile">
                    Dashboard
                  </Link>
                </motion.li>
                <li className="nav-item">
                  <button className="btn btn-light text-primary fw-semibold" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <motion.li
                  className={`nav-item ${isActive("/login") ? "active-item" : ""}`}
                  variants={linkVariants}
                  whileHover="hover"
                >
                  <Link className="nav-link text-white mx-2 fw-semibold" to="/login">
                    Login
                  </Link>
                </motion.li>
                <motion.li
                  className={`nav-item ${isActive("/register") ? "active-item" : ""}`}
                  variants={linkVariants}
                  whileHover="hover"
                >
                  <Link className="nav-link text-white mx-2 fw-semibold" to="/register">
                    Register
                  </Link>
                </motion.li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
