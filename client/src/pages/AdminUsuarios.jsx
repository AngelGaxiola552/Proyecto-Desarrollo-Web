// Pantalla 11: Administración de usuarios. Solo accesible para administradores.
// CRUD con GET/POST /api/users y PATCH/DELETE /api/users/:id.
// Búsqueda por nombre/correo, filtro por rol y paginado (lo hace el backend).
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api, query } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Paginacion from '../components/Paginacion';
import { fecha } from '../utils/formato';

const USUARIO_VACIO = { id: null, name: '', email: '', password: '', role: 'user' };

export default function AdminUsuarios() {
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();

  const [filtros, setFiltros] = useState({ q: '', role: '', page: 1 });
  const [busqueda, setBusqueda] = useState('');
  const [resultado, setResultado] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [cargando, setCargando] = useState(true);

  const [editando, setEditando] = useState(null);  // null = modal cerrado
  const [borrando, setBorrando] = useState(null);  // null = modal cerrado
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const esAdmin = usuario?.role === 'admin';

  useEffect(() => {
    if (esAdmin) cargar();
  }, [filtros]);

  // Búsqueda con espera de 400 ms
  useEffect(() => {
    const espera = setTimeout(() => {
      if (busqueda !== filtros.q) setFiltros({ ...filtros, q: busqueda, page: 1 });
    }, 400);
    return () => clearTimeout(espera);
  }, [busqueda]);

  async function cargar() {
    setCargando(true);
    try {
      setResultado(await api('/users' + query(filtros)));
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  // Solo admins pueden ver esta pantalla
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/dashboard" replace />;

  /* ── validación del formulario ── */
  function validar(form) {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'El nombre debe tener al menos 2 caracteres.';
    if (!form.email.trim()) e.email = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido.';
    if (!form.id && !form.password) e.password = 'La contraseña es obligatoria al crear un usuario.';
    else if (form.password && (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/\d/.test(form.password))) {
      e.password = 'Mínimo 8 caracteres, una mayúscula y un número.';
    }
    return e;
  }

  /* ── guardar (crear o editar) ── */
  async function guardar() {
    const e = validar(editando);
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    const datos = { name: editando.name, email: editando.email, role: editando.role };
    if (editando.password) datos.password = editando.password; // al editar, vacío = no cambiar

    setGuardando(true);
    try {
      if (editando.id) {
        await api(`/users/${editando.id}`, { method: 'PATCH', body: datos });
        mostrarMensaje('exito', 'Usuario actualizado');
      } else {
        await api('/users', { method: 'POST', body: datos });
        mostrarMensaje('exito', 'Usuario creado');
      }
      setEditando(null);
      cargar();
    } catch (err) {
      mostrarMensaje('error', err.message); // p. ej. "El correo ya está registrado"
    } finally {
      setGuardando(false);
    }
  }

  /* ── confirmar borrado ── */
  async function confirmarBorrado() {
    setGuardando(true);
    try {
      await api(`/users/${borrando.id}`, { method: 'DELETE' });
      mostrarMensaje('exito', 'Usuario eliminado');
      setBorrando(null);
      cargar();
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setGuardando(false);
    }
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
        <button className="btn btn-primary" onClick={() => { setErrores({}); setEditando({ ...USUARIO_VACIO }); }}>
          Crear usuario
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-8">
          <input className="form-control" placeholder="Buscar por nombre o correo"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filtros.role} onChange={(e) => setFiltros({ ...filtros, role: e.target.value, page: 1 })}>
            <option value="">Todos los roles</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>

      <div className="card">
        {cargando ? <Loader /> : (
          <table className="table mb-0 align-middle">
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Alta</th><th></th></tr>
            </thead>
            <tbody>
              {resultado.items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'bg-dark' : 'bg-secondary'}`}>{u.role}</span></td>
                  <td>{fecha(u.createdAt)}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => { setErrores({}); setEditando({ ...u, password: '' }); }}>
                      Editar
                    </button>
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
              {resultado.items.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted py-4">No hay usuarios con esos criterios.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Paginacion {...resultado} onCambiar={(p) => setFiltros({ ...filtros, page: p })} />

      {/* Modal: crear / editar usuario */}
      {editando && (
        <Modal
          titulo={editando.id ? `Editar usuario — ${editando.name}` : 'Crear usuario'}
          onCerrar={() => setEditando(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : editando.id ? 'Guardar cambios' : 'Crear usuario'}
              </button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input className={`form-control ${errores.name ? 'is-invalid' : ''}`} value={editando.name}
              onChange={(e) => cambiar('name', e.target.value)} />
            <div className="invalid-feedback">{errores.name}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input type="email" className={`form-control ${errores.email ? 'is-invalid' : ''}`} value={editando.email}
              onChange={(e) => cambiar('email', e.target.value)} />
            <div className="invalid-feedback">{errores.email}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">
              Contraseña{editando.id && <span className="text-muted"> (dejar vacío para no cambiar)</span>}
            </label>
            <input type="password" className={`form-control ${errores.password ? 'is-invalid' : ''}`} value={editando.password}
              onChange={(e) => cambiar('password', e.target.value)} />
            <div className="invalid-feedback">{errores.password}</div>
          </div>
          <div className="mb-1">
            <label className="form-label">Rol</label>
            <select className="form-select" value={editando.role} onChange={(e) => cambiar('role', e.target.value)}>
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
              <button className="btn btn-danger" onClick={confirmarBorrado} disabled={guardando}>
                {guardando ? 'Borrando...' : 'Borrar'}
              </button>
            </>
          }
        >
          ¿Seguro que quieres eliminar a <strong>{borrando.name}</strong>? Esta acción no se puede deshacer.
        </Modal>
      )}
    </div>
  );
}
