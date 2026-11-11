// Header adaptable: cambia según si hay sesión iniciada o no.
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">NetScope</Link>

        {usuario ? (
          // Con sesión: nombre del usuario y botón para salir
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">Hola, {usuario.name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          // Sin sesión: botones para entrar o registrarse
          <div className="d-flex gap-2">
            <Link className="btn btn-outline-light btn-sm" to="/login">Iniciar sesión</Link>
            <Link className="btn btn-primary btn-sm" to="/registro">Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
