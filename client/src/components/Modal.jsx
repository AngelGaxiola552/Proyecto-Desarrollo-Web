// Modal reutilizable con las clases de Bootstrap.
// Uso: {mostrar && <Modal titulo="..." onCerrar={() => setMostrar(false)} pie={botones}>contenido</Modal>}
export default function Modal({ titulo, onCerrar, children, pie, grande = false }) {
  return (
    <>
      <div className="modal d-block" tabIndex="-1">
        <div className={`modal-dialog modal-dialog-centered ${grande ? 'modal-lg' : ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button className="btn-close" onClick={onCerrar} />
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              {pie ?? <button className="btn btn-primary" onClick={onCerrar}>Cerrar</button>}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" />
    </>
  );
}
