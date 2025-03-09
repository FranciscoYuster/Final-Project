// src/components/SideNav.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import "./SideNav.css";

const sideNavVariants = {
  hidden: { x: -205, opacity: 0, y: -25 },
  visible: {
    x: 0,
    y: 0, // Asegura que se posicione en Y=0 al animar
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 25,
      delay: 0,
    },
  },
};


const linkVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const SideNav = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirige a la ruta de inicio o a '/login'
  };

  return (
    <motion.div
      className="side-nav-container"
      initial="hidden"
      animate="visible"
      variants={sideNavVariants}
    >
      <nav className="side-nav">
        <motion.h4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
        >
          Menú
        </motion.h4>
        <ul>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/profile">Dashboard</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/facturas">Facturas</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/clientes">Clientes</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/productos">Productos</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/ventas">Ventas</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/compras">Compras</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/usuarios">Usuarios</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/proveed">Proveedores</Link>
          </motion.li>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/reports">Reportes Dinamicos</Link>
          </motion.li>
          <motion.li>
            <motion.button
              className="btn btn-outline-danger btn-sm"
              whileHover={{ scale: 1.1 }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </motion.button>
          </motion.li>
        </ul>
      </nav>
    </motion.div>
  );
};

export default SideNav;
