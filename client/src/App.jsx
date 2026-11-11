// Define qué pantalla se muestra según la URL.
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import NuevoEscaneo from './pages/NuevoEscaneo';
import Historial from './pages/Historial';
import DetalleEscaneo from './pages/DetalleEscaneo';

export default function App() {
  return (
    <>
      <Header />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/escaneos/nuevo" element={<NuevoEscaneo />} />
          <Route path="/escaneos" element={<Historial />} />
          <Route path="/escaneos/:id" element={<DetalleEscaneo />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
