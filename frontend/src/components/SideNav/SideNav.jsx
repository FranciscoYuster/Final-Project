// src/components/SideNav/SideNav.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import SessionTimer from "../SessionTimer";

// Importaciones de Material-UI
import { Avatar } from "@mui/material";

// Iconos de FontAwesome y FontAwesome6
import {
  FaFileInvoiceDollar,
  FaUserTie,
  FaCashRegister,
  FaUser,
  FaUncharted,
  FaTachometerAlt,
  FaBox,
  FaBoxOpen,
  FaShoppingCart,
  FaSignOutAlt,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import {
  FaTruckPlane,
  FaTruckFast,
  FaMapLocation,
  FaDiagramProject,
  FaHandHoldingDollar,
  FaBoxArchive,
  FaChartBar,
  FaGears,
} from "react-icons/fa6";

import "./SideNav.css";

const sideNavVariants = {
  hidden: { x: -205, opacity: 0, y: -25 },
  visible: {
    x: 0,
    y: 0,
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
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [showGestion, setShowGestion] = useState(false);
  // Se elimina el estado y submenú de Clientes y Proveedores
  // const [showClientesProveedores, setShowClientesProveedores] = useState(false);
  // const [showOperaciones, setShowOperaciones] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const tokenExpirationTime = sessionStorage.getItem("tokenExpirationTime");

  return (
    <motion.div
      className="side-nav-container"
      initial="hidden"
      animate="visible"
      variants={sideNavVariants}
    >
      <nav className="side-nav">
        {tokenExpirationTime && (
          <SessionTimer tokenExpirationTime={parseInt(tokenExpirationTime, 10)} />
        )}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <motion.h4
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}
          >
            Menú
          </motion.h4>
        </div>

        {/* Información del usuario */}
        {user && (
          <div className="d-flex align-items-center mb-3">
            <Avatar
              src={user.profile && user.profile.avatar ? user.profile.avatar : ""}
              alt={`${user.first_name} ${user.last_name}`}
              sx={{ width: 56, height: 56, mr: 2 }}
            >
              {user.first_name[0]}
              {user.last_name[0]}
            </Avatar>
            <span className="text-white">
              {user.first_name} {user.last_name}
            </span>
          </div>
        )}

        <ul>
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/profile">
              <div className="d-flex align-items-center">
                <FaTachometerAlt className="me-2" /> Dashboard
              </div>
            </Link>
          </motion.li>

          {/* Submenú de Gestión */}
          <motion.li
            variants={linkVariants}
            whileHover="hover"
            onClick={() => setShowGestion(!showGestion)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex align-items-center">
              <FaBox className="me-2" /> Gestión {showGestion ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showGestion && (
            <ul className="sub-menu">
              <li className="mx-3">
                <Link to="/inventory">
                  <FaDiagramProject className="me-2" /> Inventario
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/productos">
                  <FaBoxArchive className="me-2" /> Productos
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/facturas">
                  <FaFileInvoiceDollar className="me-2" /> Facturación
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/movements">
                  <FaChartBar className="me-2" /> Movimientos
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/ubications">
                  <FaMapLocation className="me-2" /> Ubicaciones
                </Link>
              </li>
            </ul>
          )}

          {/* Ítem de Clientes como opción de nivel superior */}
          <motion.li variants={linkVariants} whileHover="hover" className="pt-2">
            <Link to="/clientes">
              <div className="d-flex align-items-center">
                <FaUserTie className="me-2" /> Clientes
              </div>
            </Link>
          </motion.li>

          {/* Submenú de Administración */}
          <motion.li variants={linkVariants} whileHover="hover">
            <Link to="/configurations">
              <div className="d-flex align-items-center pt-2">
                <FaGears className="me-2" /> Configuración
              </div>
            </Link>
          </motion.li>

          <motion.li>
            <motion.button
              className="btn btn-outline-danger btn-sm mt-3"
              whileHover={{ scale: 1.1 }}
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-2" /> Logout
            </motion.button>
          </motion.li>
        </ul>
      </nav>
    </motion.div>
  );
};

export default SideNav;
