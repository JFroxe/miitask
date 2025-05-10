import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../pages/firebaseConfig"; // Asegúrate de la ruta correcta
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin(userCredential.user);
      navigate("/TaskList"); // Redirigir al panel de tareas tras el login
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Credenciales inválidas. Intenta nuevamente.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Iniciar Sesión</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          style={styles.input}
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <button style={styles.button} type="submit">Ingresar</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#eef2f7",
    padding: "20px",
  },
  title: {
    fontSize: "2.5rem",
    color: "#333",
    marginBottom: "30px",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "'Roboto', sans-serif",
  },
  input: {
    padding: "15px",
    marginBottom: "15px",
    width: "100%",
    maxWidth: "450px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "1rem",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "border-color 0.3s, box-shadow 0.3s",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch", // Para que los inputs ocupen el ancho completo
    width: "100%",
    maxWidth: "450px",
  },
  button: {
    padding: "15px 25px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1.2rem",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s, transform 0.2s",
  },
};

export default Login;