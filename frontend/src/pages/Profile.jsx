import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMe,
  updateAvatar,
  updateName,
  updateFavoritos,
  updateLeyendo,
  updateLeidos,
  updateSubjects,
} from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { searchBooks } from "../api/books";
import { createPost, getUserPosts, toggleLike, toggleDislike, createComment, toggleLikeComment, toggleDislikeComment } from "../api/posts";
import Navbar from "../components/Navbar";

const SUBJECTS_OPTIONS = [
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

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState(user?.subjectsFavoritos || []);
  const [postText, setPostText] = useState("");
  const [postBook, setPostBook] = useState(null);
  const [searchPostQuery, setSearchPostQuery] = useState("");
  const [postBookResults, setPostBookResults] = useState([]);
  const [loadingPostSearch, setLoadingPostSearch] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentText, setCommentText] = useState({});
  const seguidoresCount = user?.seguidoresCount ?? user?.seguidores?.length ?? 0;
  const siguiendoCount = user?.siguiendoCount ?? user?.siguiendo?.length ?? 0;

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [user, dispatch]);

  // Polling para actualizar contadores de seguidores/siguiendo cada 5 segundos
  useEffect(() => {
    // Ejecutar fetchMe periódicamente para mantener datos actualizados
    const interval = setInterval(() => {
      dispatch(fetchMe());
    }, 5000); // 5 segundos

    // Cleanup: limpiar interval cuando el componente se desmonte
    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (user?._id) {
        try {
          setLoadingPosts(true);
          const posts = await getUserPosts(user._id);
          setUserPosts(posts);
        } catch (err) {
          console.error("Error loading posts:", err);
        } finally {
          setLoadingPosts(false);
        }
      }
    };
    loadUserPosts();
  }, [user?._id]);

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
      .then(() => {
        toast.success("Nombre actualizado");
        setShowNameModal(false);
      })
      .catch((err) => toast.error(err));
  };

  const handleSubjectsSave = () => {
    dispatch(updateSubjects(selectedSubjects))
      .unwrap()
      .then(() => {
        toast.success("Géneros actualizados");
        setShowSubjectsModal(false);
      })
      .catch((err) => toast.error(err));
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleSearchPostBook = async (e) => {
    e.preventDefault();
    if (!searchPostQuery.trim()) return;
    try {
      setLoadingPostSearch(true);
      const data = await searchBooks(searchPostQuery, 0, 8);
      setPostBookResults(data.resultados || data.items || []);
    } catch {
      toast.error("No se pudo buscar libros");
    } finally {
      setLoadingPostSearch(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) {
      toast.error("Escribe algo en tu post");
      return;
    }
    try {
      const newPost = await createPost({ texto: postText, libro: postBook });
      toast.success("Post creado");
      setPostText("");
      setPostBook(null);
      setSearchPostQuery("");
      setPostBookResults([]);
      setShowPostModal(false);
      // Agregar el post nuevo al inicio
      setUserPosts([newPost, ...userPosts]);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al crear post");
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const updated = await toggleLike(postId);
      setUserPosts(userPosts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar like");
    }
  };

  const handleToggleDislike = async (postId) => {
    try {
      const updated = await toggleDislike(postId);
      setUserPosts(userPosts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar dislike");
    }
  };

  const handleAddComment = async (postId) => {
    const texto = commentText[postId];
    if (!texto || !texto.trim()) return;
    try {
      const updated = await createComment(postId, texto);
      setUserPosts(userPosts.map((p) => (p._id === postId ? updated : p)));
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      toast.error("Error al comentar");
    }
  };

  const handleToggleCommentLike = async (postId, comentarioId) => {
    try {
      const updated = await toggleLikeComment(postId, comentarioId);
      setUserPosts(userPosts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar like al comentario");
    }
  };

  const handleToggleCommentDislike = async (postId, comentarioId) => {
    try {
      const updated = await toggleDislikeComment(postId, comentarioId);
      setUserPosts(userPosts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar dislike al comentario");
    }
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
        <div className="profile-header-new">
          <div className="profile-left">
            <div className="avatar-circle-large">
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
            <div className="profile-info">
              <div className="profile-name-section">
                <h2>{user?.nombre || "Usuario"}</h2>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => navigate("/configuracion")}
                  style={{ marginLeft: "8px", padding: "6px 10px" }}
                >
                  Configuración
                </button>
                <button className="icon-button" onClick={() => {
                  setNameInput(user?.nombre || "");
                  setShowNameModal(true);
                }} title="Editar nombre">
                  ✏️
                </button>
              </div>
              <button className="btn-primary" type="button" onClick={() => setShowPostModal(true)} style={{ marginTop: '12px', width: 'fit-content' }}>
                + Crear post
              </button>
            </div>
          </div>
          <div className="profile-right">
            <div className="count-card-large">
              <strong>{seguidoresCount}</strong>
              <span>Seguidores</span>
            </div>
            <div className="count-card-large">
              <strong>{siguiendoCount}</strong>
              <span>Siguiendo</span>
            </div>
          </div>
        </div>

        <section>
          <div className="section-title">
            <h3>Géneros favoritos</h3>
            <button className="icon-button" type="button" onClick={() => {
              setSelectedSubjects(user?.subjectsFavoritos || []);
              setShowSubjectsModal(true);
            }} title="Editar géneros">
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

        <section>
          <div className="section-title">
            <h3>Mis posts</h3>
          </div>
          {loadingPosts ? (
            <p className="muted">Cargando posts...</p>
          ) : userPosts.length === 0 ? (
            <p className="muted">Aún no has creado posts.</p>
          ) : (
            <div className="posts-list">
              {userPosts.map((post) => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <div 
                      className="post-author"
                      style={{ cursor: post.autor?._id !== user?._id ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (post.autor?._id && post.autor._id !== user?._id) {
                          navigate(`/usuario/${post.autor._id}`);
                        }
                      }}
                    >
                      {post.autor?.avatarUrl ? (
                        <img src={post.autor.avatarUrl} alt={post.autor.nombre} className="post-avatar" />
                      ) : (
                        <div className="post-avatar">{(post.autor?.nombre || "U").slice(0, 2).toUpperCase()}</div>
                      )}
                      <div>
                        <strong style={post.autor?._id !== user?._id ? { textDecoration: 'underline' } : {}}>
                          {post.autor?.nombre || "Usuario"}
                        </strong>
                        <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="post-text">{post.texto}</p>
                  {post.libro && (
                    <div className="post-book">
                      {post.libro.portada && <img src={post.libro.portada} alt={post.libro.titulo} />}
                      <div>
                        <strong>{post.libro.titulo}</strong>
                        <p className="muted">{(post.libro.autores || []).join(", ")}</p>
                      </div>
                    </div>
                  )}
                  <div className="post-actions">
                    <button onClick={() => handleToggleLike(post._id)} className="action-btn">
                      👍 {post.likes?.length || 0}
                    </button>
                    <button onClick={() => handleToggleDislike(post._id)} className="action-btn">
                      👎 {post.dislikes?.length || 0}
                    </button>
                    <span className="muted">💬 {post.comentarios?.length || 0}</span>
                  </div>
                  {post.comentarios && post.comentarios.length > 0 && (
                    <div className="comments-list">
                      {post.comentarios.map((comment) => (
                        <div key={comment._id} className="comment">
                          <div 
                            style={{ cursor: comment.autor?._id !== user?._id ? 'pointer' : 'default', display: 'inline-block' }}
                            onClick={() => {
                              if (comment.autor?._id && comment.autor._id !== user?._id) {
                                navigate(`/usuario/${comment.autor._id}`);
                              }
                            }}
                          >
                            <strong style={comment.autor?._id !== user?._id ? { textDecoration: 'underline' } : {}}>
                              {comment.autor?.nombre || "Usuario"}
                            </strong>
                          </div>
                          <p>{comment.texto}</p>
                          <div className="comment-actions">
                            <button 
                              onClick={() => handleToggleCommentLike(post._id, comment._id)} 
                              className="action-btn"
                              style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                            >
                              👍 {comment.likes?.length || 0}
                            </button>
                            <button 
                              onClick={() => handleToggleCommentDislike(post._id, comment._id)} 
                              className="action-btn"
                              style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                            >
                              👎 {comment.dislikes?.length || 0}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="comment-form">
                    <input
                      className="input"
                      placeholder="Escribe un comentario..."
                      value={commentText[post._id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddComment(post._id);
                        }
                      }}
                    />
                    <button className="btn-secondary" onClick={() => handleAddComment(post._id)}>
                      Comentar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
        <div className="modal-backdrop" onClick={() => setShowNameModal(false)}>
          <div className="modal-card modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar nombre</h3>
              <button className="icon-button" onClick={() => setShowNameModal(false)}>✕</button>
            </div>
            <form onSubmit={handleNameSave}>
              <input
                className="input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Tu nombre"
                autoFocus
              />
              <button className="btn-primary" type="submit" style={{ marginTop: '12px' }}>
                Guardar
              </button>
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
              {SUBJECTS_OPTIONS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  className={`chip ${selectedSubjects.includes(subject) ? "chip-selected" : ""}`}
                  onClick={() => toggleSubject(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>
            <button className="btn-primary" type="button" onClick={handleSubjectsSave} style={{ marginTop: '16px' }}>
              Guardar géneros
            </button>
          </div>
        </div>
      )}

      {showPostModal && (
        <div className="modal-backdrop" onClick={() => setShowPostModal(false)}>
          <div className="modal-card modal-post" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear post</h3>
              <button className="icon-button" onClick={() => setShowPostModal(false)}>✕</button>
            </div>
            <textarea
              className="post-textarea"
              placeholder="¿Qué estás pensando?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={4}
            />
            {postBook && (
              <div className="selected-book-card">
                <img src={postBook.portada} alt={postBook.titulo} className="selected-book-img" />
                <div>
                  <strong>{postBook.titulo}</strong>
                  <p className="muted">{(postBook.autores || []).join(", ")}</p>
                </div>
                <button className="icon-button" onClick={() => setPostBook(null)}>✕</button>
              </div>
            )}
            <details style={{ marginTop: '12px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Agregar libro (opcional)</summary>
              <form className="search-bar" onSubmit={handleSearchPostBook} style={{ marginTop: '12px' }}>
                <input
                  className="input"
                  placeholder="Busca un libro..."
                  value={searchPostQuery}
                  onChange={(e) => setSearchPostQuery(e.target.value)}
                />
                <button className="btn-secondary" type="submit" disabled={loadingPostSearch}>
                  {loadingPostSearch ? "Buscando..." : "Buscar"}
                </button>
              </form>
              <div className="cards-grid" style={{ marginTop: '12px' }}>
                {postBookResults.map((book) => (
                  <div key={book.bookId} className="book-card-mini" onClick={() => {
                    setPostBook({ bookId: book.bookId, titulo: book.titulo, autores: book.autores, portada: book.portada });
                    setPostBookResults([]);
                  }}>
                    {book.portada && <img src={book.portada} alt={book.titulo} className="book-cover-mini" />}
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{book.titulo}</strong>
                      <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>{(book.autores || []).join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
            <button className="btn-primary" type="button" onClick={handleCreatePost} style={{ marginTop: '16px' }}>
              Publicar
            </button>
          </div>
        </div>
      )}
      <Navbar />
    </div>
  );
};

export default Profile;
