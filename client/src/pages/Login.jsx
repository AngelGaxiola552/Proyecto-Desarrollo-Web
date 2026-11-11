// Pantalla 2: Inicio de sesión.
// Valida los campos, muestra "cargando" mientras responde y errores si falla.
// Incluye el modal informativo "Recuperar acceso".
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  function validar() {
    const e = {};
    if (!email.trim()) e.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Formato de correo inválido';
    if (!password) e.password = 'La contraseña es obligatoria';
    return e;
  }

  async function enviar(evento) {
    evento.preventDefault(); // evita que el formulario recargue la página
    const e = validar();
    setErrores(e);
    setErrorServidor('');
    if (Object.keys(e).length > 0) return; // hay errores, no se envía

    setCargando(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="form-auth">
      <h2 className="mb-4">Iniciar sesión</h2>

      {errorServidor && <div className="alert alert-danger">{errorServidor}</div>}

      <form onSubmit={enviar} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            className={`form-control ${errores.email ? 'is-invalid' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="invalid-feedback">{errores.email}</div>
        </div>

        <div className="mb-2">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className={`form-control ${errores.password ? 'is-invalid' : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="invalid-feedback">{errores.password}</div>
        </div>

        <button type="button" className="btn btn-link p-0 mb-3" onClick={() => setMostrarModal(true)}>
          ¿Olvidaste tu contraseña?
        </button>

        <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
          {cargando ? (
            <><span className="spinner-border spinner-border-sm me-2" />Entrando...</>
          ) : 'Entrar'}
        </button>
      </form>

      <p className="mt-3 text-center">
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>

      <div className="alert alert-secondary small">
        Cuentas de prueba (contraseña <code>Demo1234</code>): angel@netscope.mx, abraham@netscope.mx
      </div>

      {mostrarModal && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Recuperar acceso</h5>
                  <button className="btn-close" onClick={() => setMostrarModal(false)} />
                </div>
                <div className="modal-body">
                  Por ahora no se envían correos de recuperación. Pide a un administrador
                  que restablezca tu cuenta.
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={() => setMostrarModal(false)}>Entendido</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </>
      )}
    </div>
  );
}
