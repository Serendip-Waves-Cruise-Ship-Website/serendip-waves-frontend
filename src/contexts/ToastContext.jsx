import React, { useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { ToastContext } from './ToastContextDefinition';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Convenience methods
  const showSuccess = useCallback((message, duration = 4000) => {
    addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration = 6000) => {
    addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration = 5000) => {
    addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration = 4000) => {
    addToast(message, 'info', duration);
  }, [addToast]);

  // Custom confirm dialog replacement
  const showConfirm = useCallback((message, onConfirm, onCancel = null) => {
    const id = Date.now() + Math.random();
    const confirmToast = {
      id,
      message,
      type: 'confirm',
      onConfirm: () => {
        removeToast(id);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        removeToast(id);
        if (onCancel) onCancel();
      }
    };
    
    setToasts(prev => [...prev, confirmToast]);
  }, [removeToast]);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle style={{ color: '#28a745', fontSize: '1.2rem' }} className="me-2" />;
      case 'error':
        return <FaTimesCircle style={{ color: '#dc3545', fontSize: '1.2rem' }} className="me-2" />;
      case 'warning':
        return <FaExclamationTriangle style={{ color: '#fd7e14', fontSize: '1.2rem' }} className="me-2" />;
      case 'info':
        return <FaInfoCircle style={{ color: '#17a2b8', fontSize: '1.2rem' }} className="me-2" />;
      case 'confirm':
        return <FaExclamationTriangle style={{ color: '#fd7e14', fontSize: '1.2rem' }} className="me-2" />;
      default:
        return <FaInfoCircle style={{ color: '#17a2b8', fontSize: '1.2rem' }} className="me-2" />;
    }
  };

  const getToastVariant = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'light';
      case 'info':
        return 'info';
      case 'confirm':
        return 'light';
      default:
        return 'light';
    }
  };

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <ToastContainer 
        position="top-end" 
        className="p-3"
        style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          zIndex: 9999,
          maxWidth: '400px'
        }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={getToastVariant(toast.type)}
            onClose={() => removeToast(toast.id)}
            show={true}
            className="mb-2"
            style={{
              minWidth: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: 'none'
            }}
          >
            <Toast.Header 
              closeButton={toast.type !== 'confirm'}
              style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #e9ecef'
              }}
            >
              {getToastIcon(toast.type)}
              <strong className="me-auto" style={{ 
                color: toast.type === 'success' ? '#28a745' :
                       toast.type === 'error' ? '#dc3545' :
                       toast.type === 'warning' ? '#fd7e14' : 
                       '#17a2b8'
              }}>
                {toast.type === 'success' ? 'Success' :
                 toast.type === 'error' ? 'Error' :
                 toast.type === 'warning' ? 'Warning' :
                 toast.type === 'confirm' ? 'Confirm Action' : 'Information'}
              </strong>
            </Toast.Header>
            <Toast.Body className={`text-dark`}>
              <div className="mb-2">{toast.message}</div>
              
              {toast.type === 'confirm' && (
                <div className="d-flex gap-2 justify-content-end">
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={toast.onCancel}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={toast.onConfirm}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
