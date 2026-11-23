// Define qué pantalla se muestra según la URL.
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Loader from './components/Loader';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import NuevoEscaneo from './pages/NuevoEscaneo';
import Historial from './pages/Historial';
import DetalleEscaneo from './pages/DetalleEscaneo';
import Targets from './pages/Targets';
import Perfiles from './pages/Perfiles';
import Perfil from './pages/Perfil';
import Actividad from './pages/Actividad';
import AdminUsuarios from './pages/AdminUsuarios';

export default function App() {
  const { revisando } = useAuth();

  // Mientras preguntamos al servidor si ya había sesión, mostramos el loader
  if (revisando) return <Loader texto="Iniciando..." />;

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
          <Route path="/targets" element={<Targets />} />
          <Route path="/perfiles" element={<Perfiles />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/actividad" element={<Actividad />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
      </main>
    </>
  );
}
