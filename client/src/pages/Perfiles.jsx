// Pantalla 8b: Perfiles de escaneo (combinaciones de opciones de Nmap reutilizables).
// CRUD: GET/POST /api/profiles, PATCH/DELETE /api/profiles/:id
// Búsqueda por nombre, orden y paginado (lo hace el backend).
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api, query } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Paginacion from '../components/Paginacion';
import OpcionesNmap, { OPCIONES_INICIALES, opcionesParaApi, opcionesDeApi, errorPuertos } from '../components/OpcionesNmap';
import { fecha } from '../utils/formato';

// Resumen corto de las opciones para mostrar en la tabla
function resumen(o) {
  return [
    o.scanType,
    o.ports ? `-p ${o.ports}` : `top ${o.topPorts}`,
    `-T${o.timing}`,
    o.serviceVersion && '-sV',
    o.osDetection && '-O',
    o.noPing && '-Pn',
    o.scripts !== 'none' && `--script=${o.scripts}`,
  ].filter(Boolean).join(' ');
}

export default function Perfiles() {
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();

  const [filtros, setFiltros] = useState({ q: '', sort: 'name', page: 1 });
  const [resultado, setResultado] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState(null); // { id, name, opciones }
  const [errorNombre, setErrorNombre] = useState('');
  const [borrando, setBorrando] = useState(null);
  const [guardando, setGuardando] = useState(false);

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
      setResultado(await api('/profiles' + query(filtros)));
    } catch (err) {
      mostrarMensaje('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  if (!usuario) return <Navigate to="/login" replace />;

  const cambiarFiltro = (campo, valor) => setFiltros({ ...filtros, [campo]: valor, page: 1 });

  async function guardar() {
    const errNombre = form.name.trim() ? '' : 'El nombre es obligatorio';
    setErrorNombre(errNombre);
    if (errNombre || errorPuertos(form.opciones)) return;

    const datos = { name: form.name, options: opcionesParaApi(form.opciones) };
    setGuardando(true);
    try {
      if (form.id) {
        await api(`/profiles/${form.id}`, { method: 'PATCH', body: datos });
        mostrarMensaje('exito', 'Perfil actualizado');
      } else {
        await api('/profiles', { method: 'POST', body: datos });
        mostrarMensaje('exito', 'Perfil creado');
      }
      setForm(null);
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
      await api(`/profiles/${borrando.id}`, { method: 'DELETE' });
      mostrarMensaje('exito', 'Perfil eliminado');
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
        <h2>Perfiles de escaneo</h2>
        <button className="btn btn-primary"
          onClick={() => { setErrorNombre(''); setForm({ id: null, name: '', opciones: { ...OPCIONES_INICIALES } }); }}>
          Nuevo perfil
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-8">
          <input className="form-control" placeholder="Buscar por nombre"
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filtros.sort} onChange={(e) => cambiarFiltro('sort', e.target.value)}>
            <option value="name">Nombre A-Z</option>
            <option value="recent">Más recientes</option>
          </select>
        </div>
      </div>

      <div className="card">
        {cargando ? <Loader /> : (
          <table className="table mb-0 align-middle">
            <thead>
              <tr><th>Nombre</th><th>Opciones</th><th>Creado</th><th></th></tr>
            </thead>
            <tbody>
              {resultado.items.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><code>{resumen(p.options)}</code></td>
                  <td>{fecha(p.createdAt)}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => { setErrorNombre(''); setForm({ id: p.id, name: p.name, opciones: opcionesDeApi(p.options) }); }}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setBorrando(p)}>Borrar</button>
                  </td>
                </tr>
              ))}
              {resultado.items.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted py-4">No hay perfiles. Crea el primero.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Paginacion {...resultado} onCambiar={(p) => setFiltros({ ...filtros, page: p })} />

      {/* Modal: crear / editar */}
      {form && (
        <Modal
          titulo={form.id ? 'Editar perfil' : 'Nuevo perfil'}
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
            <label className="form-label">Nombre del perfil</label>
            <input className={`form-control ${errorNombre ? 'is-invalid' : ''}`} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="invalid-feedback">{errorNombre}</div>
          </div>
          <OpcionesNmap opciones={form.opciones} onChange={(o) => setForm({ ...form, opciones: o })} />
        </Modal>
      )}

      {/* Modal: borrar */}
      {borrando && (
        <Modal
          titulo="Borrar perfil"
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
          ¿Seguro que quieres borrar el perfil <strong>{borrando.name}</strong>?
        </Modal>
      )}
    </div>
  );
}
