import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../redux/slices/themeSlice';

function SelectorTema() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const [abierto, setAbierto] = useState(false);
  const containerRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const opciones = [
    { id: 'light', label: 'Día', icon: 'light_mode' },
    { id: 'dark', label: 'Noche', icon: 'dark_mode' },
    { id: 'system', label: 'Automático', icon: 'brightness_medium' },
  ];

  const opcionActiva = opciones.find((opt) => opt.id === theme) || opciones[2];

  const handleSelect = (themeId) => {
    dispatch(setTheme(themeId));
    setAbierto(false);
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Botón Principal minimalista */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="material-symbols-outlined text-on-surface hover:text-primary transition-colors duration-300 text-2xl flex items-center justify-center cursor-pointer bg-transparent border-0 p-1 rounded-full focus:outline-none"
        title={`Tema: ${opcionActiva.label}`}
      >
        {opcionActiva.icon}
      </button>

      {/* Dropdown flotante premium */}
      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-background border border-outline-variant/20 rounded shadow-2xl py-1.5 z-50 animate-fade-in">
          {opciones.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`font-label-caps text-[10px] w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors duration-250 cursor-pointer bg-transparent border-0 uppercase tracking-widest ${
                theme === opt.id
                  ? 'text-primary font-bold bg-surface-container-low'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low/50'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {opt.icon}
              </span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectorTema;
