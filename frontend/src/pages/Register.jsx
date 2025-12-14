import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register, reset } from "../features/auth/authSlice";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    password2: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    dispatch(register(formData))
      .unwrap()
      .then(() => {
        toast.success("Registro exitoso. Ahora inicia sesión.");
        dispatch(reset());
        navigate("/login");
      })
      .catch(() => {});
  };

  return (
    <div className="page">
      <div className="surface-card">
        <div className="brand">
          <span role="img" aria-label="book">
            📚
          </span>
          Crea tu cuenta
        </div>
        <p className="subtitle">Únete a la red y comparte tus lecturas.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              className="input"
              type="text"
              name="nombre"
              placeholder="Tu nombre"
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="field">
            <label htmlFor="password2">Confirmar contraseña</label>
            <input
              id="password2"
              className="input"
              type="password"
              name="password2"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="helper">
          ¿Ya tienes cuenta?{" "}
          <Link className="switch-link" to="/login">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
