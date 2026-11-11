// Pantalla 1: Landing (pública).
// Incluye el modal "Acerca de y uso ético".
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <>
      <div className="py-5 text-center">
        <h1 className="mb-3">NetScope</h1>
        <p className="lead">
          Escáner de puertos con Nmap desde el navegador. Elige un objetivo, configura
          las opciones desde un menú y guarda los resultados para consultarlos después.
        </p>
        <div className="d-flex justify-content-center gap-2 mt-4">
          <Link className="btn btn-primary" to="/registro">Crear cuenta</Link>
          <Link className="btn btn-outline-secondary" to="/login">Iniciar sesión</Link>
          <button className="btn btn-link" onClick={() => setMostrarModal(true)}>
            Acerca de y uso ético
          </button>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>Uso responsable:</strong> escanear sistemas sin autorización puede ser ilegal.
        Usa NetScope solo con tu propia máquina, un laboratorio local o scanme.nmap.org.
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card h-100"><div className="card-body">
            <h5 className="card-title">Targets</h5>
            <p className="card-text">Guarda los objetivos que tienes autorizado escanear.</p>
          </div></div>
        </div>
        <div className="col-md-4">
          <div className="card h-100"><div className="card-body">
            <h5 className="card-title">Perfiles</h5>
            <p className="card-text">Reutiliza combinaciones de opciones de Nmap.</p>
          </div></div>
        </div>
        <div className="col-md-4">
          <div className="card h-100"><div className="card-body">
            <h5 className="card-title">Historial</h5>
            <p className="card-text">Consulta y filtra los resultados de tus escaneos.</p>
          </div></div>
        </div>
      </div>

      {/* Modal: se muestra solo cuando mostrarModal es true */}
      {mostrarModal && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Acerca de y uso ético</h5>
                  <button className="btn-close" onClick={() => setMostrarModal(false)} />
                </div>
                <div className="modal-body">
                  <p>Proyecto académico de Desarrollo de Aplicaciones y Servicios Web (ITESO).</p>
                  <ul>
                    <li>Antes de cada escaneo debes confirmar que tienes autorización.</li>
                    <li>No se permiten comandos libres: el servidor arma el comando con una lista blanca de opciones.</li>
                    <li>No se ejecutan scripts de ataque.</li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={() => setMostrarModal(false)}>Entendido</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </>
      )}
    </>
  );
}
