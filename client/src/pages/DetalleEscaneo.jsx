// Pantalla 7: Detalle de escaneo (/escaneos/:id).
// GET /api/scans/:id. Si sigue en curso, se vuelve a pedir cada 3 segundos.
// Los puertos se leen del XML de Nmap y se filtran aquí mismo (búsqueda, estado, protocolo).
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { ESTADOS, fecha, duracion } from '../utils/formato';
import { leerPuertos } from '../utils/nmapXml';

export default function DetalleEscaneo() {
  const { id } = useParams(); // el id viene de la URL
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();

  const [escaneo, setEscaneo] = useState(null);
  const [error, setError] = useState('');
  const [puerto, setPuerto] = useState(null); // puerto seleccionado para el modal

  // Filtros de la tabla de puertos (no necesitan servidor: los datos ya están aquí)
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [protocolo, setProtocolo] = useState('');

  useEffect(() => {
    if (!usuario) return;
    api(`/scans/${id}`).then(setEscaneo).catch((err) => setError(err.message));
  }, [id]);

  // Si el escaneo sigue en curso, preguntamos de nuevo cada 3 segundos
  useEffect(() => {
    if (escaneo?.status !== 'running') return;
    const intervalo = setInterval(() => {
      api(`/scans/${id}`).then(setEscaneo).catch(() => {});
    }, 3000);
    return () => clearInterval(intervalo);
  }, [escaneo?.status]);

  if (!usuario) return <Navigate to="/login" replace />;
  if (error) return <div className="alert alert-danger">{error} <Link to="/escaneos">Volver al historial</Link></div>;
  if (!escaneo) return <Loader texto="Cargando escaneo..." />;

  const puertos = leerPuertos(escaneo.result?.raw);
  const contar = (s) => puertos.filter((p) => p.state === s).length;

  const filtrados = puertos.filter((p) =>
    (!busqueda || String(p.port).includes(busqueda) || p.service.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!estado || p.state === estado) &&
    (!protocolo || p.protocol === protocolo)
  );

  // Descarga el escaneo completo como archivo .json (se genera en el navegador)
  function exportarJSON() {
    const datos = { ...escaneo, puertos };
    const archivo = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = `escaneo-${escaneo.id}.json`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
    mostrarMensaje('exito', 'JSON exportado');
  }

  async function cancelar() {
    try {
      const respuesta = await api(`/scans/${id}/cancel`, { method: 'POST' });
      setEscaneo(respuesta.scan);
      mostrarMensaje('exito', 'Escaneo cancelado');
    } catch (err) {
      mostrarMensaje('error', err.message);
    }
  }

  return (
    <div>
      <Link to="/escaneos">← Volver al historial</Link>

      <div className="d-flex justify-content-between align-items-center my-3">
        <div>
          <h2 className="mb-0">
            {escaneo.name}{' '}
            <span className={`badge bg-${ESTADOS[escaneo.status].color} fs-6`}>{ESTADOS[escaneo.status].texto}</span>
          </h2>
          <span className="text-muted">{escaneo.hostSnapshot}</span>
        </div>
        <div className="d-flex gap-2">
          {escaneo.status === 'running' && <button className="btn btn-outline-danger" onClick={cancelar}>Cancelar</button>}
          <button className="btn btn-outline-primary" onClick={exportarJSON}>Exportar JSON</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <pre className="bg-dark text-white p-3 rounded h-100 mb-0">{escaneo.commandPreview}</pre>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-body small">
              <p className="mb-1"><strong>Inicio:</strong> {fecha(escaneo.startedAt)}</p>
              <p className="mb-1"><strong>Fin:</strong> {fecha(escaneo.finishedAt)}</p>
              <p className="mb-1"><strong>Duración:</strong> {duracion(escaneo.durationMs)}</p>
              <p className="mb-0"><strong>Notas:</strong> {escaneo.notes || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {escaneo.status === 'running' && <Loader texto="El escaneo sigue en curso; esta pantalla se actualiza sola." />}
      {escaneo.status === 'failed' && (
        <div className="alert alert-danger"><strong>El escaneo falló:</strong> {escaneo.result?.error}</div>
      )}
      {escaneo.status === 'cancelled' && <div className="alert alert-secondary">El escaneo fue cancelado; no hay resultados.</div>}

      {escaneo.status === 'completed' && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-4"><div className="card text-center"><div className="card-body"><h3 className="text-success">{contar('open')}</h3><small>Abiertos</small></div></div></div>
            <div className="col-4"><div className="card text-center"><div className="card-body"><h3>{contar('closed')}</h3><small>Cerrados</small></div></div></div>
            <div className="col-4"><div className="card text-center"><div className="card-body"><h3 className="text-warning">{contar('filtered')}</h3><small>Filtrados</small></div></div></div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <input className="form-control" placeholder="Buscar puerto o servicio" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="open">open</option>
                <option value="closed">closed</option>
                <option value="filtered">filtered</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={protocolo} onChange={(e) => setProtocolo(e.target.value)}>
                <option value="">Todos los protocolos</option>
                <option value="tcp">tcp</option>
                <option value="udp">udp</option>
              </select>
            </div>
          </div>

          <div className="card">
            <table className="table table-hover mb-0">
              <thead>
                <tr><th>Puerto</th><th>Estado</th><th>Servicio</th><th>Producto / versión</th></tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={`${p.port}/${p.protocol}`} style={{ cursor: 'pointer' }} onClick={() => setPuerto(p)}>
                    <td>{p.port}/{p.protocol}</td>
                    <td>{p.state}</td>
                    <td>{p.service}</td>
                    <td>{p.product} {p.version}</td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted py-4">Sin puertos con esos filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <small className="text-muted">Haz clic en un puerto para ver su detalle.</small>
        </>
      )}

      {puerto && (
        <Modal titulo={`Puerto ${puerto.port}/${puerto.protocol}`} onCerrar={() => setPuerto(null)}>
          <p><strong>Estado:</strong> {puerto.state}</p>
          <p><strong>Servicio:</strong> {puerto.service || '—'}</p>
          <p><strong>Producto:</strong> {puerto.product || '—'}</p>
          <p><strong>Versión:</strong> {puerto.version || '—'}</p>
          <p className="mb-0"><strong>Info extra:</strong> {puerto.extrainfo || '—'}</p>
        </Modal>
      )}
    </div>
  );
}
