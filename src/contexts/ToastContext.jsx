import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const showSuccess = useCallback((message) => {
    addToast(message, 'success');
  }, [addToast]);

  const showError = useCallback((message) => {
    addToast(message, 'error');
  }, [addToast]);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      const id = Date.now();
      const handleConfirm = (result) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
        resolve(result);
      };
      setToasts(prev => [...prev, { 
        id, 
        message, 
        type: 'confirm',
        onConfirm: () => handleConfirm(true),
        onCancel: () => handleConfirm(false)
      }]);
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showConfirm }}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`toast show mb-2`}
            role="alert"
          >
            <div className={`toast-header bg-${toast.type === 'success' ? 'success' : toast.type === 'error' ? 'danger' : 'primary'} text-white`}>
              <strong className="me-auto">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Confirm'}
              </strong>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => removeToast(toast.id)}
              />
            </div>
            <div className="toast-body">
              {toast.message}
              {toast.type === 'confirm' && (
                <div className="mt-2 pt-2 border-top">
                  <button 
                    className="btn btn-primary btn-sm me-2"
                    onClick={toast.onConfirm}
                  >
                    Confirm
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={toast.onCancel}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
