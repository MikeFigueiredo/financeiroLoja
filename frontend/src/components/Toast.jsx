import { createContext, useContext, useState, useCallback } from 'react'
import ToastBootstrap from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, variant = 'success') => {
    setToast({ message, variant })
  }, [])

  const dataTest = toast?.variant === 'success' ? 'app_toast_sucesso' : 'app_toast_erro'

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
        {toast && (
          <ToastBootstrap
            data-test={dataTest}
            bg={toast.variant}
            show
            onClose={() => setToast(null)}
            delay={3500}
            autohide
          >
            <ToastBootstrap.Body className={toast.variant === 'success' ? 'text-white' : ''}>
              {toast.message}
            </ToastBootstrap.Body>
          </ToastBootstrap>
        )}
      </ToastContainer>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
