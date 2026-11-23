// Funciones pequeñas para mostrar datos de forma legible.

export function fecha(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

export function duracion(ms) {
  if (ms == null) return '—';
  const segundos = Math.round(ms / 1000);
  if (segundos < 60) return `${segundos} s`;
  return `${Math.floor(segundos / 60)} min ${segundos % 60} s`;
}

// "lab, web" → ['lab', 'web']
export function textoAEtiquetas(texto) {
  return texto.split(',').map((t) => t.trim()).filter(Boolean);
}

// Nombre y color de Bootstrap para cada estado de escaneo
export const ESTADOS = {
  running:   { texto: 'En curso',   color: 'info' },
  completed: { texto: 'Completado', color: 'success' },
  failed:    { texto: 'Fallido',    color: 'danger' },
  cancelled: { texto: 'Cancelado',  color: 'secondary' },
};

// Validación de la lista de puertos: 22,80,443 o 1-1000
export const PATRON_PUERTOS = /^\d{1,5}(-\d{1,5})?(,\d{1,5}(-\d{1,5})?)*$/;
