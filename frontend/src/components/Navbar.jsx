import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bottom-navbar">
      <button
        className={`nav-item ${location.pathname === "/home" ? "active" : ""}`}
        onClick={() => navigate("/home")}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Inicio</span>
      </button>
      <div className="nav-item">
        <NotificationBell />
      </div>
      <button
        className={`nav-item ${location.pathname === "/perfil" ? "active" : ""}`}
        onClick={() => navigate("/perfil")}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Perfil</span>
      </button>
      <button className="nav-item" onClick={handleLogout}>
        <span className="nav-icon">🚪</span>
        <span className="nav-label">Salir</span>
      </button>
    </nav>
  );
}
