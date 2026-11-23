// Mensajes de éxito y error que aparecen arriba a la derecha y se ocultan solos.
// Uso: const { mostrarMensaje } = useMensaje(); mostrarMensaje('exito', 'Target guardado');
import { createContext, useContext, useState } from 'react';

const MensajeContext = createContext(null);

export function MensajeProvider({ children }) {
  const [mensaje, setMensaje] = useState(null); // { tipo: 'exito' | 'error', texto }

  function mostrarMensaje(tipo, texto) {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 3500); // se quita a los 3.5 segundos
  }

  return (
    <MensajeContext.Provider value={{ mostrarMensaje }}>
      {children}
      {mensaje && (
        <div
          className={`alert ${mensaje.tipo === 'exito' ? 'alert-success' : 'alert-danger'} position-fixed shadow`}
          style={{ top: 70, right: 20, zIndex: 2000, minWidth: 260 }}
        >
          {mensaje.texto}
        </div>
      )}
    </MensajeContext.Provider>
  );
}

export function useMensaje() {
  return useContext(MensajeContext);
}
