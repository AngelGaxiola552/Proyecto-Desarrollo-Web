// Pantalla 5: Nuevo escaneo.
// Formulario de opciones (solo interfaz), vista previa del comando,
// modal de confirmación con autorización y modal de progreso.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { TARGETS, PERFILES } from '../data/escaneos';

export default function NuevoEscaneo() {
  // Qué modal se muestra: null, 'confirmar' o 'progreso'
  const [modal, setModal] = useState(null);

  return (
    <div>
      <h2 className="mb-4">Nuevo escaneo</h2>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">1. Objetivo</h5>
              <div className="mb-3">
                <label className="form-label">Target</label>
                <select className="form-select">
                  {TARGETS.map((t) => <option key={t.id}>{t.alias} — {t.host}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Nombre del escaneo (opcional)</label>
                <input className="form-control" placeholder="Ej. Revisión semanal" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">2. Opciones</h5>
              <div className="mb-3">
                <label className="form-label">Perfil</label>
                <select className="form-select">
                  <option>Configuración manual</option>
                  {PERFILES.map((p) => <option key={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Tipo de escaneo</label>
                <select className="form-select">
                  <option>TCP connect (-sT)</option>
                  <option>TCP SYN (-sS)</option>
                  <option>UDP (-sU)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Puertos (-p)</label>
                <input className="form-control" defaultValue="1-1000" />
              </div>
              <div className="mb-3">
                <label className="form-label">Velocidad</label>
                <select className="form-select" defaultValue="-T3">
                  <option>-T2</option>
                  <option>-T3</option>
                  <option>-T4</option>
                </select>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="sv" />
                <label className="form-check-label" htmlFor="sv">Versiones de servicio (-sV)</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="os" />
                <label className="form-check-label" htmlFor="os">Detección de SO (-O)</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="pn" />
                <label className="form-check-label" htmlFor="pn">Sin ping previo (-Pn)</label>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <h5 className="mb-3">3. Vista previa del comando</h5>
          <pre className="bg-dark text-white p-3 rounded">nmap -sT -p 1-1000 -T3 -oX - scanme.nmap.org</pre>
          <p className="small text-muted">El servidor arma y valida el comando antes de ejecutarlo.</p>
          <button className="btn btn-primary w-100" onClick={() => setModal('confirmar')}>
            Ejecutar escaneo
          </button>
        </div>
      </div>

      {modal === 'confirmar' && (
        <Modal
          titulo="Confirmar escaneo"
          onCerrar={() => setModal(null)}
          pie={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setModal('progreso')}>Ejecutar</button>
            </>
          }
        >
          <p>Vas a escanear <strong>scanme.nmap.org</strong> con:</p>
          <pre className="bg-dark text-white p-2 rounded">nmap -sT -p 1-1000 -T3 -oX - scanme.nmap.org</pre>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="autorizacion" />
            <label className="form-check-label" htmlFor="autorizacion">
              Tengo autorización para escanear este objetivo
            </label>
          </div>
        </Modal>
      )}

      {modal === 'progreso' && (
        <Modal
          titulo="Escaneo en curso"
          onCerrar={() => setModal(null)}
          pie={
            <>
              <button className="btn btn-outline-danger" onClick={() => setModal(null)}>Cancelar escaneo</button>
              <Link className="btn btn-primary" to="/escaneos/1">Ver resultado</Link>
            </>
          }
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" />
            <p>scanme.nmap.org</p>
            <div className="progress mb-2">
              <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '60%' }}>60%</div>
            </div>
            <small className="text-muted">Estado: Sondeando puertos</small>
          </div>
        </Modal>
      )}
    </div>
  );
}
