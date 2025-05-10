import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./pages/firebaseConfig";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TaskList from "./pages/TaskList";
import GlobalStyle from "./pages/createGlobalStyle";
import AuthPage from './auth/AuthPage'; // Si usas AuthPage

// 🔄 Redirigir automáticamente si el usuario intenta cambiar la URL manualmente
const AutoRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user && (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/")) {
        navigate("/TaskList"); 
      }
    }
  }, [location, loading, user, navigate]);

  return null;
};


// 🔐 Rutas protegidas: Solo usuarios autenticados pueden ver la gestión de tareas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};

// 🔐 Evitar que usuarios autenticados accedan a Home, Login o Register
const AuthRedirect = ({ children }: { children: JSX.Element }) => {
  return auth.currentUser ? <Navigate to="/TaskList" /> : children;
};

// 🔴 Botón para cerrar sesión
const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirigir al login tras cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <button onClick={handleLogout} style={{ padding: "10px", background: "red", color: "white", borderRadius: "5px", cursor: "pointer" }}>
      Cerrar Sesión
    </button>
  );
};

function App() {
  return (
    <Router>
	  <GlobalStyle />
      <AutoRedirect />
      <Routes>
        <Route path="/" element={<AuthRedirect><Home /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
        <Route path="/login" element={<AuthPage />} /> {/* Usamos AuthPage */}
        <Route path="/TaskList" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
