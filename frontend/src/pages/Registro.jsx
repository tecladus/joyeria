import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/api';

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  username: '',
  email: '',
  password: '',
  direccion: '',
  telefono: '',
  rolId: 1, // 1=COMPRADOR por defecto
};

function Registro({ onIniciarSesion }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'rolId' ? Number(value) : value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.username || !form.email || !form.password) {
      setError('Nombre, apellido, usuario, email y contraseña son obligatorios.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      const datos = await registrarUsuario(form);
      if (onIniciarSesion) {
        onIniciarSesion(datos);
      }
      navigate('/productos');
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro. Intenta con otro email.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 pt-32 pb-20">
      <div className="max-w-xl w-full bg-background border border-outline-variant/10 p-8 md:p-10 rounded-lg shadow-2xl space-y-8">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <h1 className="font-display-lg text-4xl text-on-surface tracking-wide">Membresía Aura</h1>
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">
            Crear cuenta · Únete al Atelier
          </p>
          <div className="w-12 h-[1px] bg-primary/45 mx-auto mt-4"></div>
        </div>

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container border border-error text-on-error-container p-4 rounded text-sm font-body-md">
              {error}
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="nombre">
                Nombre *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="apellido">
                Apellido *
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                required
                className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
                placeholder="Tu apellido"
                value={form.apellido}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Nombre de usuario */}
          <div className="flex flex-col">
            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="username">
              Nombre de usuario *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
              placeholder="Tu usuario (ej: juan123)"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correo electrónico */}
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="email">
                Correo electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="password">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dirección */}
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="direccion">
                Dirección
              </label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
                placeholder="Tu dirección física"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>

            {/* Teléfono */}
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="telefono">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
                placeholder="Ej: 11-1234-5678"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>
          </div>


          {/* Botón de envío */}
          <button
            type="submit"
            className="w-full py-4 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:hover:bg-on-surface uppercase tracking-widest mt-4"
            disabled={cargando}
          >
            {cargando ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Pie de Página */}
        <p className="text-center font-body-md text-sm text-secondary">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Registro;
