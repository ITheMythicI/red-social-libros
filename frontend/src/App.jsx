import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";

function App() {
  const { token, user } = useSelector((state) => state.auth);
  const needsOnboarding =
    !!token && (!user?.subjectsFavoritos?.length || !user?.librosFavoritos?.length);

  const Protected = ({ children }) => {
    if (!token) return <Navigate to="/login" replace />;
    if (needsOnboarding && window.location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    return children;
  };

  const RedirectIfAuth = ({ children }) => {
    if (token) {
      if (needsOnboarding) return <Navigate to="/onboarding" replace />;
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuth>
              <Register />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/home"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Protected>
              <Onboarding />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" theme="light" />
    </BrowserRouter>
  );
}

export default App;
