// Contexto de sesión: guarda quién inició sesión y habla con el backend.
// El servidor guarda la sesión en una cookie (JWT); aquí solo guardamos los datos del usuario.
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // null = nadie ha iniciado sesión
  const [revisando, setRevisando] = useState(true); // true mientras preguntamos si ya había sesión

  // Al abrir la página preguntamos al servidor si la cookie sigue siendo válida
  useEffect(() => {
    api('/users/me')
      .then((datos) => setUsuario(datos))
      .catch(() => setUsuario(null)) // 401: no hay sesión
      .finally(() => setRevisando(false));
  }, []);

  async function login(email, password) {
    const datos = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUsuario(datos);
  }

  async function registrar({ name, email, password }) {
    const datos = await api('/auth/register', { method: 'POST', body: { name, email, password } });
    setUsuario(datos); // al registrarse queda con la sesión iniciada
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUsuario(null);
  }

  // setUsuario se comparte para que Perfil pueda actualizar el header sin recargar
  return (
    <AuthContext.Provider value={{ usuario, setUsuario, revisando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Atajo para usar el contexto en cualquier componente: const { usuario } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
