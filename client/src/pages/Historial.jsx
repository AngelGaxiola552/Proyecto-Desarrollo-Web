// Pantalla 6: Historial de escaneos.
// GET /api/scans con búsqueda, filtros (target, estado, etiqueta, fechas), orden y paginado.
// Editar (PATCH), borrar (DELETE) y cancelar (POST /:id/cancel) desde la tabla.
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api, query } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Paginacion from '../components/Paginacion';
import { ESTADOS, fecha, duracion, textoAEtiquetas } from '../utils/formato';

const FILTROS_INICIALES = { q: '', targetId: '', status: '', tag: '', from: '', to: '', sort: 'recent', page: 1 };

export default function Historial() {
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [resultado, setResultado] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [targets, setTargets] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [editando, setEditando] = useState(null);
  const [errores, setErrores] = useState({});
  const [borrando, setBorrando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Los targets solo se piden una vez (para el filtro)
  useEffect(() => {
    if (usuario) api('/targets?limit=50').then((d) => setTargets(d.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (usuario) cargar();
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
      // "Desde" y "Hasta" incluyen el día completo (de 00:00 a 23:59)
      const conHoras = {
        ...filtros,
        from: filtros.from && filtros.from + 'T00:00:00',
        to: filtros.to && filtros.to + 'T23:59:59',
      };
      setResultado(await api('/scans' + query(conHoras)));
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  if (!usuario) return <Navigate to="/login" replace />;

  const cambiarFiltro = (campo, valor) => setFiltros({ ...filtros, [campo]: valor, page: 1 });

  function limpiarFiltros() {
    setBusqueda('');
    setFiltros(FILTROS_INICIALES);
  }

  async function guardarEdicion() {
    const e = {};
    if (!editando.name.trim()) e.name = 'El nombre es obligatorio';
    if (editando.notes.length > 500) e.notes = 'Máximo 500 caracteres';
    if (textoAEtiquetas(editando.tags).length > 10) e.tags = 'Máximo 10 etiquetas';
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setGuardando(true);
    try {
      await api(`/scans/${editando.id}`, {
        method: 'PATCH',
        body: { name: editando.name, notes: editando.notes, tags: textoAEtiquetas(editando.tags) },
      });
      mostrarMensaje('exito', 'Escaneo actualizado');
      setEditando(null);
      cargar();
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarBorrado() {
    setGuardando(true);
    try {
      await api(`/scans/${borrando.id}`, { method: 'DELETE' });
      mostrarMensaje('exito', 'Escaneo eliminado');
      setBorrando(null);
      cargar();
    } catch (err) {
      mostrarMensaje('error', err.message); // p. ej. no se puede borrar uno en curso
    } finally {
      setGuardando(false);
    }
  }

  async function cancelar(escaneo) {
    try {
      await api(`/scans/${escaneo.id}/cancel`, { method: 'POST' });
      mostrarMensaje('exito', 'Escaneo cancelado');
      cargar();
    } catch (err) {
      mostrarMensaje('error', err.message);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Historial de escaneos</h2>
        <Link className="btn btn-primary" to="/escaneos/nuevo">Nuevo escaneo</Link>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input className="form-control" placeholder="Buscar por nombre, host o nota"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filtros.targetId} onChange={(e) => cambiarFiltro('targetId', e.target.value)}>
            <option value="">Todos los targets</option>
            {targets.map((t) => <option key={t.id} value={t.id}>{t.alias}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filtros.status} onChange={(e) => cambiarFiltro('status', e.target.value)}>
            <option value="">Todos los estados</option>
            {Object.entries(ESTADOS).map(([valor, e]) => <option key={valor} value={valor}>{e.texto}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <input className="form-control" placeholder="Etiqueta"
            value={filtros.tag} onChange={(e) => cambiarFiltro('tag', e.target.value.trim())} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={filtros.sort} onChange={(e) => cambiarFiltro('sort', e.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="duration">Mayor duración</option>
          </select>
        </div>
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
        <div className="col-md-2">
          <button className="btn btn-outline-secondary w-100" onClick={limpiarFiltros}>Limpiar filtros</button>
        </div>
      </div>

      <div className="card">
        {cargando ? <Loader /> : (
          <table className="table mb-0 align-middle">
            <thead>
              <tr><th>Nombre</th><th>Host</th><th>Estado</th><th>Fecha</th><th>Duración</th><th>Etiquetas</th><th></th></tr>
            </thead>
            <tbody>
              {resultado.items.map((e) => (
                <tr key={e.id}>
                  <td><Link to={`/escaneos/${e.id}`}>{e.name}</Link></td>
                  <td>{e.hostSnapshot}</td>
                  <td><span className={`badge bg-${ESTADOS[e.status].color}`}>{ESTADOS[e.status].texto}</span></td>
                  <td>{fecha(e.startedAt)}</td>
                  <td>{duracion(e.durationMs)}</td>
                  <td>{e.tags.map((t) => <span key={t} className="badge bg-light text-dark me-1">#{t}</span>)}</td>
                  <td className="text-end text-nowrap">
                    {e.status === 'running' && (
                      <button className="btn btn-sm btn-outline-warning me-1" onClick={() => cancelar(e)}>Cancelar</button>
                    )}
                    <button className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => { setErrores({}); setEditando({ id: e.id, name: e.name, notes: e.notes, tags: e.tags.join(', ') }); }}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setBorrando(e)}>Borrar</button>
                  </td>
                </tr>
              ))}
              {resultado.items.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted py-4">No hay escaneos con esos criterios.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Paginacion {...resultado} onCambiar={(p) => setFiltros({ ...filtros, page: p })} />

      {editando && (
        <Modal
          titulo="Editar escaneo"
          onCerrar={() => setEditando(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardarEdicion} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          }
        >
          <p className="small text-muted">El resultado del escaneo no se puede modificar; solo nombre, notas y etiquetas.</p>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input className={`form-control ${errores.name ? 'is-invalid' : ''}`} value={editando.name}
              onChange={(e) => setEditando({ ...editando, name: e.target.value })} />
            <div className="invalid-feedback">{errores.name}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Notas</label>
            <textarea className={`form-control ${errores.notes ? 'is-invalid' : ''}`} rows="3" value={editando.notes}
              onChange={(e) => setEditando({ ...editando, notes: e.target.value })} />
            <div className="invalid-feedback">{errores.notes}</div>
          </div>
          <div>
            <label className="form-label">Etiquetas (separadas por coma)</label>
            <input className={`form-control ${errores.tags ? 'is-invalid' : ''}`} value={editando.tags}
              onChange={(e) => setEditando({ ...editando, tags: e.target.value })} />
            <div className="invalid-feedback">{errores.tags}</div>
          </div>
        </Modal>
      )}

      {borrando && (
        <Modal
          titulo="Borrar escaneo"
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
          ¿Seguro que quieres borrar <strong>{borrando.name}</strong>? Esta acción no se puede deshacer.
        </Modal>
      )}
    </div>
  );
}
