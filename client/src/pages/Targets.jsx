// Pantalla 8a: Targets (objetivos que el usuario puede escanear).
// CRUD: GET/POST /api/targets, PATCH/DELETE /api/targets/:id
// Búsqueda por alias/host/notas, filtro por etiqueta, orden y paginado (lo hace el backend).
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api, query } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Paginacion from '../components/Paginacion';
import { fecha, textoAEtiquetas } from '../utils/formato';

const VACIO = { id: null, alias: '', host: '', tags: '', notes: '' };

export default function Targets() {
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();

  const [filtros, setFiltros] = useState({ q: '', tag: '', sort: 'alias', page: 1 });
  const [resultado, setResultado] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState(null);       // null = modal cerrado
  const [errores, setErrores] = useState({});
  const [borrando, setBorrando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Cada vez que cambian los filtros se vuelve a pedir la lista al servidor
  useEffect(() => {
    if (usuario) cargar();
  }, [filtros]);

  // Búsqueda: esperamos 400 ms después de la última tecla para no llamar al servidor en cada letra
  const [busqueda, setBusqueda] = useState('');
  useEffect(() => {
    const espera = setTimeout(() => {
      if (busqueda !== filtros.q) setFiltros({ ...filtros, q: busqueda, page: 1 });
    }, 400);
    return () => clearTimeout(espera);
  }, [busqueda]);

  async function cargar() {
    setCargando(true);
    try {
      setResultado(await api('/targets' + query(filtros)));
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  if (!usuario) return <Navigate to="/login" replace />;

  // Al cambiar un filtro regresamos a la página 1
  const cambiarFiltro = (campo, valor) => setFiltros({ ...filtros, [campo]: valor, page: 1 });

  function validar() {
    const e = {};
    if (!form.alias.trim()) e.alias = 'El alias es obligatorio';
    if (!/^[a-zA-Z0-9.-]+$/.test(form.host.trim())) e.host = 'Escribe una IP o un hostname válido';
    if (textoAEtiquetas(form.tags).length > 10) e.tags = 'Máximo 10 etiquetas';
    if (form.notes.length > 500) e.notes = 'Máximo 500 caracteres';
    return e;
  }

  async function guardar() {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    const datos = { alias: form.alias, host: form.host.trim(), tags: textoAEtiquetas(form.tags), notes: form.notes };
    setGuardando(true);
    try {
      if (form.id) {
        await api(`/targets/${form.id}`, { method: 'PATCH', body: datos });
        mostrarMensaje('exito', 'Target actualizado');
      } else {
        await api('/targets', { method: 'POST', body: datos });
        mostrarMensaje('exito', 'Target creado');
      }
      setForm(null);
      cargar(); // refresca la tabla sin recargar la página
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarBorrado() {
    setGuardando(true);
    try {
      await api(`/targets/${borrando.id}`, { method: 'DELETE' });
      mostrarMensaje('exito', 'Target eliminado');
      setBorrando(null);
      cargar();
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Targets</h2>
        <button className="btn btn-primary" onClick={() => { setErrores({}); setForm({ ...VACIO }); }}>
          Nuevo target
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input className="form-control" placeholder="Buscar por alias, host o notas"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Filtrar por etiqueta"
            value={filtros.tag} onChange={(e) => cambiarFiltro('tag', e.target.value.trim())} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filtros.sort} onChange={(e) => cambiarFiltro('sort', e.target.value)}>
            <option value="alias">Alias A-Z</option>
            <option value="recent">Más recientes</option>
          </select>
        </div>
      </div>

      <div className="card">
        {cargando ? <Loader /> : (
          <table className="table mb-0 align-middle">
            <thead>
              <tr><th>Alias</th><th>Host</th><th>Etiquetas</th><th>Creado</th><th></th></tr>
            </thead>
            <tbody>
              {resultado.items.map((t) => (
                <tr key={t.id}>
                  <td>{t.alias}<div className="small text-muted">{t.notes}</div></td>
                  <td>{t.host}</td>
                  <td>{t.tags.map((tag) => <span key={tag} className="badge bg-light text-dark me-1">#{tag}</span>)}</td>
                  <td>{fecha(t.createdAt)}</td>
                  <td className="text-end text-nowrap">
                    <Link className="btn btn-sm btn-outline-primary me-1" to={`/escaneos/nuevo?target=${t.id}`}>Escanear</Link>
                    <button className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => { setErrores({}); setForm({ ...t, tags: t.tags.join(', ') }); }}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setBorrando(t)}>Borrar</button>
                  </td>
                </tr>
              ))}
              {resultado.items.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted py-4">No hay targets. Crea el primero.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Paginacion {...resultado} onCambiar={(p) => setFiltros({ ...filtros, page: p })} />

      {/* Modal: crear / editar */}
      {form && (
        <Modal
          titulo={form.id ? 'Editar target' : 'Nuevo target'}
          onCerrar={() => setForm(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setForm(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Alias</label>
            <input className={`form-control ${errores.alias ? 'is-invalid' : ''}`} value={form.alias}
              onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="Ej. Mi máquina" />
            <div className="invalid-feedback">{errores.alias}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Host (IP o hostname)</label>
            <input className={`form-control ${errores.host ? 'is-invalid' : ''}`} value={form.host}
              onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="scanme.nmap.org" />
            <div className="invalid-feedback">{errores.host}</div>
          </div>
          <div className="mb-3">
            <label className="form-label">Etiquetas (separadas por coma)</label>
            <input className={`form-control ${errores.tags ? 'is-invalid' : ''}`} value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="lab, web" />
            <div className="invalid-feedback">{errores.tags}</div>
          </div>
          <div>
            <label className="form-label">Notas</label>
            <textarea className={`form-control ${errores.notes ? 'is-invalid' : ''}`} rows="3" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="invalid-feedback">{errores.notes}</div>
          </div>
        </Modal>
      )}

      {/* Modal: borrar */}
      {borrando && (
        <Modal
          titulo="Borrar target"
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
          ¿Seguro que quieres borrar <strong>{borrando.alias}</strong> ({borrando.host})?
        </Modal>
      )}
    </div>
  );
}
