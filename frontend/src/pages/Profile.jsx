import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMe,
  updateAvatar,
  updateName,
  updateFavoritos,
  updateLeyendo,
  updateLeidos,
} from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { useState } from "react";
import { searchBooks } from "../api/books";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [nameInput, setNameInput] = useState(user?.nombre || "");
  const [favoritos, setFavoritos] = useState(user?.librosFavoritos || []);
  const [leyendo, setLeyendo] = useState(user?.librosLeyendo || []);
  const [leidos, setLeidos] = useState(user?.librosLeidos || []);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [targetList, setTargetList] = useState("favoritos"); // favoritos | leyendo | leidos
  const seguidoresCount = user?.seguidoresCount ?? user?.seguidores?.length ?? 0;
  const siguiendoCount = user?.siguiendoCount ?? user?.siguiendo?.length ?? 0;

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [user, dispatch]);

  const subjects = user?.subjectsFavoritos || [];
  const initials = (user?.nombre || "U").trim().slice(0, 2).toUpperCase();

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      dispatch(updateAvatar(dataUrl))
        .unwrap()
        .then(() => toast.success("Avatar actualizado"))
        .catch((err) => toast.error(err));
    };
    reader.readAsDataURL(file);
  };

  const handleNameSave = (e) => {
    e.preventDefault();
    dispatch(updateName(nameInput))
      .unwrap()
      .then(() => toast.success("Nombre actualizado"))
      .catch((err) => toast.error(err));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setLoadingSearch(true);
      const data = await searchBooks(query, 0, 12);
      setResults(data.resultados || data.items || []);
    } catch {
      toast.error("No se pudo buscar libros");
    } finally {
      setLoadingSearch(false);
    }
  };

  const syncList = (listName, data) => {
    switch (listName) {
      case "favoritos":
        setFavoritos(data);
        dispatch(updateFavoritos(data)).catch(() => {});
        break;
      case "leyendo":
        setLeyendo(data);
        dispatch(updateLeyendo(data)).catch(() => {});
        break;
      case "leidos":
        setLeidos(data);
        dispatch(updateLeidos(data)).catch(() => {});
        break;
      default:
        break;
    }
  };

  const addBook = (book) => {
    const base = { bookId: book.bookId, titulo: book.titulo, autores: book.autores, portada: book.portada };
    const current =
      targetList === "favoritos" ? favoritos : targetList === "leyendo" ? leyendo : leidos;
    const exists = current.some((b) => b.bookId === base.bookId);
    const updated = exists ? current : [...current, base];
    syncList(targetList, updated);
  };

  const removeBook = (listName, bookId) => {
    const current =
      listName === "favoritos" ? favoritos : listName === "leyendo" ? leyendo : leidos;
    const updated = current.filter((b) => b.bookId !== bookId);
    syncList(listName, updated);
  };

  return (
    <div className="page">
      <div className="surface-card surface-wide">
        <div className="profile-header">
          <div className="avatar-circle">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" />
            ) : (
              <span>{initials}</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="avatar-input"
              title="Subir imagen"
              onChange={handleAvatarFile}
            />
          </div>
          <div className="profile-main">
            <form className="name-form" onSubmit={handleNameSave}>
              <input
                className="input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Tu nombre"
              />
              <button className="btn-secondary" type="submit">
                Guardar nombre
              </button>
            </form>
            <div className="actions-row">
              <button className="btn-primary" type="button">
                Crear post
              </button>
            </div>
            <div className="counts-row">
              <div className="count-card">
                <strong>{seguidoresCount}</strong>
                <span>Seguidores</span>
              </div>
              <div className="count-card">
                <strong>{siguiendoCount}</strong>
                <span>Siguiendo</span>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h3>Géneros favoritos</h3>
          {subjects.length === 0 ? (
            <p className="muted">Aún no configuras tus géneros favoritos.</p>
          ) : (
            <div className="chips-grid">
              {subjects.map((s) => (
                <span key={s} className="chip chip-selected">
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3>Libros favoritos</h3>
          <div className="cards-grid">
            {favoritos.map((book) => (
              <div key={book.bookId} className="book-card">
                {book.portada ? (
                  <img src={book.portada} alt={book.titulo} className="book-cover" />
                ) : (
                  <div className="book-cover placeholder">Sin portada</div>
                )}
                <div className="book-info">
                  <h4>{book.titulo}</h4>
                  <p className="muted">{(book.autores || []).join(", ")}</p>
                  <button className="btn-secondary" type="button" onClick={() => removeBook("favoritos", book.bookId)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            {favoritos.length === 0 && <p className="muted">Aún no tienes libros favoritos.</p>}
          </div>
        </section>

        <section>
          <h3>Libros que estoy leyendo</h3>
          <div className="cards-grid">
            {leyendo.map((book) => (
              <div key={book.bookId} className="book-card">
                {book.portada ? (
                  <img src={book.portada} alt={book.titulo} className="book-cover" />
                ) : (
                  <div className="book-cover placeholder">Sin portada</div>
                )}
                <div className="book-info">
                  <h4>{book.titulo}</h4>
                  <p className="muted">{(book.autores || []).join(", ")}</p>
                  <button className="btn-secondary" type="button" onClick={() => removeBook("leyendo", book.bookId)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            {leyendo.length === 0 && <p className="muted">Aún no tienes libros en lectura.</p>}
          </div>
        </section>

        <section>
          <h3>Libros leídos</h3>
          <div className="cards-grid">
            {leidos.map((book) => (
              <div key={book.bookId} className="book-card">
                {book.portada ? (
                  <img src={book.portada} alt={book.titulo} className="book-cover" />
                ) : (
                  <div className="book-cover placeholder">Sin portada</div>
                )}
                <div className="book-info">
                  <h4>{book.titulo}</h4>
                  <p className="muted">{(book.autores || []).join(", ")}</p>
                  <button className="btn-secondary" type="button" onClick={() => removeBook("leidos", book.bookId)}>
                    Quitar
                  </button>
                </div>
              </div>
            ))}
            {leidos.length === 0 && <p className="muted">Aún no marcas libros como leídos.</p>}
          </div>
        </section>

        <section>
          <h3>Buscar libros y agregar</h3>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              className="input"
              placeholder="Ej. El señor de los anillos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select className="input" value={targetList} onChange={(e) => setTargetList(e.target.value)}>
              <option value="favoritos">Favoritos</option>
              <option value="leyendo">Leyendo</option>
              <option value="leidos">Leídos</option>
            </select>
            <button className="btn-primary" type="submit" disabled={loadingSearch}>
              {loadingSearch ? "Buscando..." : "Buscar"}
            </button>
          </form>
          <div className="cards-grid">
            {results.map((book) => (
              <div key={book.bookId} className="book-card">
                {book.portada ? (
                  <img src={book.portada} alt={book.titulo} className="book-cover" />
                ) : (
                  <div className="book-cover placeholder">Sin portada</div>
                )}
                <div className="book-info">
                  <h4>{book.titulo}</h4>
                  <p className="muted">{(book.autores || []).join(", ")}</p>
                  <button className="btn-secondary" type="button" onClick={() => addBook(book)}>
                    Agregar a {targetList}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
