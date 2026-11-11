// Pantalla 6: Historial de escaneos.
// Búsqueda, filtros y paginado (solo interfaz), modal de edición y modal de borrado.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { ESCANEOS, TARGETS, COLOR_ESTADO } from '../data/escaneos';

export default function Historial() {
  const [editando, setEditando] = useState(null); // escaneo que se edita
  const [borrando, setBorrando] = useState(null); // escaneo que se borra

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Historial de escaneos</h2>
        <Link className="btn btn-primary" to="/escaneos/nuevo">Nuevo escaneo</Link>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input className="form-control" placeholder="Buscar por nombre, host o nota" />
        </div>
        <div className="col-md-2">
          <select className="form-select">
            <option>Todos los targets</option>
            {TARGETS.map((t) => <option key={t.id}>{t.alias}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select">
            <option>Todos los estados</option>
            <option>Completado</option>
            <option>En curso</option>
            <option>Fallido</option>
            <option>Cancelado</option>
          </select>
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" title="Desde" />
        </div>
        <div className="col-md-2">
          <select className="form-select">
            <option>Más recientes</option>
            <option>Más antiguos</option>
            <option>Mayor duración</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table className="table mb-0 align-middle">
          <thead>
            <tr><th>Nombre</th><th>Host</th><th>Estado</th><th>Fecha</th><th>Duración</th><th>Etiquetas</th><th></th></tr>
          </thead>
          <tbody>
            {ESCANEOS.map((e) => (
              <tr key={e.id}>
                <td><Link to={`/escaneos/${e.id}`}>{e.name}</Link></td>
                <td>{e.host}</td>
                <td><span className={`badge bg-${COLOR_ESTADO[e.status]}`}>{e.status}</span></td>
                <td>{e.fecha}</td>
                <td>{e.duracion}</td>
                <td>{e.tags.map((t) => <span key={t} className="badge bg-light text-dark me-1">#{t}</span>)}</td>
                <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => setEditando(e)}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setBorrando(e)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginado (solo interfaz) */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <small className="text-muted">5 escaneos · página 1 de 1</small>
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item disabled"><span className="page-link">Anterior</span></li>
          <li className="page-item active"><span className="page-link">1</span></li>
          <li className="page-item disabled"><span className="page-link">Siguiente</span></li>
        </ul>
      </div>

      {editando && (
        <Modal
          titulo="Editar escaneo"
          onCerrar={() => setEditando(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setEditando(null)}>Guardar</button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input className="form-control" defaultValue={editando.name} />
          </div>
          <div className="mb-3">
            <label className="form-label">Notas</label>
            <textarea className="form-control" rows="3" defaultValue={editando.notes} />
          </div>
          <div>
            <label className="form-label">Etiquetas (separadas por coma)</label>
            <input className="form-control" defaultValue={editando.tags.join(', ')} />
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
              <button className="btn btn-danger" onClick={() => setBorrando(null)}>Borrar</button>
            </>
          }
        >
          ¿Seguro que quieres borrar <strong>{borrando.name}</strong>? Esta acción no se puede deshacer.
        </Modal>
      )}
    </div>
  );
}
