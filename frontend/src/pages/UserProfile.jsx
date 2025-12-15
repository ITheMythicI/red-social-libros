import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getUserProfile, followUser, blockUser } from "../api/users";
import { getUserPosts, toggleLike, toggleDislike, createComment, toggleLikeComment, toggleDislikeComment } from "../api/posts";
import Navbar from "../components/Navbar";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(userId);
        setProfileUser(profile);
        setIsFollowing(profile.estaSiguiendo || false);
        setIsBlocked(profile.estaBloqueado || false);
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error(err.response?.data?.mensaje || "No se pudo cargar el perfil");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };
    if (userId && userId !== currentUser?._id) {
      loadProfile();
    } else if (userId === currentUser?._id) {
      navigate("/perfil");
    }
  }, [userId, currentUser, navigate]);

  useEffect(() => {
    const loadUserPosts = async () => {
      if (profileUser?._id) {
        try {
          setLoadingPosts(true);
          const posts = await getUserPosts(profileUser._id);
          setUserPosts(posts);
        } catch (err) {
          console.error("Error loading posts:", err);
          if (err.response?.status !== 403) {
            toast.error("No se pudieron cargar los posts");
          }
        } finally {
          setLoadingPosts(false);
        }
      }
    };
    loadUserPosts();
  }, [profileUser?._id]);

  const handleFollow = async () => {
    try {
      const result = await followUser(userId);
      setIsFollowing(result.estaSiguiendo);
      toast.success(result.mensaje);
      // Recargar perfil para actualizar contadores
      const profile = await getUserProfile(userId);
      setProfileUser(profile);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al seguir/dejar de seguir");
    }
  };

  const handleBlock = async () => {
    try {
      const result = await blockUser(userId);
      setIsBlocked(result.estaBloqueado);
      toast.success(result.mensaje);
      if (result.estaBloqueado) {
        // Si bloqueó, redirigir a home
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        // Si desbloqueó, recargar perfil
        const profile = await getUserProfile(userId);
        setProfileUser(profile);
        setIsFollowing(profile.estaSiguiendo || false);
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al bloquear/desbloquear");
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

  if (loading) {
    return (
      <div className="page">
        <div className="surface-card">
          <p className="muted">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  const subjects = profileUser.subjectsFavoritos || [];
  const initials = (profileUser.nombre || "U").trim().slice(0, 2).toUpperCase();
  const seguidoresCount = profileUser.seguidoresCount ?? profileUser.seguidores?.length ?? 0;
  const siguiendoCount = profileUser.siguiendoCount ?? profileUser.siguiendo?.length ?? 0;

  return (
    <div className="page">
      <div className="surface-card surface-wide">
        <div className="profile-header-new">
          <div className="profile-left">
            <div className="avatar-circle-large">
              {profileUser.avatarUrl ? (
                <img src={profileUser.avatarUrl} alt="avatar" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name-section">
                <h2>{profileUser.nombre || "Usuario"}</h2>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button
                  className={`btn-primary ${isFollowing ? "btn-secondary" : ""}`}
                  type="button"
                  onClick={handleFollow}
                  style={{ width: "fit-content" }}
                >
                  {isFollowing ? "Dejar de seguir" : "Seguir"}
                </button>
                <button
                  className={`btn-secondary ${isBlocked ? "btn-primary" : ""}`}
                  type="button"
                  onClick={handleBlock}
                  style={{ width: "fit-content" }}
                >
                  {isBlocked ? "Desbloquear" : "Bloquear"}
                </button>
              </div>
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
          </div>
          {subjects.length === 0 ? (
            <p className="muted">Este usuario no ha configurado sus géneros favoritos.</p>
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
          </div>
          <div className="cards-grid">
            {profileUser.librosFavoritos?.map((book) => (
              <div key={book.bookId} className="book-card">
                {book.portada ? (
                  <img src={book.portada} alt={book.titulo} className="book-cover" />
                ) : (
                  <div className="book-cover placeholder">Sin portada</div>
                )}
                <div className="book-info">
                  <h4>{book.titulo}</h4>
                  <p className="muted">{(book.autores || []).join(", ")}</p>
                </div>
              </div>
            ))}
            {(!profileUser.librosFavoritos || profileUser.librosFavoritos.length === 0) && (
              <p className="muted">Este usuario no tiene libros favoritos.</p>
            )}
          </div>
        </section>

        <section>
          <div className="section-title">
            <h3>Libros que está leyendo</h3>
          </div>
          <div className="cards-grid">
            {profileUser.librosLeyendo?.map((book) => (
              <div key={book.bookId} className="book-card">
                {book.portada ? (
                  <img src={book.portada} alt={book.titulo} className="book-cover" />
                ) : (
                  <div className="book-cover placeholder">Sin portada</div>
                )}
                <div className="book-info">
                  <h4>{book.titulo}</h4>
                  <p className="muted">{(book.autores || []).join(", ")}</p>
                </div>
              </div>
            ))}
            {(!profileUser.librosLeyendo || profileUser.librosLeyendo.length === 0) && (
              <p className="muted">Este usuario no tiene libros en lectura.</p>
            )}
          </div>
        </section>

        <section>
          <div className="section-title">
            <h3>Libros leídos</h3>
          </div>
          <div className="cards-grid">
            {profileUser.librosLeidos?.map((book) => (
              <div key={book.bookId} className="book-card">
                {book.portada ? (
                  <img src={book.portada} alt={book.titulo} className="book-cover" />
                ) : (
                  <div className="book-cover placeholder">Sin portada</div>
                )}
                <div className="book-info">
                  <h4>{book.titulo}</h4>
                  <p className="muted">{(book.autores || []).join(", ")}</p>
                </div>
              </div>
            ))}
            {(!profileUser.librosLeidos || profileUser.librosLeidos.length === 0) && (
              <p className="muted">Este usuario no ha marcado libros como leídos.</p>
            )}
          </div>
        </section>

        <section>
          <div className="section-title">
            <h3>Posts</h3>
          </div>
          {loadingPosts ? (
            <p className="muted">Cargando posts...</p>
          ) : userPosts.length === 0 ? (
            <p className="muted">Este usuario aún no ha creado posts.</p>
          ) : (
            <div className="posts-list">
              {userPosts.map((post) => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <div 
                      className="post-author"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        if (post.autor?._id) {
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
                        <strong style={{ textDecoration: 'underline' }}>{post.autor?.nombre || "Usuario"}</strong>
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
                            style={{ cursor: 'pointer', display: 'inline-block' }}
                            onClick={() => {
                              if (comment.autor?._id) {
                                navigate(`/usuario/${comment.autor._id}`);
                              }
                            }}
                          >
                            <strong style={{ textDecoration: 'underline' }}>
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
      <Navbar />
    </div>
  );
};

export default UserProfile;
