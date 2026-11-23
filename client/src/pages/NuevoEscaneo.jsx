// Pantalla 5: Nuevo escaneo.
// 1) Carga targets y perfiles, 2) pide la vista previa del comando (POST /api/scans/preview),
// 3) confirma la autorización y lanza el escaneo (POST /api/scans),
// 4) pregunta cada 3 segundos cómo va (GET /api/scans/:id) hasta que termine.
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMensaje } from '../context/MensajeContext';
import { api } from '../api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import OpcionesNmap, { OPCIONES_INICIALES, opcionesParaApi, opcionesDeApi, errorPuertos } from '../components/OpcionesNmap';
import { ESTADOS } from '../utils/formato';

export default function NuevoEscaneo() {
  const { usuario } = useAuth();
  const { mostrarMensaje } = useMensaje();
  const navigate = useNavigate();
  const [params] = useSearchParams(); // para leer ?target=ID cuando vienes desde Targets

  const [targets, setTargets] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [targetId, setTargetId] = useState(params.get('target') || '');
  const [perfilId, setPerfilId] = useState('');
  const [nombre, setNombre] = useState('');
  const [opciones, setOpciones] = useState(OPCIONES_INICIALES);
  const [comando, setComando] = useState('');
  const [errorTarget, setErrorTarget] = useState('');

  const [modal, setModal] = useState(null); // null, 'confirmar' o 'progreso'
  const [autorizado, setAutorizado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [escaneo, setEscaneo] = useState(null); // escaneo en curso (para el modal de progreso)

  // Cargar targets y perfiles al abrir la pantalla
  useEffect(() => {
    if (!usuario) return;
    Promise.all([api('/targets?limit=50'), api('/profiles?limit=50')])
      .then(([t, p]) => { setTargets(t.items); setPerfiles(p.items); })
      .catch((err) => mostrarMensaje('error', err.message))
      .finally(() => setCargando(false));
  }, []);

  const target = targets.find((t) => t.id === targetId);

  // Vista previa: cuando cambian el target o las opciones, esperamos 400 ms y pedimos el comando
  useEffect(() => {
    if (!target || errorPuertos(opciones)) {
      setComando('');
      return;
    }
    const espera = setTimeout(() => {
      api('/scans/preview', { method: 'POST', body: { host: target.host, options: opcionesParaApi(opciones) } })
        .then((datos) => setComando(datos.command))
        .catch(() => setComando(''));
    }, 400);
    return () => clearTimeout(espera);
  }, [targetId, opciones, targets]);

  // Mientras el escaneo esté "running", preguntamos al servidor cada 3 segundos
  useEffect(() => {
    if (!escaneo || escaneo.status !== 'running') return;
    const intervalo = setInterval(async () => {
      try {
        const actualizado = await api(`/scans/${escaneo.id}`);
        setEscaneo(actualizado);
        if (actualizado.status !== 'running') {
          mostrarMensaje(actualizado.status === 'completed' ? 'exito' : 'error', `Escaneo ${ESTADOS[actualizado.status].texto.toLowerCase()}`);
          navigate(`/escaneos/${actualizado.id}`);
        }
      } catch (err) {
        mostrarMensaje('error', err.message);
      }
    }, 3000);
    return () => clearInterval(intervalo); // se detiene al salir de la pantalla o cuando cambia el estado
  }, [escaneo]);

  if (!usuario) return <Navigate to="/login" replace />;
  if (cargando) return <Loader texto="Cargando targets y perfiles..." />;

  function elegirPerfil(id) {
    setPerfilId(id);
    const perfil = perfiles.find((p) => p.id === id);
    if (perfil) setOpciones(opcionesDeApi(perfil.options)); // copia las opciones del perfil al formulario
  }

  function abrirConfirmacion() {
    if (!targetId) {
      setErrorTarget('Elige un target');
      return;
    }
    if (errorPuertos(opciones)) {
      mostrarMensaje('error', 'Revisa el formato de los puertos');
      return;
    }
    setErrorTarget('');
    setAutorizado(false);
    setModal('confirmar');
  }

  async function ejecutar() {
    const datos = { targetId, options: opcionesParaApi(opciones), authorized: true };
    if (nombre.trim()) datos.name = nombre.trim();

    setEnviando(true);
    try {
      const respuesta = await api('/scans', { method: 'POST', body: datos }); // responde 202 con el id
      setEscaneo({ id: respuesta.id, status: respuesta.status, hostSnapshot: target.host });
      setModal('progreso');
    } catch (err) {
      mostrarMensaje('error', err.message); // p. ej. "No puedes tener más de 2 escaneos en curso"
      setModal(null);
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar() {
    try {
      await api(`/scans/${escaneo.id}/cancel`, { method: 'POST' });
      mostrarMensaje('exito', 'Escaneo cancelado');
      setEscaneo(null);
      setModal(null);
    } catch (err) {
      mostrarMensaje('error', err.message);
    }
  }

  return (
    <div>
      <h2 className="mb-4">Nuevo escaneo</h2>

      {targets.length === 0 && (
        <div className="alert alert-info">
          No tienes targets todavía. <Link to="/targets">Crea uno aquí</Link> para poder escanearlo.
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">1. Objetivo</h5>
              <div className="mb-3">
                <label className="form-label">Target</label>
                <select className={`form-select ${errorTarget ? 'is-invalid' : ''}`} value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}>
                  <option value="">Selecciona un target...</option>
                  {targets.map((t) => <option key={t.id} value={t.id}>{t.alias} — {t.host}</option>)}
                </select>
                <div className="invalid-feedback">{errorTarget}</div>
              </div>
              <div>
                <label className="form-label">Nombre del escaneo (opcional)</label>
                <input className="form-control" placeholder="Ej. Revisión semanal" maxLength={100}
                  value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">2. Opciones</h5>
              <div className="mb-3">
                <label className="form-label">Perfil</label>
                <select className="form-select" value={perfilId} onChange={(e) => elegirPerfil(e.target.value)}>
                  <option value="">Configuración manual</option>
                  {perfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <OpcionesNmap opciones={opciones} onChange={setOpciones} />
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <h5 className="mb-3">3. Vista previa del comando</h5>
          <pre className="bg-dark text-white p-3 rounded">{comando || 'Elige un target para ver el comando.'}</pre>
          <p className="small text-muted">El servidor arma y valida el comando antes de ejecutarlo.</p>
          <button className="btn btn-primary w-100" onClick={abrirConfirmacion}>
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
              {/* El botón solo se activa si se marca la casilla de autorización */}
              <button className="btn btn-primary" onClick={ejecutar} disabled={!autorizado || enviando}>
                {enviando ? 'Enviando...' : 'Ejecutar'}
              </button>
            </>
          }
        >
          <p>Vas a escanear <strong>{target?.alias}</strong> ({target?.host}) con:</p>
          <pre className="bg-dark text-white p-2 rounded">{comando}</pre>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="autorizacion"
              checked={autorizado} onChange={(e) => setAutorizado(e.target.checked)} />
            <label className="form-check-label" htmlFor="autorizacion">
              Tengo autorización para escanear este objetivo
            </label>
          </div>
        </Modal>
      )}

      {modal === 'progreso' && escaneo && (
        <Modal
          titulo="Escaneo en curso"
          onCerrar={() => setModal(null)}
          pie={
            <>
              <button className="btn btn-outline-danger" onClick={cancelar}>Cancelar escaneo</button>
              <Link className="btn btn-secondary" to="/escaneos">Ir al historial</Link>
            </>
          }
        >
          <Loader texto={`Escaneando ${escaneo.hostSnapshot}...`} />
          <p className="text-center small text-muted mb-0">
            Puedes cerrar esta ventana; el escaneo sigue en el servidor y lo verás en el historial.
          </p>
        </Modal>
      )}
    </div>
  );
}
