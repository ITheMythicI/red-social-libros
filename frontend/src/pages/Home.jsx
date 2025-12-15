import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPosts, toggleLike, toggleDislike, createComment, toggleLikeComment, toggleDislikeComment } from "../api/posts";
import { getBookSuggestions, getAuthorBiography, getCuriousFacts } from "../api/books";
import librumLogo from "../assets/librum-logo.png";

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [curiousFacts, setCuriousFacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [feedItems, setFeedItems] = useState([]);
  const [expandedAuthors, setExpandedAuthors] = useState(new Set());

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        
        // Cargar todos los datos en paralelo
        const [postsData, suggestionsData, factsData] = await Promise.all([
          getPosts().catch(() => []),
          getBookSuggestions().catch(() => ({ sugerencias: [] })),
          getCuriousFacts().catch(() => ({ datosCuriosos: [] }))
        ]);

        setPosts(postsData);
        setSuggestions(suggestionsData.sugerencias || []);
        setCuriousFacts(factsData.datosCuriosos || []);
      } catch (err) {
        console.error("Error loading feed:", err);
        toast.error("No se pudieron cargar algunos contenidos");
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, []);

  // Mezclar y ordenar el feed
  useEffect(() => {
    const items = [];
    
    // Agregar posts
    posts.forEach(post => {
      items.push({ type: 'post', data: post, timestamp: new Date(post.createdAt) });
    });

    // Agregar sugerencias de libros
    suggestions.forEach((book, index) => {
      items.push({ 
        type: 'suggestion', 
        data: book, 
        timestamp: new Date(Date.now() - index * 60000) // Espaciados por minuto
      });
    });

    // Agregar solo un dato curioso al azar
    if (curiousFacts.length > 0) {
      const randomFact = curiousFacts[Math.floor(Math.random() * curiousFacts.length)];
      items.push({ 
        type: 'curious-fact', 
        data: randomFact, 
        timestamp: new Date(Date.now() - 10 * 60000)
      });
    }

    // Ordenar por timestamp (más reciente primero)
    items.sort((a, b) => b.timestamp - a.timestamp);
    
    setFeedItems(items);
  }, [posts, suggestions, curiousFacts]);

  const handleToggleLike = async (postId) => {
    try {
      const updated = await toggleLike(postId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar like");
    }
  };

  const handleToggleDislike = async (postId) => {
    try {
      const updated = await toggleDislike(postId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar dislike");
    }
  };

  const handleAddComment = async (postId) => {
    const texto = commentText[postId];
    if (!texto || !texto.trim()) return;
    try {
      const updated = await createComment(postId, texto);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
      setCommentText({ ...commentText, [postId]: "" });
      toast.success("Comentario agregado");
    } catch (err) {
      toast.error("Error al comentar");
    }
  };

  const handleToggleCommentLike = async (postId, comentarioId) => {
    try {
      const updated = await toggleLikeComment(postId, comentarioId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar like al comentario");
    }
  };

  const handleToggleCommentDislike = async (postId, comentarioId) => {
    try {
      const updated = await toggleDislikeComment(postId, comentarioId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      toast.error("Error al dar dislike al comentario");
    }
  };

  const handleLoadAuthorBio = async (authorName) => {
    if (expandedAuthors.has(authorName)) {
      setExpandedAuthors(prev => {
        const newSet = new Set(prev);
        newSet.delete(authorName);
        return newSet;
      });
      return;
    }

    try {
      const bio = await getAuthorBiography(authorName);
      // Guardar la biografía en el estado de la sugerencia
      setSuggestions(prev => prev.map(book => {
        if (book.autores?.includes(authorName)) {
          return { ...book, biografia: bio };
        }
        return book;
      }));
      setExpandedAuthors(prev => new Set(prev).add(authorName));
    } catch (err) {
      toast.error("No se pudo cargar la biografía");
    }
  };

  const handleUserClick = (userId) => {
    if (userId && userId !== user?._id) {
      navigate(`/usuario/${userId}`);
    } else if (userId === user?._id) {
      navigate("/perfil");
    }
  };

  const renderPost = (post) => (
    <div key={post._id} className="feed-item post-card">
      <div className="post-header">
        <div 
          className="post-author"
          style={{ cursor: 'pointer' }}
          onClick={() => handleUserClick(post.autor?._id)}
        >
          {post.autor?.avatarUrl ? (
            <img src={post.autor.avatarUrl} alt={post.autor.nombre} className="post-avatar" />
          ) : (
            <div className="post-avatar">{(post.autor?.nombre || "U").slice(0, 2).toUpperCase()}</div>
          )}
          <div>
            <strong style={{ textDecoration: 'underline' }}>{post.autor?.nombre || "Usuario"}</strong>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              {new Date(post.createdAt).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
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
                onClick={() => handleUserClick(comment.autor?._id)}
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
  );

  const renderSuggestion = (book) => (
    <div key={`suggestion-${book.bookId}`} className="feed-item suggestion-card">
      <div className="suggestion-header">
        <span className="suggestion-badge">📚 Recomendación para ti</span>
      </div>
      <div className="suggestion-content">
        <div className="suggestion-book">
          {book.portada ? (
            <img src={book.portada} alt={book.titulo} className="suggestion-cover" />
          ) : (
            <div className="suggestion-cover placeholder">📖</div>
          )}
          <div className="suggestion-info">
            <h3>{book.titulo}</h3>
            <p className="muted">{(book.autores || []).join(", ")}</p>
            {book.descripcion && (
              <p className="suggestion-synopsis">
                {book.descripcion.length > 200 
                  ? `${book.descripcion.substring(0, 200)}...` 
                  : book.descripcion}
              </p>
            )}
            {book.autores && book.autores.length > 0 && (
              <div className="author-bio-section">
                {book.autores.map((author, idx) => {
                  const isExpanded = expandedAuthors.has(author);
                  const bio = book.biografia;
                  return (
                    <div key={idx} className="author-bio">
                      <button 
                        className="author-bio-btn"
                        onClick={() => handleLoadAuthorBio(author)}
                      >
                        {isExpanded ? '▼' : '▶'} Conocer más sobre {author}
                      </button>
                      {isExpanded && bio && (
                        <div className="author-bio-content">
                          <p><strong>{bio.nombre}</strong></p>
                          <p>{bio.descripcion}</p>
                          {bio.categorias && bio.categorias.length > 0 && (
                            <div className="bio-categories">
                              {bio.categorias.slice(0, 3).map((cat, i) => (
                                <span key={i} className="bio-tag">{cat}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCuriousFact = (fact) => (
    <div key={`fact-${fact.titulo}`} className="feed-item curious-fact-card">
      <div className="curious-fact-header">
        <span className="curious-fact-icon">{fact.imagen}</span>
        <span className="curious-fact-badge">💡 Dato Curioso</span>
      </div>
      <div className="curious-fact-content">
        <h3>{fact.titulo}</h3>
        <p>{fact.contenido}</p>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="surface-card surface-wide">
        <div className="brand">
          <img src={librumLogo} alt="Librum" style={{ height: "32px", width: "auto" }} />
          <span>Librum</span>
        </div>
        <h1 style={{ margin: "8px 0", fontSize: "1.8rem", color: "var(--accent-strong)" }}>
          Feed
        </h1>

        {loading ? (
          <p className="muted">Cargando contenido...</p>
        ) : feedItems.length === 0 ? (
          <div>
            <p className="muted">No hay contenido todavía. ¡Sé el primero en crear un post!</p>
            <a className="switch-link" href="/perfil">Ir a mi perfil</a>
          </div>
        ) : (
          <div className="feed-container">
            {feedItems.map((item, index) => {
              switch (item.type) {
                case 'post':
                  return renderPost(item.data);
                case 'suggestion':
                  return renderSuggestion(item.data);
                case 'curious-fact':
                  return renderCuriousFact(item.data);
                default:
                  return null;
              }
            })}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default Home;
