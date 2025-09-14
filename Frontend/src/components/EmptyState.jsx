import React from 'react';

const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="empty-state">
    <Icon size={48} className="empty-icon" />
    <h3>{title}</h3>
    <p>{message}</p>
    {action && (
      <button onClick={action.onClick} className="btn btn-primary">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
