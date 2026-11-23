// Pantalla 4: Dashboard.
// Conteos con GET /api/stats, últimos escaneos con GET /api/scans
// y modal de "detalle rápido" del último escaneo.
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { ESTADOS, fecha, duracion } from '../utils/formato';
import { leerPuertos } from '../utils/nmapXml';

export default function Dashboard() {
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();
  const [stats, setStats] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    // Pedimos las dos cosas al mismo tiempo y esperamos a que terminen ambas
    Promise.all([api('/stats'), api('/scans?limit=5')])
      .then(([datosStats, datosEscaneos]) => {
        setStats(datosStats);
        setRecientes(datosEscaneos.items);
      })
      .catch((err) => mostrarMensaje('error', err.message))
      .finally(() => setCargando(false));
  }, []);

  // Si no hay sesión, se regresa al login
  if (!usuario) return <Navigate to="/login" replace />;
  if (cargando) return <Loader texto="Cargando tu panel..." />;

  const ultimo = recientes[0];
  const abiertos = leerPuertos(ultimo?.result?.raw).filter((p) => p.state === 'open');

  const tarjetas = [
    ['Escaneos', stats?.totalScans],
    ['En curso', stats?.runningScans],
    ['Completados', stats?.completedScans],
    ['Fallidos', stats?.failedScans],
    ['Targets', stats?.totalTargets],
    ['Perfiles', stats?.totalProfiles],
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hola, {usuario.name}</h2>
        <Link className="btn btn-primary" to="/escaneos/nuevo">Nuevo escaneo</Link>
      </div>

      <div className="row g-3 mb-4">
        {tarjetas.map(([titulo, valor]) => (
          <div className="col-6 col-md-2" key={titulo}>
            <div className="card text-center"><div className="card-body">
              <h3>{valor ?? 0}</h3><small>{titulo}</small>
            </div></div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <strong>Escaneos recientes</strong>
              <Link to="/escaneos">Ver historial</Link>
            </div>
            <table className="table mb-0">
              <thead>
                <tr><th>Nombre</th><th>Host</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {recientes.map((e) => (
                  <tr key={e.id}>
                    <td><Link to={`/escaneos/${e.id}`}>{e.name}</Link></td>
                    <td>{e.hostSnapshot}</td>
                    <td><span className={`badge bg-${ESTADOS[e.status].color}`}>{ESTADOS[e.status].texto}</span></td>
                    <td>{fecha(e.startedAt)}</td>
                  </tr>
                ))}
                {recientes.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted py-4">Aún no tienes escaneos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-lg-4">
          {ultimo && (
            <div className="card">
              <div className="card-body">
                <small className="text-muted">Último escaneo</small>
                <h5>{ultimo.name}</h5>
                <p className="mb-1">{ultimo.hostSnapshot}</p>
                <p><strong>{abiertos.length}</strong> puertos abiertos</p>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setMostrarDetalle(true)}>
                  Detalle rápido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {mostrarDetalle && (
        <Modal
          titulo={ultimo.name}
          onCerrar={() => setMostrarDetalle(false)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setMostrarDetalle(false)}>Cerrar</button>
              <Link className="btn btn-primary" to={`/escaneos/${ultimo.id}`}>Ver detalle completo</Link>
            </>
          }
        >
          <p>Host: {ultimo.hostSnapshot} · Estado: {ESTADOS[ultimo.status].texto} · Duración: {duracion(ultimo.durationMs)}</p>
          {abiertos.length === 0 ? (
            <p className="text-muted mb-0">Sin puertos abiertos registrados.</p>
          ) : (
            <table className="table table-sm">
              <thead><tr><th>Puerto</th><th>Servicio</th><th>Versión</th></tr></thead>
              <tbody>
                {abiertos.map((p) => (
                  <tr key={`${p.port}/${p.protocol}`}>
                    <td>{p.port}/{p.protocol}</td>
                    <td>{p.service}</td>
                    <td>{p.product} {p.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
}
