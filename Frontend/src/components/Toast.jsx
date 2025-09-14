import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle
  };
  
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <Icon size={20} />
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
