import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login, reset } from "./markmale/authSlice";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const { usuario, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        <button type="submit">Entrar</button>
      </form>

      {isLoading && <p>Cargando...</p>}
      {isError && <p style={{ color: "red" }}>Error: {message}</p>}
      {isSuccess && <p style={{ color: "green" }}>Autenticado correctamente</p>}
    </div>
  );
}

export default App;
