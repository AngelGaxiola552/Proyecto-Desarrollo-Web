// Función única para hablar con el backend (AJAX con fetch).
// Uso: const datos = await api('/targets', { method: 'POST', body: { alias, host } });
// Si el servidor responde con error, lanza un Error con un mensaje legible.

export async function api(ruta, { method = 'GET', body } = {}) {
  const respuesta = await fetch('/api' + ruta, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  // Algunas respuestas podrían no traer JSON; en ese caso usamos un objeto vacío
  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(mensajeDeError(datos.error) || 'Error al comunicarse con el servidor');
  }
  return datos;
}

// El backend valida con zod y, cuando falla, manda la lista de errores como texto JSON.
// Aquí sacamos solo el primer mensaje para mostrarlo al usuario.
function mensajeDeError(error) {
  if (!error) return '';
  try {
    const lista = JSON.parse(error);
    if (Array.isArray(lista) && lista[0]?.message) return lista[0].message;
  } catch {
    // no era JSON: es un mensaje normal
  }
  return error;
}

// Convierte un objeto de filtros en "?q=abc&page=2", omitiendo los vacíos.
export function query(filtros) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) params.append(clave, valor);
  });
  const texto = params.toString();
  return texto ? '?' + texto : '';
}
