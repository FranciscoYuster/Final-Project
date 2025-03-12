import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { 
  FaTachometerAlt, FaBox, FaFileInvoiceDollar, FaUsers, FaBoxOpen,
  FaShoppingCart, FaCartPlus, FaUser, FaTruck, FaChartLine, FaSignOutAlt,
  FaAngleDown, FaAngleUp
} from "react-icons/fa";
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
              <FaTachometerAlt className="me-2" /> Dashboard
            </Link>
          </motion.li>

          {/* Submenú de Gestión */}
          <motion.li variants={linkVariants} whileHover="hover" onClick={() => setShowGestion(!showGestion)} style={{cursor: 'pointer'}}>
            <div className="d-flex align-items-center">
              <FaBox className="me-2" /> Gestión {showGestion ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showGestion && (
            <ul className="sub-menu">
              <li>
                <Link to="/inventory">Inventario</Link>
              </li>
              <li>
                <Link to="/facturas">Facturas</Link>
              </li>
              <li>
                <Link to="/movements">Movimientos</Link>
              </li>
              <li>
                <Link to="/ubications">Ubicaciones</Link>
              </li>
            </ul>
          )}

          {/* Submenú de Clientes y Proveedores */}
          <motion.li variants={linkVariants} whileHover="hover" onClick={() => setShowClientesProveedores(!showClientesProveedores)} style={{cursor: 'pointer'}}>
            <div className="d-flex align-items-center">
              <FaUsers className="me-2" /> Proveedores {showClientesProveedores ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showClientesProveedores && (
            <ul className="sub-menu">
              <li>
                <Link to="/clientes">Clientes</Link>
              </li>
              <li>
                <Link to="/proveed">Proveedores</Link>
              </li>
            </ul>
          )}

          {/* Submenú de Operaciones */}
          <motion.li variants={linkVariants} whileHover="hover" onClick={() => setShowOperaciones(!showOperaciones)} style={{cursor: 'pointer'}}>
            <div className="d-flex align-items-center">
              <FaShoppingCart className="me-2" /> Operaciones {showOperaciones ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showOperaciones && (
            <ul className="sub-menu">
              <li>
                <Link to="/productos">Productos</Link>
              </li>
              <li>
                <Link to="/ventas">Ventas</Link>
              </li>
              <li>
                <Link to="/compras">Compras</Link>
              </li>
            </ul>
          )}

          {/* Submenú de Administración */}
          <motion.li variants={linkVariants} whileHover="hover" onClick={() => setShowAdmin(!showAdmin)} style={{cursor: 'pointer'}}>
            <div className="d-flex align-items-center">
              <FaBoxOpen className="me-2" /> Administración {showAdmin ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </motion.li>
          {showAdmin && (
            <ul className="sub-menu">
              
              <li>
                <Link to="/usuarios">Usuarios</Link>
              </li>
              <li>
                <Link to="/reports">Reportes Dinámicos</Link>
              </li>
              <li>
                <Link to="/configurations">Confifiguración</Link>
              </li>
            </ul>
          )}

          <motion.li>
            <motion.button
              className="btn btn-outline-danger btn-sm"
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
