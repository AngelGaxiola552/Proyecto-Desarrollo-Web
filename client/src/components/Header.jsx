// Header adaptable: cambia según si hay sesión iniciada o no.
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';

export default function Header() {
  const { usuario, logout } = useAuth();
  const { mostrarMensaje } = useMensaje();
  const navigate = useNavigate();

  async function cerrarSesion() {
    try {
      await logout();
      mostrarMensaje('exito', 'Sesión cerrada');
      navigate('/');
    } catch (err) {
      mostrarMensaje('error', err.message);
    }
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to={usuario ? '/dashboard' : '/'}>NetScope</Link>

        {usuario ? (
          // Con sesión: menú de pantallas, nombre del usuario y botón para salir
          <div className="d-flex flex-wrap align-items-center gap-3">
            <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
            <Link className="nav-link text-white" to="/escaneos/nuevo">Nuevo escaneo</Link>
            <Link className="nav-link text-white" to="/escaneos">Historial</Link>
            <Link className="nav-link text-white" to="/targets">Targets</Link>
            <Link className="nav-link text-white" to="/perfiles">Perfiles</Link>
            <Link className="nav-link text-white" to="/actividad">Actividad</Link>
            {usuario.role === 'admin' && <Link className="nav-link text-white" to="/admin/usuarios">Admin</Link>}
            <Link className="nav-link text-warning" to="/perfil">Hola, {usuario.name}</Link>
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
