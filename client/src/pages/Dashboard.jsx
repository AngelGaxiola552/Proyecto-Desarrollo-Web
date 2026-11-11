// Pantalla temporal a la que llegas después de entrar o registrarte.
// Se completará más adelante con el dashboard real.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { usuario } = useAuth();

  // Si no hay sesión, se regresa al login
  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Bienvenido, {usuario.name} ({usuario.role}). Esta pantalla se construirá después.</p>
    </div>
  );
}
