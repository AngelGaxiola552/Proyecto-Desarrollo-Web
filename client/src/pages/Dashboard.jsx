// Pantalla 4: Dashboard.
// Conteos, escaneos recientes y modal de "detalle rápido" del último escaneo.
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { ESCANEOS, PUERTOS, COLOR_ESTADO } from '../data/escaneos';

export default function Dashboard() {
  const { usuario } = useAuth();
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  // Si no hay sesión, se regresa al login
  if (!usuario) return <Navigate to="/login" replace />;

  const ultimo = ESCANEOS[0];
  const abiertos = PUERTOS.filter((p) => p.state === 'open');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hola, {usuario.name}</h2>
        <Link className="btn btn-primary" to="/escaneos/nuevo">Nuevo escaneo</Link>
      </div>

      {/* Conteos (datos de ejemplo) */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><div className="card text-center"><div className="card-body"><h3>5</h3><small>Escaneos</small></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-center"><div className="card-body"><h3>1</h3><small>En curso</small></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-center"><div className="card-body"><h3>3</h3><small>Targets</small></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-center"><div className="card-body"><h3>3</h3><small>Perfiles</small></div></div></div>
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
                {ESCANEOS.map((e) => (
                  <tr key={e.id}>
                    <td><Link to={`/escaneos/${e.id}`}>{e.name}</Link></td>
                    <td>{e.host}</td>
                    <td><span className={`badge bg-${COLOR_ESTADO[e.status]}`}>{e.status}</span></td>
                    <td>{e.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <small className="text-muted">Último escaneo</small>
              <h5>{ultimo.name}</h5>
              <p className="mb-1">{ultimo.host}</p>
              <p><strong>{abiertos.length}</strong> puertos abiertos</p>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setMostrarDetalle(true)}>
                Detalle rápido
              </button>
            </div>
          </div>
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
          <p>Host: {ultimo.host} · Duración: {ultimo.duracion}</p>
          <table className="table table-sm">
            <thead><tr><th>Puerto</th><th>Servicio</th><th>Versión</th></tr></thead>
            <tbody>
              {abiertos.map((p) => (
                <tr key={p.port}>
                  <td>{p.port}/{p.protocol}</td>
                  <td>{p.service}</td>
                  <td>{p.product} {p.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
}
