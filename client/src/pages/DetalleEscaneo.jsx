// Pantalla 7: Detalle de escaneo (/escaneos/:id).
// Datos del escaneo, comando, tabla de puertos con filtros (solo interfaz)
// y modal con la información de un puerto.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from '../components/Modal';
import { ESCANEOS, PUERTOS, COLOR_ESTADO } from '../data/escaneos';

export default function DetalleEscaneo() {
  const { id } = useParams(); // el id viene de la URL
  const escaneo = ESCANEOS.find((e) => e.id === Number(id)) ?? ESCANEOS[0];
  const [puerto, setPuerto] = useState(null); // puerto seleccionado para el modal

  return (
    <div>
      <Link to="/escaneos">← Volver al historial</Link>

      <div className="d-flex justify-content-between align-items-center my-3">
        <div>
          <h2 className="mb-0">
            {escaneo.name}{' '}
            <span className={`badge bg-${COLOR_ESTADO[escaneo.status]} fs-6`}>{escaneo.status}</span>
          </h2>
          <span className="text-muted">{escaneo.host}</span>
        </div>
        <button className="btn btn-outline-primary">Exportar JSON</button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <pre className="bg-dark text-white p-3 rounded h-100 mb-0">{escaneo.comando}</pre>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-body small">
              <p className="mb-1"><strong>Fecha:</strong> {escaneo.fecha}</p>
              <p className="mb-1"><strong>Duración:</strong> {escaneo.duracion}</p>
              <p className="mb-1"><strong>Perfil:</strong> {escaneo.perfil}</p>
              <p className="mb-0"><strong>Notas:</strong> {escaneo.notes || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de puertos */}
      <div className="row g-3 mb-3">
        <div className="col-4"><div className="card text-center"><div className="card-body"><h3 className="text-success">4</h3><small>Abiertos</small></div></div></div>
        <div className="col-4"><div className="card text-center"><div className="card-body"><h3>2</h3><small>Cerrados</small></div></div></div>
        <div className="col-4"><div className="card text-center"><div className="card-body"><h3 className="text-warning">1</h3><small>Filtrados</small></div></div></div>
      </div>

      {/* Filtros de puertos (solo interfaz) */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input className="form-control" placeholder="Buscar puerto o servicio" />
        </div>
        <div className="col-md-3">
          <select className="form-select">
            <option>Todos los estados</option>
            <option>open</option>
            <option>closed</option>
            <option>filtered</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select">
            <option>Todos los protocolos</option>
            <option>tcp</option>
            <option>udp</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table className="table table-hover mb-0">
          <thead>
            <tr><th>Puerto</th><th>Estado</th><th>Servicio</th><th>Producto / versión</th></tr>
          </thead>
          <tbody>
            {PUERTOS.map((p) => (
              <tr key={p.port} style={{ cursor: 'pointer' }} onClick={() => setPuerto(p)}>
                <td>{p.port}/{p.protocol}</td>
                <td><span className={`badge bg-${COLOR_ESTADO[p.state]}`}>{p.state}</span></td>
                <td>{p.service}</td>
                <td>{p.product} {p.version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <small className="text-muted">Haz clic en un puerto para ver su detalle.</small>

      {puerto && (
        <Modal titulo={`Puerto ${puerto.port}/${puerto.protocol}`} onCerrar={() => setPuerto(null)}>
          <p><strong>Estado:</strong> {puerto.state}</p>
          <p><strong>Servicio:</strong> {puerto.service}</p>
          <p><strong>Producto:</strong> {puerto.product || '—'}</p>
          <p><strong>Versión:</strong> {puerto.version || '—'}</p>
          <p className="mb-0"><strong>Info extra:</strong> {puerto.extrainfo || '—'}</p>
        </Modal>
      )}
    </div>
  );
}
