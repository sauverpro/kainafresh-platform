import React from 'react';
import './PageLoader.css';

interface PageLoaderProps {
  text?: string;
}

export default function PageLoader({ text = "Retrieving fresh data..." }: PageLoaderProps) {
  return (
    <div className="page-loader-overlay">
      <div className="page-loader-brand">
        <span className="loader-logo-text">Kaina<span className="loader-logo-accent">Fresh</span></span>
      </div>

      <div className="loader-spinner-ring"></div>

      <span className="loader-text">{text}</span>
    </div>
  );
}
