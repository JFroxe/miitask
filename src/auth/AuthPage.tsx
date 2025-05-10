import React from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../pages/Login';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (user: any) => {
    console.log('Usuario logueado:', user);
    // Aquí podrías guardar la información del usuario en un estado global
    // o en localStorage si lo necesitas.
    navigate('/TaskList'); // Redirigir al panel de tareas
  };

  return (
    <div>
      <Login onLogin={handleLoginSuccess} /> {/* Le pasamos la función onLogin */}
    </div>
  );
};

export default AuthPage;