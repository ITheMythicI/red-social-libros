import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, updateAvatar } from "../features/auth/authSlice";
import { toast } from "react-toastify";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [user, dispatch]);

  const subjects = user?.subjectsFavoritos || [];
  const favoritos = user?.librosFavoritos || [];
  const initials = (user?.nombre || "U").trim().slice(0, 2).toUpperCase();

  const handleAvatarSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get("avatarUrl") || "";
    dispatch(updateAvatar(url))
      .unwrap()
      .then(() => toast.success("Avatar actualizado"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className="page">
      <div className="surface-card surface-wide">
        <div className="brand">
          <span role="img" aria-label="user">
            👤
          </span>
          Mi perfil
        </div>

        <h2 style={{ margin: "8px 0 0" }}>{user?.nombre || "Usuario"}</h2>
        <div className="avatar-row">
          <div className="avatar-circle">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <form className="avatar-form" onSubmit={handleAvatarSave}>
            <label>URL de imagen de perfil</label>
            <input
              className="input"
              name="avatarUrl"
              type="url"
              placeholder="https://ejemplo.com/mi-foto.jpg"
              defaultValue={user?.avatarUrl || ""}
            />
            <button className="btn-secondary" type="submit">Guardar avatar</button>
          </form>
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
          {favoritos.length === 0 ? (
            <p className="muted">Aún no tienes libros favoritos.</p>
          ) : (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
