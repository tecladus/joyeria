import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/api';

function Login({ onIniciarSesion }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setCargando(true);
    try {
      const datos = await loginUsuario(form.email, form.password);
      onIniciarSesion(datos);
      navigate('/productos');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 pt-32 pb-20">
      <div className="max-w-md w-full bg-background border border-outline-variant/10 p-8 md:p-10 rounded-lg shadow-2xl space-y-8">
        
        {/* Encabezado de la Tarjeta */}
        <div className="text-center space-y-2">
          <h1 className="font-display-lg text-4xl text-on-surface tracking-wide">Acceso Exclusivo</h1>
          <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">
            Aura Fine Jewelry · Círculo Privado
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

          {/* Campo Email */}
          <div className="flex flex-col">
            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="email">
              Correo electrónico o Usuario
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

          {/* Campo Contraseña */}
          <div className="flex flex-col">
            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-transparent border-0 border-b border-outline/30 py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface transition-colors"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:hover:bg-on-surface uppercase tracking-widest"
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Pie de Página */}
        <p className="text-center font-body-md text-sm text-secondary">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="text-primary hover:underline font-medium">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
