import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBlockedUsers, blockUser } from "../api/users";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const Settings = () => {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlocked = async () => {
      try {
        setLoading(true);
        const res = await getBlockedUsers();
        setBlockedUsers(res || []);
      } catch (err) {
        toast.error("No se pudo cargar la lista de bloqueados");
      } finally {
        setLoading(false);
      }
    };
    loadBlocked();
  }, []);

  const handleUnblock = async (userId) => {
    try {
      await blockUser(userId); // toggles block/unblock
      setBlockedUsers(blockedUsers.filter((u) => u._id !== userId));
      toast.success("Usuario desbloqueado");
    } catch (err) {
      toast.error("No se pudo desbloquear al usuario");
    }
  };

  return (
    <div className="page">
      <div className="surface-card surface-wide">
        <div className="brand" style={{ justifyContent: "space-between" }}>
          <span>Configuración</span>
          <button className="btn-secondary" onClick={() => navigate(-1)} style={{ padding: "6px 10px" }}>
            ← Volver
          </button>
        </div>

        <section>
          <div className="section-title">
            <h3>Usuarios bloqueados</h3>
          </div>
          {loading ? (
            <p className="muted">Cargando...</p>
          ) : blockedUsers.length === 0 ? (
            <p className="muted">No tienes usuarios bloqueados.</p>
          ) : (
            <div className="cards-grid">
              {blockedUsers.map((user) => (
                <div key={user._id} className="post-card" style={{ padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.nombre} className="post-avatar" />
                    ) : (
                      <div className="post-avatar">{(user.nombre || "U").slice(0, 2).toUpperCase()}</div>
                    )}
                    <div>
                      <strong>{user.nombre}</strong>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleUnblock(user._id)}
                      style={{ padding: "6px 10px" }}
                    >
                      Desbloquear
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

export default Settings;
