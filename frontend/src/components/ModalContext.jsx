import { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' or 'confirm'
    title: '',
    message: '',
    resolve: null
  });

  const showAlert = (message, title = 'Aviso') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'alert',
        title,
        message,
        resolve
      });
    });
  };

  const showConfirm = (message, title = 'Confirmar') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        resolve
      });
    });
  };

  const handleClose = (value) => {
    if (modalState.resolve) {
      modalState.resolve(value);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-background border border-outline-variant/20 max-w-md w-full p-8 rounded-xl luxury-shadow space-y-6 animate-scale-up border-primary/20">
            {/* Elegant Header Symbol */}
            <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto text-3xl font-light">
              {modalState.type === 'confirm' ? '◇' : '✦'}
            </div>

            <div className="space-y-3 text-center">
              <h3 className="font-display-lg text-2xl text-on-surface font-light tracking-wide">
                {modalState.title}
              </h3>
              <p className="font-body-md text-secondary leading-relaxed text-sm font-light">
                {modalState.message}
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              {modalState.type === 'confirm' ? (
                <>
                  <button
                    onClick={() => handleClose(false)}
                    className="flex-1 py-4 border border-outline/30 hover:border-primary hover:text-primary transition-all duration-300 font-label-caps text-xs uppercase tracking-widest text-center cursor-pointer rounded-sm bg-transparent text-on-surface"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleClose(true)}
                    className="flex-1 py-4 bg-on-surface text-background font-label-caps text-xs hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest cursor-pointer rounded-sm border border-transparent"
                  >
                    Confirmar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleClose(true)}
                  className="w-full py-4 bg-on-surface text-background font-label-caps text-xs hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest cursor-pointer rounded-sm border border-transparent"
                >
                  Aceptar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
