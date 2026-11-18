// Pantalla 9: Perfil del usuario.
// Muestra los datos del usuario en sesión.
// Modal de edición de perfil; modal de eliminar cuenta (requiere contraseña).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarEliminar, setMostrarEliminar] = useState(false);

  // Campos del formulario de edición
  const [nombre, setNombre] = useState(usuario?.name ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');

  // Campo de confirmación para eliminar cuenta
  const [passConfirm, setPassConfirm] = useState('');
  const [errorEliminar, setErrorEliminar] = useState('');

  if (!usuario) {
    navigate('/login', { replace: true });
    return null;
  }

  function guardarEdicion() {
    // En la entrega final se llamaría al servidor; aquí solo cerramos el modal.
    setMostrarEditar(false);
  }

  function confirmarEliminar() {
    if (passConfirm !== usuario.password) {
      setErrorEliminar('Contraseña incorrecta.');
      return;
    }
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Mi perfil</h2>
          <button className="btn btn-outline-primary" onClick={() => setMostrarEditar(true)}>
            Editar perfil
          </button>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-sm-4">Nombre</dt>
              <dd className="col-sm-8">{usuario.name}</dd>
              <dt className="col-sm-4">Correo</dt>
              <dd className="col-sm-8">{usuario.email}</dd>
              <dt className="col-sm-4">Rol</dt>
              <dd className="col-sm-8 text-capitalize">{usuario.role}</dd>
            </dl>
          </div>
        </div>

        <div className="card border-danger">
          <div className="card-body">
            <h6 className="text-danger">Zona peligrosa</h6>
            <p className="mb-2 small text-muted">
              Eliminar tu cuenta es una acción irreversible. Todos tus datos serán borrados.
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
      {mostrarEditar && (
        <Modal
          titulo="Editar perfil"
          onCerrar={() => setMostrarEditar(false)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setMostrarEditar(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion}>Guardar</button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label className="form-label">Nueva contraseña <span className="text-muted">(dejar vacío para no cambiar)</span></label>
            <input type="password" className="form-control" />
          </div>
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
              <button className="btn btn-danger" onClick={confirmarEliminar}>Eliminar cuenta</button>
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
