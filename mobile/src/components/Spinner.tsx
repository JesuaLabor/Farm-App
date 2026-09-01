import React from 'react';

export const Spinner: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div className="spinner-wrap">
    <div className="spinner" style={{ width: size, height: size }} />
  </div>
);
