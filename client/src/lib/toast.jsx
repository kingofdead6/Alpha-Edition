import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef();

  const toast = useCallback((text) => {
    setMsg(text);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 3400);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`toast fixed left-1/2 z-[90] max-w-[calc(100%-32px)] rounded-sm bg-ink px-[18px] py-3 text-[15px] text-paper shadow-[0_12px_30px_-10px_rgb(var(--shadow)/.5)] ${show ? 'show' : ''}`}
        style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
      >
        {msg}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
