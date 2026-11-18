// Pantalla 10: Actividad.
// Registro de eventos del sistema (propios para usuarios; todos para administradores).
// Modal de detalle de evento.
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

// Datos de ejemplo para la interfaz
const EVENTOS = [
  { id: 1, tipo: 'Escaneo iniciado',   descripcion: 'Se inició el escaneo "Escaneo inicial scanme".',     usuario: 'Ángel Gaxiola',    fecha: '03/11/2026 12:00', ip: '192.168.1.100', meta: { escaneoId: 1 } },
  { id: 2, tipo: 'Escaneo completado', descripcion: 'El escaneo "Escaneo inicial scanme" finalizó.',       usuario: 'Ángel Gaxiola',    fecha: '03/11/2026 12:01', ip: '192.168.1.100', meta: { escaneoId: 1, duracion: '1 min 52 s' } },
  { id: 3, tipo: 'Inicio de sesión',   descripcion: 'Inicio de sesión exitoso.',                           usuario: 'Abraham Hernández', fecha: '04/11/2026 09:30', ip: '10.0.0.5',     meta: {} },
  { id: 4, tipo: 'Escaneo iniciado',   descripcion: 'Se inició el escaneo "Web contenedor".',              usuario: 'Abraham Hernández', fecha: '04/11/2026 11:58', ip: '10.0.0.5',     meta: { escaneoId: 2 } },
  { id: 5, tipo: 'Cierre de sesión',   descripcion: 'El usuario cerró sesión.',                            usuario: 'Ángel Gaxiola',    fecha: '04/11/2026 13:00', ip: '192.168.1.100', meta: {} },
  { id: 6, tipo: 'Registro',           descripcion: 'Nuevo usuario registrado.',                           usuario: 'Abraham Hernández', fecha: '01/11/2026 08:00', ip: '10.0.0.5',     meta: {} },
];

const COLOR_TIPO = {
  'Escaneo iniciado':   'info',
  'Escaneo completado': 'success',
  'Inicio de sesión':   'primary',
  'Cierre de sesión':   'secondary',
  'Registro':           'warning',
};

export default function Actividad() {
  const { usuario } = useAuth();
  const [detalleEvento, setDetalleEvento] = useState(null);

  if (!usuario) return <Navigate to="/login" replace />;

  // Los usuarios solo ven sus propios eventos; los admins ven todos
  const eventos = usuario.role === 'admin'
    ? EVENTOS
    : EVENTOS.filter((e) => e.usuario === usuario.name);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Actividad</h2>
        {usuario.role === 'admin' && (
          <span className="badge bg-dark">Vista administrador — todos los usuarios</span>
        )}
      </div>

      {/* Filtros */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <select className="form-select">
            <option>Todos los tipos</option>
            {Object.keys(COLOR_TIPO).map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        {usuario.role === 'admin' && (
          <div className="col-md-3">
            <select className="form-select">
              <option>Todos los usuarios</option>
              <option>Ángel Gaxiola</option>
              <option>Abraham Hernández</option>
            </select>
          </div>
        )}
        <div className="col-md-3">
          <input type="date" className="form-control" title="Desde" />
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" title="Hasta" />
        </div>
      </div>

      <div className="card">
        <table className="table mb-0 align-middle">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descripción</th>
              {usuario.role === 'admin' && <th>Usuario</th>}
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted py-4">Sin eventos registrados.</td></tr>
            )}
            {eventos.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <span className={`badge bg-${COLOR_TIPO[ev.tipo] ?? 'secondary'}`}>{ev.tipo}</span>
                </td>
                <td>{ev.descripcion}</td>
                {usuario.role === 'admin' && <td>{ev.usuario}</td>}
                <td className="text-nowrap">{ev.fecha}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setDetalleEvento(ev)}
                  >
                    Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginado (solo interfaz) */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <small className="text-muted">{eventos.length} eventos · página 1 de 1</small>
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item disabled"><span className="page-link">Anterior</span></li>
          <li className="page-item active"><span className="page-link">1</span></li>
          <li className="page-item disabled"><span className="page-link">Siguiente</span></li>
        </ul>
      </div>

      {/* Modal: detalle de evento */}
      {detalleEvento && (
        <Modal
          titulo={`Evento #${detalleEvento.id} — ${detalleEvento.tipo}`}
          onCerrar={() => setDetalleEvento(null)}
        >
          <dl className="row mb-0">
            <dt className="col-sm-4">Tipo</dt>
            <dd className="col-sm-8">
              <span className={`badge bg-${COLOR_TIPO[detalleEvento.tipo] ?? 'secondary'}`}>
                {detalleEvento.tipo}
              </span>
            </dd>
            <dt className="col-sm-4">Descripción</dt>
            <dd className="col-sm-8">{detalleEvento.descripcion}</dd>
            <dt className="col-sm-4">Usuario</dt>
            <dd className="col-sm-8">{detalleEvento.usuario}</dd>
            <dt className="col-sm-4">Fecha</dt>
            <dd className="col-sm-8">{detalleEvento.fecha}</dd>
            <dt className="col-sm-4">IP origen</dt>
            <dd className="col-sm-8"><code>{detalleEvento.ip}</code></dd>
            {Object.keys(detalleEvento.meta).length > 0 && (
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
