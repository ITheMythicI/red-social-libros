import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getPosts, toggleLike, toggleDislike, createComment } from "../api/posts";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await getPosts();
        setPosts(data);
      } catch (err) {
        console.error("Error loading posts:", err);
        toast.error("No se pudieron cargar los posts");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

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

  return (
    <div className="page">
      <div className="surface-card surface-wide">
        <div className="brand">
          <span role="img" aria-label="book">
            📚
          </span>
          Red Social de Libros
        </div>
        <h1 style={{ margin: "8px 0", fontSize: "1.8rem", color: "var(--accent-strong)" }}>
          Feed
        </h1>

        {loading ? (
          <p className="muted">Cargando posts...</p>
        ) : posts.length === 0 ? (
          <div>
            <p className="muted">No hay posts todavía. ¡Sé el primero en crear uno!</p>
            <a className="switch-link" href="/perfil">Ir a mi perfil</a>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    {post.autor?.avatarUrl ? (
                      <img src={post.autor.avatarUrl} alt={post.autor.nombre} className="post-avatar" />
                    ) : (
                      <div className="post-avatar">{(post.autor?.nombre || "U").slice(0, 2).toUpperCase()}</div>
                    )}
                    <div>
                      <strong>{post.autor?.nombre || "Usuario"}</strong>
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
                        <strong>{comment.autor?.nombre || "Usuario"}</strong>
                        <p>{comment.texto}</p>
                        <div className="comment-actions">
                          <span className="muted">👍 {comment.likes?.length || 0}</span>
                          <span className="muted">👎 {comment.dislikes?.length || 0}</span>
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
      </div>
      <Navbar />
    </div>
  );
};

export default Home;
