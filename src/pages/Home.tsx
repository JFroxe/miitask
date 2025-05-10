import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// 🎨 Animación de fondo dinámico
const gradientAnimation = keyframes`
  0% { background: #1e3c72; }
  50% { background: #2a5298; }
  100% { background: #1e3c72; }
`;

// 🌆 Contenedor principal con diseño mejorado
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  animation: ${gradientAnimation} 5s infinite alternate;
  background-size: cover;
  color: white;
`;

// ✨ Estilizar título
const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

// 📢 Sección informativa
const InfoSection = styled.div`
  width: 60%;
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
`;

// 🔘 Botón con animación mejorada
const Button = styled(Link)`
  display: inline-block;
  padding: 15px 25px;
  margin: 10px;
  background: #ff9800;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.3s ease, background 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    background: #e68900;
  }
`;

const Home = () => {
  return (
    <Container>
      <Title>Bienvenido a Mii Task</Title>
      <InfoSection>
        ¡Optimiza la gestión de reparaciones con nuestro sistema! Lleva un seguimiento detallado de cada reparación de celulares y mejora la eficiencia en tu trabajo.
      </InfoSection>
      <Button to="/register">Registrarse</Button>
      <Button to="/login">Iniciar Sesión</Button>
    </Container>
  );
};

export default Home;
