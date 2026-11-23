// Pantalla 9: Perfil del usuario.
// Carga los datos con GET /api/users/me, los edita con PATCH /api/users/me
// y elimina la cuenta con DELETE /api/users/me (pide contraseña).
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { fecha } from '../utils/formato';

export default function Perfil() {
  const { usuario, setUsuario } = useAuth();
  const { mostrarMensaje } = useMensaje();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(null); // datos completos que vienen del servidor
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState(null); // null = modal de edición cerrado
  const [errores, setErrores] = useState({});

  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [passConfirm, setPassConfirm] = useState('');
  const [errorEliminar, setErrorEliminar] = useState('');

  useEffect(() => {
    if (!usuario) return;
    api('/users/me')
      .then(setDatos)
      .catch((err) => mostrarMensaje('error', err.message))
      .finally(() => setCargando(false));
  }, []);

  if (!usuario) return <Navigate to="/login" replace />;
  if (cargando) return <Loader texto="Cargando perfil..." />;

  function validar() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'El nombre debe tener al menos 2 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido';
    if (form.password) {
      if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
      else if (!/[A-Z]/.test(form.password)) e.password = 'Debe incluir una mayúscula';
      else if (!/\d/.test(form.password)) e.password = 'Debe incluir un número';
    }
    return e;
  }

  async function guardarEdicion() {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    // Solo mandamos la contraseña si se escribió una nueva
    const cambios = { name: form.name, email: form.email };
    if (form.password) cambios.password = form.password;

    setGuardando(true);
    try {
      const actualizado = await api('/users/me', { method: 'PATCH', body: cambios });
      setDatos(actualizado);   // actualiza la tarjeta de esta pantalla
      setUsuario(actualizado); // actualiza el nombre del header sin recargar
      setForm(null);
      mostrarMensaje('exito', 'Perfil actualizado');
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarEliminar() {
    if (!passConfirm) {
      setErrorEliminar('Escribe tu contraseña');
      return;
    }
    setGuardando(true);
    try {
      await api('/users/me', { method: 'DELETE', body: { password: passConfirm } });
      setUsuario(null);
      mostrarMensaje('exito', 'Cuenta eliminada');
      navigate('/', { replace: true });
    } catch (err) {
      setErrorEliminar(err.message); // p. ej. "Contraseña incorrecta"
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Mi perfil</h2>
          <button
            className="btn btn-outline-primary"
            onClick={() => { setErrores({}); setForm({ name: datos.name, email: datos.email, password: '' }); }}
          >
            Editar perfil
          </button>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-sm-4">Nombre</dt>
              <dd className="col-sm-8">{datos?.name}</dd>
              <dt className="col-sm-4">Correo</dt>
              <dd className="col-sm-8">{datos?.email}</dd>
              <dt className="col-sm-4">Rol</dt>
              <dd className="col-sm-8 text-capitalize">{datos?.role}</dd>
              <dt className="col-sm-4">Miembro desde</dt>
              <dd className="col-sm-8">{fecha(datos?.createdAt)}</dd>
            </dl>
          </div>
        </div>

        <div className="card border-danger">
          <div className="card-body">
            <h6 className="text-danger">Zona peligrosa</h6>
            <p className="mb-2 small text-muted">
              Eliminar tu cuenta es una acción irreversible. Se borran tus targets, perfiles y escaneos.
            </p>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => { setPassConfirm(''); setErrorEliminar(''); setMostrarEliminar(true); }}
            >
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Modal: editar perfil */}
      {form && (
        <Modal
          titulo="Editar perfil"
          onCerrar={() => setForm(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setForm(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              className={`form-control ${errores.name ? 'is-invalid' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="invalid-feedback">{errores.name}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className={`form-control ${errores.email ? 'is-invalid' : ''}`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="invalid-feedback">{errores.email}</div>
          </div>
          <div className="mb-1">
            <label className="form-label">Nueva contraseña <span className="text-muted">(dejar vacío para no cambiar)</span></label>
            <input
              type="password"
              className={`form-control ${errores.password ? 'is-invalid' : ''}`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="invalid-feedback">{errores.password}</div>
          </div>
          {guardando && <Loader texto="Guardando..." />}
        </Modal>
      )}

      {/* Modal: eliminar cuenta */}
      {mostrarEliminar && (
        <Modal
          titulo="Eliminar cuenta"
          onCerrar={() => setMostrarEliminar(false)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setMostrarEliminar(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmarEliminar} disabled={guardando}>
                {guardando ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
            </>
          }
        >
          <p>Para confirmar, ingresa tu contraseña actual:</p>
          <input
            type="password"
            className={`form-control ${errorEliminar ? 'is-invalid' : ''}`}
            value={passConfirm}
            onChange={(e) => { setPassConfirm(e.target.value); setErrorEliminar(''); }}
          />
          {errorEliminar && <div className="invalid-feedback d-block">{errorEliminar}</div>}
        </Modal>
      )}
    </div>
  );
}
