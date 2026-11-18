// Pantalla 11: Administración de usuarios. Solo accesible para administradores.
// Tabla con todos los usuarios; modal de crear/editar usuario; modal de borrado.
// La lista de usuarios viene del AuthContext y se persiste en localStorage.
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const USUARIO_VACIO = { id: null, name: '', email: '', password: '', role: 'user' };

export default function AdminUsuarios() {
  const { usuario, usuarios, setUsuarios } = useAuth();
  const [editando, setEditando] = useState(null);  // null = modal cerrado
  const [borrando, setBorrando] = useState(null);  // null = modal cerrado
  const [errores, setErrores] = useState({});

  // Solo admins pueden ver esta pantalla
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== 'admin') return <Navigate to="/dashboard" replace />;

  /* ── validación del formulario ── */
  function validar(form) {
    const e = {};
    if (!form.name.trim())    e.name     = 'El nombre es obligatorio.';
    if (!form.email.trim())   e.email    = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido.';
    if (!form.id && !form.password) e.password = 'La contraseña es obligatoria al crear un usuario.';
    return e;
  }

  /* ── abrir modal en modo "crear" ── */
  function abrirCrear() {
    setErrores({});
    setEditando({ ...USUARIO_VACIO });
  }

  /* ── abrir modal en modo "editar" ── */
  function abrirEditar(u) {
    setErrores({});
    setEditando({ ...u, password: '' }); // no se muestra la contraseña guardada
  }

  /* ── guardar (crear o editar) ── */
  function guardar() {
    const e = validar(editando);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    if (editando.id) {
      // Editar existente
      setUsuarios(usuarios.map((u) =>
        u.id === editando.id
          ? { ...u, name: editando.name, email: editando.email, role: editando.role, ...(editando.password ? { password: editando.password } : {}) }
          : u
      ));
    } else {
      // Crear nuevo
      setUsuarios([...usuarios, { ...editando, id: Date.now() }]);
    }
    setEditando(null);
  }

  /* ── confirmar borrado ── */
  function confirmarBorrado() {
    setUsuarios(usuarios.filter((u) => u.id !== borrando.id));
    setBorrando(null);
  }

  /* ── helper: cambio de campo en el formulario ── */
  function cambiar(campo, valor) {
    setEditando((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de usuarios</h2>
        <button className="btn btn-primary" onClick={abrirCrear}>Crear usuario</button>
      </div>

      <div className="card">
        <table className="table mb-0 align-middle">
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'bg-dark' : 'bg-secondary'}`}>{u.role}</span></td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => abrirEditar(u)}>Editar</button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={u.id === usuario.id}
                    title={u.id === usuario.id ? 'No puedes eliminarte a ti mismo' : ''}
                    onClick={() => setBorrando(u)}
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: crear / editar usuario */}
      {editando && (
        <Modal
          titulo={editando.id ? `Editar usuario — ${editando.name}` : 'Crear usuario'}
          onCerrar={() => setEditando(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>
                {editando.id ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              className={`form-control ${errores.name ? 'is-invalid' : ''}`}
              value={editando.name}
              onChange={(e) => cambiar('name', e.target.value)}
            />
            <div className="invalid-feedback">{errores.name}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className={`form-control ${errores.email ? 'is-invalid' : ''}`}
              value={editando.email}
              onChange={(e) => cambiar('email', e.target.value)}
            />
            <div className="invalid-feedback">{errores.email}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">
              Contraseña{editando.id && <span className="text-muted"> (dejar vacío para no cambiar)</span>}
            </label>
            <input
              type="password"
              className={`form-control ${errores.password ? 'is-invalid' : ''}`}
              value={editando.password}
              onChange={(e) => cambiar('password', e.target.value)}
            />
            <div className="invalid-feedback">{errores.password}</div>
          </div>
          <div className="mb-1">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={editando.role}
              onChange={(e) => cambiar('role', e.target.value)}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        </Modal>
      )}

      {/* Modal: confirmación de borrado */}
      {borrando && (
        <Modal
          titulo="Borrar usuario"
          onCerrar={() => setBorrando(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setBorrando(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmarBorrado}>Borrar</button>
            </>
          }
        >
          ¿Seguro que quieres eliminar a <strong>{borrando.name}</strong>? Esta acción no se puede deshacer.
        </Modal>
      )}
    </div>
  );
}
