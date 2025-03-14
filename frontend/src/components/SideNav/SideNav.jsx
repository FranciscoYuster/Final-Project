import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
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

  // Estados para controlar la visibilidad de cada submenú
  const [showGestion, setShowGestion] = useState(false);
  const [showClientesProveedores, setShowClientesProveedores] = useState(false);
  const [showOperaciones, setShowOperaciones] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

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
            <Link to="/profile">
            <div className="d-flex align-items-center">
              <FaTachometerAlt className="me-2"/> Dashboard
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

            <div className="d-flex align-items-center ">
              <FaBox className="me-2" /> Gestión{" "}
              {showGestion ? <FaAngleUp /> : <FaAngleDown />}
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
                <Link to="/facturas">
                  <FaFileInvoiceDollar className="me-2"/>
                  Facturas
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/movements">
                  <FaChartBar className="me-2"/>
                  Movimientos
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/ubications">
                <FaMapLocation className="me-2"/> 
                Ubicaciones
                </Link>
              </li>
            </ul>
          )}

          {/* Submenú de Clientes y Proveedores */}
          <motion.li
            variants={linkVariants}
            whileHover="hover"
            onClick={() => setShowClientesProveedores(!showClientesProveedores)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex align-items-center pt-2">
            <FaTruckFast className="me-2 "/>Proveedores
              {showClientesProveedores ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showClientesProveedores && (
            <ul className="sub-menu">
              <li className="mx-3">
              <Link to="/clientes">
                  <FaUserTie className="me-2" />
                  Clientes
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/proveed">
              <FaTruckPlane className="me-2" />
                  Proveedores
                </Link>
              </li>
            </ul>
          )}

          {/* Submenú de Operaciones */}
          <motion.li
            variants={linkVariants}
            whileHover="hover"
            onClick={() => setShowOperaciones(!showOperaciones)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex align-items-center pt-2">
              <FaShoppingCart className="me-2" /> Operaciones{" "}
              {showOperaciones ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showOperaciones && (
            <ul className="sub-menu">
              <li className="mx-3">
              <Link to="/productos">
                  <FaBoxArchive className="me-2"/>
                  Productos
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/ventas">
                  <FaCashRegister className="me-2" />
                  Ventas
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/compras">
                  <FaHandHoldingDollar className="me-2"/>
                  Compras
                </Link>
              </li>
            </ul>
          )}

          {/* Submenú de Administración */}
          <motion.li
            variants={linkVariants}
            whileHover="hover"
            onClick={() => setShowAdmin(!showAdmin)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex align-items-center pt-2">
              <FaBoxOpen className="me-2" /> Administración{" "}
              {showAdmin ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showAdmin && (
            <ul className="sub-menu">
              <li className="mx-3">
              <Link to="/usuarios">
                  <FaUser className="me-2"/>
                  Usuarios
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/reports">
                  <FaUncharted className="me-2"/>
                  Reportes
                </Link>
              </li>
              <li className="mx-3">
                <Link to="/configurations">
                  <FaGears className="me-2" />
                  Configuración
                </Link>
              </li>
            </ul>
          )}

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
