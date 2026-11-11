// Contexto de sesión SIMULADO.
// Guarda en el estado de React la lista de usuarios y quién inició sesión.
import { createContext, useContext, useState } from 'react';
import { USUARIOS_INICIALES } from '../data/usuarios';

const AuthContext = createContext(null);

// Simula el tiempo que tardaría el servidor en responder
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(USUARIOS_INICIALES);
  const [usuario, setUsuario] = useState(null); // null = nadie ha iniciado sesión

  async function login(email, password) {
    await esperar(800);
    const encontrado = usuarios.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!encontrado) {
      throw new Error('Correo o contraseña incorrectos');
    }
    setUsuario(encontrado);
  }

  async function registrar({ name, email, password }) {
    await esperar(800);
    const correo = email.trim().toLowerCase();
    if (usuarios.some((u) => u.email === correo)) {
      throw new Error('Ese correo ya está registrado');
    }
    const nuevo = { id: Date.now(), name: name.trim(), email: correo, password, role: 'user' };
    setUsuarios([...usuarios, nuevo]);
    setUsuario(nuevo); // al registrarse queda con la sesión iniciada
  }

  function logout() {
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Atajo para usar el contexto en cualquier componente: const { usuario } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
