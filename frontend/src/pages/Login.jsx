import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import librumLogo from "../assets/librum-logo.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (token && user) {
      toast.success("Inicio de sesión exitoso");
      dispatch(reset());
      const needsOnboarding =
        !user.subjectsFavoritos?.length || !user.librosFavoritos?.length;
      navigate(needsOnboarding ? "/onboarding" : "/home", { replace: true });
    }
  }, [token, user, dispatch, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="page">
      <div className="surface-card">
        <div className="brand">
          <img src={librumLogo} alt="Librum" style={{ height: "32px", width: "auto" }} />
          <span>Librum</span>
        </div>
        <p className="subtitle">Continúa explorando recomendaciones.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              placeholder="tucorreo@ejemplo.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="input"
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="helper">
          ¿No tienes cuenta?{" "}
          <Link className="switch-link" to="/">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
