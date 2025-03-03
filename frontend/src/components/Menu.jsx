import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Menu = () => {
  const { user, logout } = useAuth();

  return ( 
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "rgba(255, 255, 255, 0.2)",
        padding: "10px 20px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        margin: "20px auto",
        width: "95%",
      }}
    >
      <div className="container">
        <Link className="navbar-brand text-white fw-bold" to="/">
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
            <li className="nav-item">
              <Link className="nav-link text-white mx-2 fw-semibold" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
                  <Link className="nav-link text-white mx-2 fw-semibold" to="/services">
                    Services
                  </Link>
                </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white mx-2 fw-semibold" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-light text-primary fw-semibold"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white mx-2 fw-semibold" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link text-white mx-2 fw-semibold"
                    to="/register"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
