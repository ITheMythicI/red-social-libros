import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { searchBooks } from "../api/books";
import { updateSubjects, updateFavoritos } from "../features/auth/authSlice";

const SUBJECTS = [
  "Ficción",
  "No ficción",
  "Ciencia",
  "Tecnología",
  "Historia",
  "Biografías",
  "Negocios",
  "Autoayuda",
  "Fantasía",
  "Ciencia ficción",
  "Misterio",
  "Romance",
  "Educación",
  "Arte",
  "Viajes",
];

const Onboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState("subjects"); // subjects | favorites
  const [selectedSubjects, setSelectedSubjects] = useState(user?.subjectsFavoritos || []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState(user?.librosFavoritos || []);

  // Si ya tiene subjects y favoritos, redirigir
  useEffect(() => {
    if (user?.subjectsFavoritos?.length > 0) {
      setStep(user?.librosFavoritos?.length ? "done" : "favorites");
    }
  }, [user]);

  useEffect(() => {
    if (step === "done") {
      navigate("/home", { replace: true });
    }
  }, [step, navigate]);

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleSaveSubjects = () => {
    dispatch(updateSubjects(selectedSubjects))
      .unwrap()
      .then(() => {
        toast.success("Preferencias guardadas");
        setStep("favorites");
      })
      .catch((err) => toast.error(err));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setLoadingSearch(true);
      const data = await searchBooks(query, 0, 12);
      setResults(data.resultados || []);
    } catch (err) {
      toast.error("No se pudo buscar libros");
    } finally {
      setLoadingSearch(false);
    }
  };

  const isSelectedBook = (bookId) => selectedBooks.some((b) => b.bookId === bookId);

  const toggleBook = (book) => {
    setSelectedBooks((prev) => {
      if (prev.some((b) => b.bookId === book.bookId)) {
        return prev.filter((b) => b.bookId !== book.bookId);
      }
      return [...prev, { bookId: book.bookId, titulo: book.titulo, autores: book.autores, portada: book.portada }];
    });
  };

  const handleSaveFavorites = () => {
    dispatch(updateFavoritos(selectedBooks))
      .unwrap()
      .then(() => {
        toast.success("Favoritos guardados");
        setStep("done");
      })
      .catch((err) => toast.error(err));
  };

  const subjectsSection = (
    <>
      <h2>¿Qué géneros te interesan?</h2>
      <p className="subtitle">Selecciona al menos 3 para personalizar tus recomendaciones.</p>
      <div className="chips-grid">
        {SUBJECTS.map((subject) => (
          <button
            type="button"
            key={subject}
            className={`chip ${selectedSubjects.includes(subject) ? "chip-selected" : ""}`}
            onClick={() => toggleSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </div>
      <button
        className="btn-primary"
        disabled={selectedSubjects.length < 1}
        onClick={handleSaveSubjects}
      >
        Guardar y continuar
      </button>
    </>
  );

  const favoritesSection = (
    <>
      <h2>Busca algunos libros y márcalos como favoritos</h2>
      <p className="subtitle">Esto nos ayuda a darte mejores sugerencias.</p>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          className="input"
          placeholder="Ej. Harry Potter, Cien años de soledad..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-primary" type="submit" disabled={loadingSearch}>
          {loadingSearch ? "Buscando..." : "Buscar"}
        </button>
      </form>

      <div className="cards-grid">
        {results.map((book) => (
          <div key={book.bookId} className={`book-card ${isSelectedBook(book.bookId) ? "selected" : ""}`}>
            {book.portada ? (
              <img src={book.portada} alt={book.titulo} className="book-cover" />
            ) : (
              <div className="book-cover placeholder">Sin portada</div>
            )}
            <div className="book-info">
              <h4>{book.titulo}</h4>
              <p className="muted">{(book.autores || []).join(", ")}</p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => toggleBook(book)}
              >
                {isSelectedBook(book.bookId) ? "Quitar" : "Marcar favorito"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-primary"
        disabled={selectedBooks.length === 0}
        onClick={handleSaveFavorites}
      >
        Guardar favoritos y continuar
      </button>
    </>
  );

  const cardClass = `surface-card ${step === "favorites" ? "surface-wide" : ""}`;

  return (
    <div className="page">
      <div className={cardClass}>
        <div className="brand">
          <span role="img" aria-label="book">
            📚
          </span>
          Personaliza tu perfil
        </div>

        {step === "subjects" && subjectsSection}
        {step === "favorites" && favoritesSection}
      </div>
    </div>
  );
};

export default Onboarding;
