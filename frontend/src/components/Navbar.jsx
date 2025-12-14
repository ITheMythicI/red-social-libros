import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();

  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <button onClick={() => dispatch(logout())}>Cerrar sesión</button>
    </nav>
  );
}
