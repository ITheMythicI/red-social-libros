import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMe,
  updateAvatar,
  updateName,
  updateSubjects,
  updateFavoritos,
  updateLeyendo,
  updateLeidos,
} from "../features/auth/authSlice";
import { toast } from "react-toastify";
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
  const [showModal, setShowModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [tempSubjects, setTempSubjects] = useState(subjects);
  const [tempName, setTempName] = useState(nameInput);
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
    e?.preventDefault();
    dispatch(updateName(tempName))
      .unwrap()
      .then(() => toast.success("Nombre actualizado"))
      .catch((err) => toast.error(err));
    setNameInput(tempName);
    setShowNameModal(false);
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

  const openModalFor = (listName) => {
    setTargetList(listName);
    setShowModal(true);
    setQuery("");
    setResults([]);
  };

  const closeModal = () => setShowModal(false);
  const closeNameModal = () => setShowNameModal(false);
  const openNameModal = () => {
    setTempName(nameInput);
    setShowNameModal(true);
  };

  const openSubjectsModal = () => {
    setTempSubjects(subjects);
    setShowSubjectsModal(true);
  };

  const toggleSubject = (s) => {
    setTempSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubjectsSave = () => {
    dispatch(updateSubjects(tempSubjects))
      .unwrap()
      .then(() => toast.success("Géneros actualizados"))
      .catch((err) => toast.error(err));
    setShowSubjectsModal(false);
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
            <div className="name-row">
              <h2 className="name-display">{nameInput}</h2>
              <button className="icon-button" type="button" onClick={openNameModal} title="Editar nombre">
                ✏️
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
              <div className="actions-row">
                <button className="btn-primary" type="button">
                  Crear post
                </button>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="section-title">
            <h3>Géneros favoritos</h3>
            <button className="icon-button" type="button" onClick={openSubjectsModal} title="Editar géneros">
              ✏️
            </button>
          </div>
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
          <div className="section-title">
            <h3>Libros favoritos</h3>
            <button className="icon-button" type="button" onClick={() => openModalFor("favoritos")} title="Editar favoritos">
              ✏️
            </button>
          </div>
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
          <div className="section-title">
            <h3>Libros que estoy leyendo</h3>
            <button className="icon-button" type="button" onClick={() => openModalFor("leyendo")} title="Editar leyendo">
              ✏️
            </button>
          </div>
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
          <div className="section-title">
            <h3>Libros leídos</h3>
            <button className="icon-button" type="button" onClick={() => openModalFor("leidos")} title="Editar leídos">
              ✏️
            </button>
          </div>
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
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar a {targetList}</h3>
              <button className="icon-button" onClick={closeModal}>✕</button>
            </div>
            <form className="search-bar" onSubmit={handleSearch}>
              <input
                className="input"
                placeholder="Busca un libro..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
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
              {results.length === 0 && <p className="muted">Busca un título para agregar.</p>}
            </div>
          </div>
        </div>
      )}

      {showNameModal && (
        <div className="modal-backdrop" onClick={closeNameModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar nombre</h3>
              <button className="icon-button" onClick={closeNameModal}>✕</button>
            </div>
            <form className="form" onSubmit={handleNameSave}>
              <input
                className="input"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
              <button className="btn-primary" type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {showSubjectsModal && (
        <div className="modal-backdrop" onClick={() => setShowSubjectsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar géneros favoritos</h3>
              <button className="icon-button" onClick={() => setShowSubjectsModal(false)}>✕</button>
            </div>
            <div className="chips-grid">
              {[
                "Ficción","No ficción","Ciencia","Tecnología","Historia","Biografías",
                "Negocios","Autoayuda","Fantasía","Ciencia ficción","Misterio","Romance",
                "Educación","Arte","Viajes"
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${tempSubjects.includes(s) ? "chip-selected" : ""}`}
                  onClick={() => toggleSubject(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="actions-row modal-actions">
              <button className="btn-secondary" type="button" onClick={() => setShowSubjectsModal(false)}>Cancelar</button>
              <button className="btn-primary" type="button" onClick={handleSubjectsSave}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
