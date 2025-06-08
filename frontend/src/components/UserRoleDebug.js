import React from 'react';

const UserRoleDebug = ({ user }) => {
  if (!user) {
    return (
      <div className="debug-container">
        <h3>User Debug Info</h3>
        <div className="debug-error">No user found</div>
      </div>
    );
  }

  return (
    <div className="debug-container">
      <h3>User Debug Info</h3>
      <div className="debug-item">
        <strong>User ID:</strong> {user.id || 'Not available'}
      </div>
      <div className="debug-item">
        <strong>Raw role:</strong> {JSON.stringify(user.role) || 'Not available'}
      </div>
      <div className="debug-item">
        <strong>Role type:</strong> {typeof user.role}
      </div>
      <div className="debug-item">
        <strong>Lowercase role:</strong> {user.role ? user.role.toLowerCase() : 'No role'}
      </div>
      <div className="debug-item">
        <strong>Is provider check:</strong> {user.role && user.role.toLowerCase() === 'provider' ? 'Yes' : 'No'}
      </div>
      <div className="debug-item">
        <strong>Is admin check:</strong> {user.role && user.role.toLowerCase() === 'admin' ? 'Yes' : 'No'}
      </div>
      <div className="debug-item">
        <strong>All user data:</strong>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      <style jsx>{`
        .debug-container {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 1rem;
          margin: 1rem 0;
          font-family: monospace;
        }
        .debug-item {
          margin-bottom: 0.5rem;
        }
        .debug-error {
          color: #dc3545;
          font-weight: bold;
        }
        pre {
          background-color: #e9ecef;
          padding: 0.5rem;
          border-radius: 4px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default UserRoleDebug; 