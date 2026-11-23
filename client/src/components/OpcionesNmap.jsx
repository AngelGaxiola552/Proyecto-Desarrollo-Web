// Formulario con las opciones de Nmap (lista blanca). Lo usan Perfiles y Nuevo escaneo.
// "opciones" es un objeto y "onChange" recibe el objeto ya modificado.
import { PATRON_PUERTOS } from '../utils/formato';

export const OPCIONES_INICIALES = {
  scanType: '-sT',
  modoPuertos: 'lista', // 'lista' usa -p, 'top' usa --top-ports
  ports: '1-1000',
  topPorts: 100,
  serviceVersion: false,
  osDetection: false,
  timing: 3,
  noPing: false,
  scripts: 'none',
};

// Convierte las opciones del formulario al formato que espera el backend
export function opcionesParaApi(o) {
  const { modoPuertos, ports, topPorts, ...resto } = o;
  return modoPuertos === 'lista' ? { ...resto, ports } : { ...resto, topPorts: Number(topPorts) };
}

// Hace lo contrario: de lo que guarda el backend a lo que usa el formulario
export function opcionesDeApi(o) {
  return { ...OPCIONES_INICIALES, ...o, modoPuertos: o.ports ? 'lista' : 'top' };
}

// Devuelve un mensaje si los puertos están mal escritos
export function errorPuertos(o) {
  if (o.modoPuertos === 'lista' && !PATRON_PUERTOS.test(o.ports)) return 'Formato: 22,80,443 o 1-1000 (sin espacios)';
  return '';
}

export default function OpcionesNmap({ opciones, onChange }) {
  const cambiar = (campo, valor) => onChange({ ...opciones, [campo]: valor });
  const error = errorPuertos(opciones);

  return (
    <>
      <div className="mb-3">
        <label className="form-label">Tipo de escaneo</label>
        <select className="form-select" value={opciones.scanType} onChange={(e) => cambiar('scanType', e.target.value)}>
          <option value="-sT">TCP connect (-sT)</option>
          <option value="-sS">TCP SYN (-sS, requiere root)</option>
          <option value="-sU">UDP (-sU, requiere root)</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Puertos</label>
        <select className="form-select mb-2" value={opciones.modoPuertos} onChange={(e) => cambiar('modoPuertos', e.target.value)}>
          <option value="lista">Lista o rango (-p)</option>
          <option value="top">Los más comunes (--top-ports)</option>
        </select>
        {opciones.modoPuertos === 'lista' ? (
          <>
            <input
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={opciones.ports}
              onChange={(e) => cambiar('ports', e.target.value.replace(/\s/g, ''))}
              placeholder="22,80,443 o 1-1000"
            />
            <div className="invalid-feedback">{error}</div>
          </>
        ) : (
          <select className="form-select" value={opciones.topPorts} onChange={(e) => cambiar('topPorts', Number(e.target.value))}>
            {[10, 100, 500, 1000].map((n) => <option key={n} value={n}>Top {n}</option>)}
          </select>
        )}
      </div>

      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Velocidad</label>
          <select className="form-select" value={opciones.timing} onChange={(e) => cambiar('timing', Number(e.target.value))}>
            <option value={2}>-T2 (lento)</option>
            <option value={3}>-T3 (normal)</option>
            <option value={4}>-T4 (rápido)</option>
          </select>
        </div>
        <div className="col">
          <label className="form-label">Scripts NSE</label>
          <select className="form-select" value={opciones.scripts} onChange={(e) => cambiar('scripts', e.target.value)}>
            <option value="none">Ninguno</option>
            <option value="default">default</option>
            <option value="safe">safe</option>
          </select>
        </div>
      </div>

      <div className="form-check">
        <input className="form-check-input" type="checkbox" id="sv" checked={opciones.serviceVersion} onChange={(e) => cambiar('serviceVersion', e.target.checked)} />
        <label className="form-check-label" htmlFor="sv">Versiones de servicio (-sV)</label>
      </div>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" id="os" checked={opciones.osDetection} onChange={(e) => cambiar('osDetection', e.target.checked)} />
        <label className="form-check-label" htmlFor="os">Detección de SO (-O, requiere root)</label>
      </div>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" id="pn" checked={opciones.noPing} onChange={(e) => cambiar('noPing', e.target.checked)} />
        <label className="form-check-label" htmlFor="pn">Sin ping previo (-Pn)</label>
      </div>
    </>
  );
}
