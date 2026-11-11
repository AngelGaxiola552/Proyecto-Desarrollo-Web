// Pantalla 3: Registro.
// Valida nombre, correo, contraseña (8+ caracteres, una mayúscula y un número),
// que las contraseñas coincidan y que se acepten los términos (modal).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  // Un solo objeto con todos los campos del formulario
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmar: '', terminos: false });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);

  // Actualiza el campo que cambió usando su atributo "name"
  function cambiar(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function validar() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'El nombre debe tener al menos 2 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Formato de correo inválido';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Debe incluir una mayúscula';
    else if (!/\d/.test(form.password)) e.password = 'Debe incluir un número';
    if (form.confirmar !== form.password) e.confirmar = 'Las contraseñas no coinciden';
    if (!form.terminos) e.terminos = 'Debes aceptar los términos de uso';
    return e;
  }

  async function enviar(evento) {
    evento.preventDefault();
    const e = validar();
    setErrores(e);
    setErrorServidor('');
    if (Object.keys(e).length > 0) return;

    setCargando(true);
    try {
      await registrar(form);
      navigate('/dashboard');
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setCargando(false);
    }
  }

  // Pequeño componente para no repetir el mismo bloque de input 4 veces
  const campo = (name, etiqueta, type = 'text') => (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>{etiqueta}</label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-control ${errores[name] ? 'is-invalid' : ''}`}
        value={form[name]}
        onChange={cambiar}
      />
      <div className="invalid-feedback">{errores[name]}</div>
    </div>
  );

  return (
    <div className="form-auth">
      <h2 className="mb-4">Crear cuenta</h2>

      {errorServidor && <div className="alert alert-danger">{errorServidor}</div>}

      <form onSubmit={enviar} noValidate>
        {campo('name', 'Nombre')}
        {campo('email', 'Correo', 'email')}
        {campo('password', 'Contraseña', 'password')}
        {campo('confirmar', 'Confirmar contraseña', 'password')}

        <div className="form-check mb-3">
          <input
            id="terminos"
            name="terminos"
            type="checkbox"
            className={`form-check-input ${errores.terminos ? 'is-invalid' : ''}`}
            checked={form.terminos}
            onChange={cambiar}
          />
          <label className="form-check-label" htmlFor="terminos">
            Acepto los{' '}
            <button type="button" className="btn btn-link p-0 align-baseline" onClick={() => setMostrarTerminos(true)}>
              términos de uso
            </button>
          </label>
          <div className="invalid-feedback">{errores.terminos}</div>
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
          {cargando ? (
            <><span className="spinner-border spinner-border-sm me-2" />Creando cuenta...</>
          ) : 'Registrarme'}
        </button>
      </form>

      <p className="mt-3 text-center">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>

      {mostrarTerminos && (
        <>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Términos de uso</h5>
                  <button className="btn-close" onClick={() => setMostrarTerminos(false)} />
                </div>
                <div className="modal-body">
                  <ol>
                    <li>Solo escanearás sistemas propios o con autorización.</li>
                    <li>No usarás NetScope para atacar sistemas.</li>
                    <li>Tus escaneos y confirmaciones quedan registrados en la bitácora.</li>
                  </ol>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setMostrarTerminos(false)}>Cerrar</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => { setForm({ ...form, terminos: true }); setMostrarTerminos(false); }}
                  >
                    Acepto
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" />
        </>
      )}
    </div>
  );
}
