// "Cargando" con animación Lottie. Se muestra mientras termina una llamada al servidor.
import Lottie from 'lottie-react';
import animacion from '../assets/loader.json';

export default function Loader({ texto = 'Cargando...' }) {
  return (
    <div className="text-center py-4">
      <Lottie animationData={animacion} loop style={{ width: 90, height: 90, margin: '0 auto' }} />
      <p className="text-muted mb-0">{texto}</p>
    </div>
  );
}
