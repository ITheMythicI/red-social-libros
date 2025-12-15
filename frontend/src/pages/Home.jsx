import Navbar from "../components/Navbar";

const Home = () => {
  const highlights = [
    { title: "Lee y comparte", desc: "Sigue a otros lectores y descubre sus reseñas." },
    { title: "Listas curadas", desc: "Crea colecciones de tus libros favoritos." },
    { title: "Progreso y metas", desc: "Registra lecturas y marca objetivos anuales." },
  ];

  return (
    <div className="page">
      <div className="surface-card hero-card">
        <div className="brand">
          <span role="img" aria-label="book">
            📚
          </span>
          Red Social de Libros
        </div>
        <h1 className="hero-title">Bienvenido a tu biblioteca social</h1>
        <p className="subtitle">
          Explora recomendaciones, comparte reseñas y lleva el seguimiento de tus lecturas.
        </p>

        <div className="stat-grid">
          {highlights.map((item) => (
            <div key={item.title} className="stat-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="helper" style={{ justifyContent: "space-between" }}>
          <span>Próximamente: feed de libros, reseñas y recomendaciones personalizadas.</span>
          <a className="switch-link" href="/perfil">Mi perfil</a>
        </div>
      </div>
      <Navbar />
    </div>
  );
};

export default Home;
