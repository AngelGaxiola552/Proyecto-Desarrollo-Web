// Pantalla 10: Actividad (bitácora de solo lectura).
// GET /api/activity con filtros (tipo de acción, usuario para admin, fechas) y paginado.
// El usuario normal ve sus eventos; el admin ve los de todos. Modal de detalle de evento.
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api, query } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Paginacion from '../components/Paginacion';
import { fecha } from '../utils/formato';

// Nombre legible para cada acción que registra el backend
const ACCIONES = {
  'user.register': 'Registro',
  'user.login': 'Inicio de sesión',
  'user.logout': 'Cierre de sesión',
  'user.update': 'Perfil actualizado',
  'user.deleted': 'Cuenta eliminada',
  'admin.user.create': 'Admin creó usuario',
  'admin.user.update': 'Admin editó usuario',
  'admin.user.delete': 'Admin borró usuario',
  'target.create': 'Target creado',
  'target.update': 'Target editado',
  'target.delete': 'Target borrado',
  'profile.create': 'Perfil creado',
  'profile.update': 'Perfil editado',
  'profile.delete': 'Perfil borrado',
  'scan.start': 'Escaneo iniciado',
  'scan.completed': 'Escaneo completado',
  'scan.failed': 'Escaneo fallido',
  'scan.cancel': 'Escaneo cancelado',
  'scan.timeout': 'Escaneo excedió el tiempo',
  'scan.update': 'Escaneo editado',
  'scan.delete': 'Escaneo borrado',
};

// Color del badge según el tipo de entidad
function colorAccion(accion) {
  if (accion.startsWith('scan')) return 'info';
  if (accion.startsWith('target')) return 'success';
  if (accion.startsWith('profile')) return 'warning';
  if (accion.startsWith('admin')) return 'dark';
  return 'primary';
}

export default function Actividad() {
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();
  const esAdmin = usuario?.role === 'admin';

  const [filtros, setFiltros] = useState({ action: '', userId: '', from: '', to: '', page: 1 });
  const [resultado, setResultado] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [usuarios, setUsuarios] = useState([]); // solo para el admin: mostrar nombres en vez de ids
  const [cargando, setCargando] = useState(true);
  const [detalleEvento, setDetalleEvento] = useState(null);

  useEffect(() => {
    if (esAdmin) api('/users?limit=50').then((d) => setUsuarios(d.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!usuario) return;
    setCargando(true);
    const conHoras = {
      ...filtros,
      from: filtros.from && filtros.from + 'T00:00:00',
      to: filtros.to && filtros.to + 'T23:59:59',
    };
    api('/activity' + query(conHoras))
      .then(setResultado)
      .catch((err) => mostrarMensaje('error', err.message))
      .finally(() => setCargando(false));
  }, [filtros]);

  if (!usuario) return <Navigate to="/login" replace />;

  const cambiarFiltro = (campo, valor) => setFiltros({ ...filtros, [campo]: valor, page: 1 });
  const nombreUsuario = (id) => usuarios.find((u) => u.id === id)?.name || (id === usuario.id ? usuario.name : id);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Actividad</h2>
        {esAdmin && <span className="badge bg-dark">Vista administrador — todos los usuarios</span>}
      </div>

      {/* Filtros */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <select className="form-select" value={filtros.action} onChange={(e) => cambiarFiltro('action', e.target.value)}>
            <option value="">Todas las acciones</option>
            <option value="user">Sesión y cuenta</option>
            <option value="scan">Escaneos</option>
            <option value="target">Targets</option>
            <option value="profile">Perfiles</option>
            {esAdmin && <option value="admin">Administración</option>}
          </select>
        </div>
        {esAdmin && (
          <div className="col-md-3">
            <select className="form-select" value={filtros.userId} onChange={(e) => cambiarFiltro('userId', e.target.value)}>
              <option value="">Todos los usuarios</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text">Desde</span>
            <input type="date" className="form-control" value={filtros.from} onChange={(e) => cambiarFiltro('from', e.target.value)} />
          </div>
        </div>
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text">Hasta</span>
            <input type="date" className="form-control" value={filtros.to} onChange={(e) => cambiarFiltro('to', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        {cargando ? <Loader /> : (
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Entidad</th>
                {esAdmin && <th>Usuario</th>}
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resultado.items.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted py-4">Sin eventos registrados.</td></tr>
              )}
              {resultado.items.map((ev) => (
                <tr key={ev.id}>
                  <td><span className={`badge bg-${colorAccion(ev.action)}`}>{ACCIONES[ev.action] || ev.action}</span></td>
                  <td>{ev.entity}</td>
                  {esAdmin && <td>{nombreUsuario(ev.userId)}</td>}
                  <td className="text-nowrap">{fecha(ev.timestamp)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setDetalleEvento(ev)}>
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Paginacion {...resultado} onCambiar={(p) => setFiltros({ ...filtros, page: p })} />

      {/* Modal: detalle de evento */}
      {detalleEvento && (
        <Modal titulo={ACCIONES[detalleEvento.action] || detalleEvento.action} onCerrar={() => setDetalleEvento(null)}>
          <dl className="row mb-0">
            <dt className="col-sm-4">Acción</dt>
            <dd className="col-sm-8"><code>{detalleEvento.action}</code></dd>
            <dt className="col-sm-4">Entidad</dt>
            <dd className="col-sm-8">{detalleEvento.entity} / {detalleEvento.entityId}</dd>
            <dt className="col-sm-4">Usuario</dt>
            <dd className="col-sm-8">{nombreUsuario(detalleEvento.userId)}</dd>
            <dt className="col-sm-4">Fecha</dt>
            <dd className="col-sm-8">{fecha(detalleEvento.timestamp)}</dd>
            <dt className="col-sm-4">IP origen</dt>
            <dd className="col-sm-8"><code>{detalleEvento.ip || '—'}</code></dd>
            {Object.keys(detalleEvento.meta || {}).length > 0 && (
              <>
                <dt className="col-sm-4">Metadatos</dt>
                <dd className="col-sm-8">
                  <pre className="mb-0 small">{JSON.stringify(detalleEvento.meta, null, 2)}</pre>
                </dd>
              </>
            )}
          </dl>
        </Modal>
      )}
    </div>
  );
}
