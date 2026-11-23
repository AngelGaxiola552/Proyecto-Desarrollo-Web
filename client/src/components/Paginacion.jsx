// Botones de paginado. El backend responde { items, total, page, pages }.
export default function Paginacion({ page, pages, total, onCambiar }) {
  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <small className="text-muted">{total} resultado(s) · página {page} de {Math.max(pages, 1)}</small>
      <div className="btn-group btn-group-sm">
        <button className="btn btn-outline-secondary" disabled={page <= 1} onClick={() => onCambiar(page - 1)}>
          Anterior
        </button>
        <button className="btn btn-outline-secondary" disabled={page >= pages} onClick={() => onCambiar(page + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
