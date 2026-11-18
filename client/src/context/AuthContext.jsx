// Contexto de sesión SIMULADO.
// Guarda en el estado de React la lista de usuarios y quién inició sesión.
// La lista de usuarios se persiste en localStorage para que los cambios del admin (18/Nov/2026)
// (crear, editar, borrar) sobrevivan recargas y reinicios del dev server.
import { createContext, useContext, useState } from 'react';
import { USUARIOS_INICIALES } from '../data/usuarios';

const AuthContext = createContext(null);
const LS_KEY = 'netscope_usuarios';

// Simula el tiempo que tardaría el servidor en responder
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Carga la lista desde localStorage; si no existe usa los datos iniciales del archivo.
function cargarUsuarios() {
  try {
    const guardados = localStorage.getItem(LS_KEY);
    if (guardados) return JSON.parse(guardados);
  } catch {
    // JSON corrupto: ignorar y usar los iniciales
  }
  return USUARIOS_INICIALES;
}

export function AuthProvider({ children }) {
  const [usuarios, setUsuariosState] = useState(cargarUsuarios);
  const [usuario, setUsuario] = useState(null); // null = nadie ha iniciado sesión

  // Wrapper que persiste en localStorage cada vez que se modifica la lista
  function setUsuarios(nuevaLista) {
    setUsuariosState(nuevaLista);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(nuevaLista));
    } catch {
      // localStorage lleno o no disponible: ignorar
    }
  }

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
    <AuthContext.Provider value={{ usuario, usuarios, setUsuarios, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Atajo para usar el contexto en cualquier componente: const { usuario } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
